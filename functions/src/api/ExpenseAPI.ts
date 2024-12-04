import { admin, functions } from "../FirebaseConfig";
import { checkToken } from "../helper/CheckToken";
import { DateHelper } from "../helper/DateHelper";
import { helperOperator, queryBuilder, queryBuilderCount, QueryHelper, QueryOperator } from '../helper/QueryBuilder';
import * as dotenv from 'dotenv';
dotenv.config();

export const createExpense = functions.https.onRequest(async function (req, res): Promise<void> {
    try {

        const token = req.headers.authorization?.toString();

        const { categoryID, date, amount, description } = req.body;

        const decodedToken = await checkToken(token as string);

        if (decodedToken == null) {
            res.status(401).json({
                'message': 'Unauthorized',
                'success': false,
                'data': null
            });
            return;
        }

        const userId = decodedToken.uid;

        const [category, categoryError] = await queryBuilder(
            {
                collection: 'categories',
                query: [
                    new QueryHelper('id', categoryID, QueryOperator.EQUAL),
                ],
                lastDoumentID: null
            }
        );

        if (category == null) {
            res.status(200).json({
                'message': 'Category not found : ' + categoryError,
                'success': false,
                'data': null
            });
            return;
        }

        const id = DateHelper.getCurrentTimestamp();

        const type = category.docs[0].data().type;

        delete category.docs[0].data().type;

        const result = await admin.firestore().collection('expenses').doc(id).set({
            date: date,
            amount: amount,
            id: id,
            userId: userId,
            type: type,
            date_in_milisecond: DateHelper.convertDateToTimestamp(date),
            description: description,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
            category: category.docs[0].data()
        });

        res.status(200).json({
            'message': 'Expense created successfully',
            'success': true,
            'data': result
        });


    } catch (error) {
        res.status(500).json({
            'message': error instanceof Error ? error.message : 'An unknown error occurred',
            'success': false,
            'data': null
        });
    }
});

export const getExpenses = functions.https.onRequest(async function (req, res): Promise<void> {
    try {

        const token = req.headers.authorization?.toString();

        const decodedToken = await checkToken(token as string);

        if (decodedToken == null) {
            res.status(401).json({
                'message': 'Unauthorized',
                'success': false,
                'data': null,
                count: 0,
                totalPage: 0,
                hasNextPage: false,
                lastDocumentID: null,
            });
            return;
        }

        const userId = decodedToken.uid;
        const query = req.body.query ?? [];
        const limit = req.body.limit ?? null;
        const lastDocumentID = req.body.lastDocumentID ?? null;
        const orderBy = req.body.orderBy ?? null;
        const direction = req.body.direction ?? 'desc';

        const queryConditions: QueryHelper[] = query.map((element: { field: string; value: string; operator: string }) => {
            const { field, value, operator } = element;
            return new QueryHelper(field, value, helperOperator(operator));
        });

        queryConditions.push(new QueryHelper('userId', userId, QueryOperator.EQUAL));

        const [result, error] = await queryBuilder({
            collection: 'expenses',
            query: queryConditions,
            limit: limit,
            lastDoumentID: lastDocumentID,
            orderBy: orderBy,
            direction: direction
        });

        const [count, countError] = await queryBuilderCount({
            collection: 'expenses',
            query: queryConditions
        });

        if (result == null || count == null) {
            console.log(countError);
            res.status(200).json({
                'message': 'Expenses  : ' + error,
                'success': false,
                'data': null,
                count: 0,
                totalPage: 0,
                hasNextPage: false,
                lastDocumentID: null
            });
            return;
        }

        //result query
        const resultQuery = result?.docs.map((doc) => doc.data()) ?? [];

        //group by date
        const groupedTransactions = resultQuery.reduce<GroupedData[]>((acc, transaction) => {
            const typedTransaction = transaction as unknown as Transaction;
            const existingDate = acc.find(item => item.date === typedTransaction.date);

            if (existingDate) {
                if (typedTransaction.category.type === "EXPENSE") {
                    existingDate.expense += typedTransaction.amount;
                } else if (typedTransaction.category.type === "INCOME") {
                    existingDate.income += typedTransaction.amount;
                }
                existingDate.transactions.push(typedTransaction);
            } else {
                acc.push({
                    date: typedTransaction.date,
                    expense: typedTransaction.category.type === "EXPENSE" ? typedTransaction.amount : 0,
                    income: typedTransaction.category.type === "INCOME" ? typedTransaction.amount : 0,
                    transactions: [typedTransaction]
                });
            }

            return acc;
        }, []);


        //pie chart
        const pieChart: { name: string; amount: number; color: string; url: string, id: string }[] = [];
        groupedTransactions.forEach((group) => {
            group.transactions.forEach((transaction) => {
                const isExist = pieChart.find(item => item.name === transaction.category.name);
                if(isExist) {
                    isExist.amount += transaction.amount;
                } else {
                    pieChart.push({name: transaction.category.name, amount: transaction.amount, color: transaction.category.color, url: transaction.category.url, id: transaction.category.id});
                }

            });
        });

        pieChart.sort((a, b) => b.amount - a.amount);


        res.status(200).json({
            'message': 'Expenses fetched successfully',
            'success': true,
            'data': {
                groupedTransactions: groupedTransactions,
                totalExpense: groupedTransactions.reduce((acc, item) => acc + item.expense, 0),
                totalIncome: groupedTransactions.reduce((acc, item) => acc + item.income, 0),
                balance: groupedTransactions.reduce((acc, item) => acc + item.income - item.expense, 0),
                pieChart: pieChart
            },
            count: count,
            totalPage: limit == null ? 1 : Math.ceil(count! / limit),
            hasNextPage: result.empty ? false : result?.docs.length < count!,
            lastDocumentID: result.empty ? null : result?.docs[result?.docs.length - 1].id
        });



    } catch (error) {
        res.status(500).json({
            'message': error instanceof Error ? error.message : 'An unknown error occurred',
            'success': false,
            'data': null,
            count: 0,
            totalPage: 0,
            hasNextPage: false,
            lastDocumentID: null
        });
    }
});


interface Transaction {
    date: string;
    amount: number;
    category: {
        id: string;
        type: string;
        name: string;
        color: string;
        url: string;
    };
}

interface GroupedData {
    date: string;
    expense: number;
    income: number;
    transactions: Transaction[];
}


