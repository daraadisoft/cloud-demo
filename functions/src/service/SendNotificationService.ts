import {admin} from '../FirebaseConfig';
import { TokenMessage, TopicMessage, ConditionMessage } from 'firebase-admin/messaging';


export const sendNotificationService = async function(notification: Notification): Promise<void> {
    try{
        const message: { [key: string]: any } = {
            notification: {
                title: notification.title,
                body: notification.body
            },
            data: notification.data,
        };
    
        if (notification.token) {
            message.token = notification.token;
        }
    
        if (notification.topic) {
            message.topic = notification.topic;
        }
    
        const finalMessage:TokenMessage|TopicMessage|ConditionMessage = message as TokenMessage|TopicMessage|ConditionMessage;
    
        await admin.messaging().send(finalMessage);
    }
    catch(error){
        console.log(error);
    }
}


export interface Notification{
    title:string;
    body:string;
    topic:string|null;
    data:Object;
    token:string|null;
}