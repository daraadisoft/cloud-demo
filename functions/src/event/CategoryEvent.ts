import { queryBuilder, QueryHelper, QueryOperator } from './../helper/QueryBuilder';
import { admin, functions } from "../FirebaseConfig";
import { firestore } from "firebase-admin";
import { QuerySnapshot, WriteResult } from "firebase-admin/firestore";


export const onUpdateCategory = functions.firestore.document('categories/{categoryID}').onUpdate(async function(change, context) : Promise<void|any> {
    try {

        const category = change.after.data();

        const limit = 500;

        let hasMore = true;

        let lastDocumentID : string | null = null;

        const db = admin.firestore();

        let batch = db.batch();

        let resultFinal : WriteResult[] | null = null;

        while (hasMore) {

            const [result, error] : [QuerySnapshot | null, string] = await queryBuilder({
                collection: 'expenses',
                query: [
                    new QueryHelper('category.id', category.id, QueryOperator.EQUAL),
                ],
                lastDoumentID: lastDocumentID,
                limit: limit
            });


            if (result == null || result.docs.length == 0) {
                console.log(`No more documents , ${error}`);
                hasMore = false;
                return;
            }

            lastDocumentID = result.docs[result.docs.length - 1].id;
            result.docs.forEach((doc : firestore.QueryDocumentSnapshot) => {
                batch.update(doc.ref, { category: category });
            });

            resultFinal = await batch.commit();
        }

        return resultFinal;

    } catch (error) {
        console.log(error instanceof Error ? error.message : 'An unknown error occurred');
    }
});
