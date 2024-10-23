import {admin,functions} from "../FirebaseConfig";
import {DateHelper} from "../helper/DateHelper";
import {queryBuilder,queryBuilderCount,QueryHelper,helperOperator} from "../helper/QueryBuilder";

export const createCategory = functions.https.onRequest(async function(req,res) : Promise<void>{
    try{
        
        const categoryObject  =  {
            name: req.body.name,
            url: req.body.url,
            type: req.body.type,
            color: req.body.color,
            id: DateHelper.getCurrentTimestamp(),
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
        };


        await admin.firestore().collection("categories").doc(categoryObject.id).set(categoryObject);

        res.status(200).json({
            message: "Category created successfully",
            success: true,
            data: categoryObject
        });

    } catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            success: false,
            data: null
        });
    }
});


export const getCategories = functions.https.onRequest(async function(req,res) : Promise<void>{
    try{

        const query = req.body.query ?? [];
        const limit = req.body.limit ?? null;
        const lastDocumentID = req.body.lastDocumentID ?? null;
        const orderBy = req.body.orderBy ?? null;
        const direction = req.body.direction ?? 'desc';

        const queryConditions: QueryHelper[] = query.map((element: { field: string; value: string; operator: string }) => {
            const { field, value, operator } = element;
            return new QueryHelper(field, value, helperOperator(operator));
        });

        const [result, error] = await queryBuilder({
            collection: 'categories',
            query: queryConditions,
            limit: limit,
            lastDoumentID: lastDocumentID,
            orderBy: orderBy,
            direction: direction
        });


        const [count,countError] = await queryBuilderCount({
            collection: 'categories',
            query: queryConditions,
        });

        if(count ==null || result == null){
            res.status(500).json({
                message: error+'/n'+countError,
                success: false,
                data: [],
                count: 0,
                totalPage: 0,
                hasNextPage: false,
                lastDocumentID: null
            });
            return;
        }


        res.status(200).json({
            message: "Categories fetched successfully",
            success: true,
            data: result?.docs.map((doc) => doc.data()) ?? [],
            count: count,
            totalPage: limit == null ? 1 : Math.ceil(count! / limit),
            hasNextPage: result.empty? false : result?.docs.length < count!,
            lastDocumentID: result.empty? null : result?.docs[result?.docs.length - 1].id
        });

    } catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            success: false,
            data: [],
            count: 0,
            totalPage: 0,
            hasNextPage: false,
            lastDocumentID: null
        });
    }
});