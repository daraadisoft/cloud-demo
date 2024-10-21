import nodemailer from "nodemailer";
import * as dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'sum.d@adisoft.io',
        pass:'dnhzlqdwnatmxevt'
    }
});

export const sendEmailService = async function({sendEmailOption}:{sendEmailOption:SendEmailOption}) : Promise<void>{
    try{
        const mailOptions = {
            from:sendEmailOption.from,
            to:sendEmailOption.to,
            subject:sendEmailOption.subject,
            text:sendEmailOption.text
        }
        await transporter.sendMail(mailOptions);
    }catch(error){
        console.log(error);
    }
}


export class SendEmailOption{
    from:string;
    to:string;
    subject:string;
    text:string;
    constructor(from:string, to:string, subject:string, text:string){
        this.from = from;
        this.to = to;
        this.subject = subject;
        this.text = text;
    }
}
