import {admin,functions} from "../FirebaseConfig";
import {clickVeryAccount} from "../const/APIURL";
import {SendEmailOption,sendEmailService} from "../service/SendEmailService";
import {generateLinkVerifyService} from "../service/GenerateLinkVerifyService";
import * as dotenv from 'dotenv';
dotenv.config();

export const createUserEvent = functions.auth.user().onCreate(async function(user) : Promise<void>{
    try{
        const db = admin.firestore().collection('users').doc(user.uid);
    await db.set({
        email:user.email,
        id:user.uid,
        displayName:user.displayName,
        emailVerified:user.emailVerified,
        createdAt:admin.firestore.Timestamp.now(),
        updatedAt:admin.firestore.Timestamp.now(),
    });

    const linkVerifyAccount = await generateLinkVerifyService(clickVeryAccount+`?email=${user.email}`,user.email as string);

    const sendEmailOption = new SendEmailOption(
        'sum.d@adisoft.io',
        user.email as string,
        'Verify account',
        'Click this link to verify your account : ' + linkVerifyAccount
    );

    await sendEmailService({sendEmailOption});
    }catch(error){
        console.log(error);
    }
})
