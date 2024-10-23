import { admin } from "../FirebaseConfig";
import { firestore } from "firebase-admin";


export const queryBuilder = async function ({ collection, lastDoumentID = null, query = [], limit, orderBy, direction = 'desc' }
    : { collection: string, lastDoumentID: string | null, query: QueryHelper[], limit?: number, orderBy?: string, direction?: string }
): Promise<[firestore.QuerySnapshot | null, string]> {

    try {
        let db: firestore.Query = admin.firestore().collection(collection);

        query.forEach(q => {
            db = db.where(q.field, q.operator, q.value);
        });

        if (orderBy) {
            db = db.orderBy(orderBy, direction as firestore.OrderByDirection);
        }

        if (limit) {
            db = db.limit(limit);
        }

        if (lastDoumentID) {
            const lastDoc = await admin.firestore().collection(collection).doc(lastDoumentID).get();
            if (lastDoc.exists) {
                db = db.startAfter(lastDoc);
            }
        }

        const result = await db.get();

        return [result, 'success'];

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return [null, errorMessage];
    }

}

export const queryBuilderCount = async function ({ collection, query = [] }
    : { collection: string, query: QueryHelper[] }
): Promise<[number | null, string]> {
    try {

        let db: firestore.Query = admin.firestore().collection(collection);

        query.forEach(q => {
            db = db.where(q.field, q.operator, q.value);
        });

        const result = await db.count().get();

        return [result.data().count, 'success'];

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return [null, errorMessage];
    }

}





export class QueryHelper {
    field: string;
    value: string;
    operator: QueryOperator;
    constructor(field: string, value: string, operator: QueryOperator) {
        this.field = field;
        this.value = value;
        this.operator = operator;
    }
}


export enum QueryOperator {
    EQUAL = "==",
    NOT_EQUAL = "!=",
    GREATER_THAN = ">",
    LESS_THAN = "<",
    GREATER_THAN_OR_EQUAL = ">=",
    LESS_THAN_OR_EQUAL = "<="
}

export const helperOperator = function (operator: string): QueryOperator {
    switch (operator) {
        case '==': return QueryOperator.EQUAL;
        case '!=': return QueryOperator.NOT_EQUAL;
        case '>': return QueryOperator.GREATER_THAN;
        case '<': return QueryOperator.LESS_THAN;
        case '>=': return QueryOperator.GREATER_THAN_OR_EQUAL;
        case '<=': return QueryOperator.LESS_THAN_OR_EQUAL;
        default: return QueryOperator.EQUAL;
    }
}