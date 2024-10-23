import { admin } from "../FirebaseConfig";
import { DecodedIdToken } from 'firebase-admin/auth';


export const checkToken = async function (token: string): Promise<DecodedIdToken | null> {
    try {
        return await admin.auth().verifyIdToken(token.replace('Bearer ', ''));
    } catch (error) {
        return null;
    }
}