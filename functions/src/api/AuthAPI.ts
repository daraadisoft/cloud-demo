import { admin, functions } from "../FirebaseConfig";
import {queryBuilder, QueryHelper,QueryOperator} from "../helper/QueryBuilder";
import { generateLinkVerifyService } from "../service/GenerateLinkVerifyService";
import {clickVeryAccount} from "../const/APIURL";
import {SendEmailOption,sendEmailService} from "../service/SendEmailService";
import { generateLinkResetPasswordService } from "../service/GenerateLinkResetPassword";
export const createUser = functions.https.onRequest(async function (req, res) : Promise<void>{
    try {

    
        if(req.method !== 'POST'){
            res.status(405).json({
                'message':'Method not allowed',
                'success':false,
                'data':null
            });
            return;
        }

        const {email , password , displayName , deviceToken} = req.body;


        const userDb = await queryBuilder({
            collection: 'users',
            query: [
                new QueryHelper('email', email, QueryOperator.EQUAL),
            ],
            limit: 1,
            lastDoumentID: null,
            orderBy: 'createdAt',
            direction: 'desc'
        });

        //error in query
        if(userDb[0] == null){
             res.status(200).json({
                'message':userDb[1],
                'success':false,
                'data':null
            });
            return;
        }

        //user already exists
        if(userDb[0].docs.length > 0){
            res.status(200).json({
                'message':'User already exists',
                'success':false,
                'data':null
            });
            return;
        }

    
        //password length
        if(password.length < 6){
            res.status(200 ).json({
                'message':'Password must be at least 6 characters long',
                'success':false,
                'data':null
            });
            return;
        }

        //create user
        const user = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: displayName,
            photoURL:deviceToken
        });

        res.status(200).json({
            'message':'User created successfully',
            'success':true,
            'data':user
        });
        return;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({
            'message': errorMessage,
            'success': false,
            'data': null
        });
        return;
    }
});


export const clickVerifyAccount = functions.https.onRequest(async function(req,res):Promise<void>{
    try {
        const eamil = req.query.email;
        const usersDb = await queryBuilder({
            collection: 'users',
            query: [
                new QueryHelper('email', eamil as string, QueryOperator.EQUAL),
            ],
            limit: 1,
            lastDoumentID: null,
            orderBy: 'createdAt',
            direction: 'desc'
        }); 



        if(usersDb[0] == null){
            res.status(500).send('User not found');
            return;
        }


        usersDb[0]!.docs[0].ref.update({
            emailVerified: true
        });

        res.status(200).send('User verified successfully');
        return;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).send(errorMessage);
        return;
    }
});


export const requestVerifyAccount = functions.https.onRequest(async function(req,res):Promise<void>{
    try {

        const email = req.body.email;

        const [userDb,errorMessage] = await queryBuilder({
            collection: 'users',
            query: [
                new QueryHelper('email', email, QueryOperator.EQUAL),
            ],
            limit: 1,
            lastDoumentID: null,
            orderBy: 'createdAt',
            direction: 'desc'
        });

        //error in query
        if(userDb == null){
            res.status(200).json({
                'message':errorMessage,
                'success':false,
                'data':null
            });
            return;
        }

        if(userDb.docs.length == 0){
            res.status(200).json({
                'message':'User not found',
                'success':false,
                'data':null
            });
            return;
        }

        //user already verified
        if(userDb.docs[0].data().emailVerified){
            res.status(200).json({
                'message':'User already verified',
                'success':false,
                'data':null
            });
            return;
        }

        const linkVerifyAccount = await generateLinkVerifyService(clickVeryAccount+`?email=${email}`,email);

        const sendEmailOption = new SendEmailOption(
            'sum.d@adisoft.io',
            email,
            'Verify account',
            'Click this link to verify your account : ' + linkVerifyAccount
        );

        await sendEmailService({sendEmailOption});

        res.status(200).json({
            'message':'Link sent successfully',
            'success':true,
            'data':linkVerifyAccount
        });
    } catch (error) {
        res.status(500).json({
            'message': error instanceof Error ? error.message : 'An unknown error occurred',
            'success': false,
            'data': null
        });
    }
});

export const requestResetPassword = functions.https.onRequest(async function(req,res):Promise<void>{
    try {
        
        const email = req.body.email;

        const [userDb,errorMessage] = await queryBuilder({
            collection: 'users',
            query: [
                new QueryHelper('email', email, QueryOperator.EQUAL),
            ],
            limit: 1,
            lastDoumentID: null,
            orderBy: 'createdAt',
            direction: 'desc'
        });

        //error in query
        if(userDb == null){
            res.status(200).json({
                'message':errorMessage,
                'success':false,
                'data':null
            });
            return;
        }

        if(userDb.docs.length == 0){
            res.status(200).json({
                'message':'User not found',
                'success':false,
                'data':null
            });
            return;
        }


        const linkVerifyAccount = await generateLinkResetPasswordService(email);

        const sendEmailOption = new SendEmailOption(
            'sum.d@adisoft.io',
            email,
            'Reset password',
            'Click this link to reset your password : ' + linkVerifyAccount
        );

        await sendEmailService({sendEmailOption});
        res.status(200).json({
            'message':'Link sent successfully',
            'success':true,
            'data':linkVerifyAccount
        });

    } catch (error) {
    
        res.status(500).json({
            'message': error instanceof Error ? error.message : 'An unknown error occurred',
            'success': false,
            'data': null
        });
    }   
});