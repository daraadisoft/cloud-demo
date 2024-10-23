import { admin } from "../FirebaseConfig";


export const generateLinkResetPasswordService = async function(email:string) : Promise<string> {
    return await admin.auth().generatePasswordResetLink(email);
}