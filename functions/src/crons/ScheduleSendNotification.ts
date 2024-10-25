import {sendNotificationService,Notification} from '../service/SendNotificationService';
import {functions} from '../FirebaseConfig';

export const scheduleSendNotification = functions.pubsub.schedule('every 15 minutes').onRun(async (context) => {
    try{
        const notification:Notification = {
            title:'Alert',
            body:'Don\'t forget to add your expenses',
            topic:'alert',
            data:{},
            token:null
        }
        await sendNotificationService(notification);
    }
    catch(error){
        console.log(error);
    }
});