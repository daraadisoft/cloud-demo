import {admin} from "../FirebaseConfig";
import { firestore } from "firebase-admin";


export const queryBuilder = async function({collection , lastDoumentID = null , query = [] , limit , orderBy, direction = 'desc'}
    :{collection:string,lastDoumentID:string|null,query:QueryHelper[],limit?:number,orderBy?:string,direction?: string}
) : Promise<[firestore.QuerySnapshot|null, string]>
{

    try{
    let db : firestore.Query= admin.firestore().collection(collection);

    query.forEach(q => {
        db = db.where(q.fields, q.operator, q.value);
    });

    if(orderBy){
        db = db.orderBy(orderBy, direction as firestore.OrderByDirection);
    }

    if(limit){
        db = db.limit(limit);
    }

    if(lastDoumentID){
        const lastDoc = await admin.firestore().collection(collection).doc(lastDoumentID).get();
        if(lastDoc.exists){
            db = db.startAfter(lastDoc);
        }
    }

    const result = await db.get();

    return [result,'success'];

    }catch(error){
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return [null,errorMessage];
    }

}





export class QueryHelper{
    fields: string;
    value:string;
    operator:QueryOperator;
    constructor(fields:string, value:string, operator:QueryOperator){
        this.fields = fields;
        this.value = value;
        this.operator = operator;
    }
}


export enum QueryOperator{
    EQUAL = "==",
    NOT_EQUAL = "!=",
    GREATER_THAN = ">",
    LESS_THAN = "<"
}