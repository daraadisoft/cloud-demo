import { admin, functions } from "../FirebaseConfig";
import {queryBuilder, QueryHelper,QueryOperator} from "../helper/QueryBuilder";

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
             res.status(500).json({
                'message':userDb[1],
                'success':false,
                'data':null
            });
            return;
        }

        //user already exists
        if(userDb[0].docs.length > 0){
            res.status(500).json({
                'message':'User already exists',
                'success':false,
                'data':null
            });
            return;
        }

    
        //password length
        if(password.length < 6){
            res.status(500).json({
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