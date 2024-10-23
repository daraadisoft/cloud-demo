import {admin} from "../FirebaseConfig";

export const generateLinkVerifyService = async function(link:string,email:string) : Promise<string> {
    const appCodeSetting = {
        url : link
    };
    const linkVerifyAccount = await admin.auth().generateEmailVerificationLink(email,appCodeSetting);
    return linkVerifyAccount;
}