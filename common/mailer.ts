import { CONFIG } from '../config/vars';
import nodemailer from 'nodemailer';
export class Mailer {
    static mailOptions: any = {};
    private transOptions: any;
    static transport: any;

    constructor() {
        if (!this.transOptions) {
            this.transOptions = Object.assign({}, CONFIG.MAILER)
        }
        if (!Mailer.mailOptions.from) {
            Mailer.mailOptions.from = this.transOptions.from;
        }
        Mailer.transport = nodemailer.createTransport(this.transOptions);
    }

    public sendEmail = async (to, subject, htmlBody, attachments?: any) => {
        Mailer.mailOptions.subject = subject;
        if (htmlBody) {
            Mailer.mailOptions.html = htmlBody;
        }
        Mailer.mailOptions.to = to;
        if (attachments && attachments.length) {
            Mailer.mailOptions.attachments = attachments;
        }
        return new Promise(async (resolve, reject) => {
            if(!CONFIG.EMAIL_SERVICE){
                return reject("Templary Email Service not available...");
            }
            Mailer.transport.sendMail(Mailer.mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return reject(error);
                }
                console.log('Email sent details: ' + JSON.stringify(info.envelope));
                console.log('Email Message sent: ' + info.response);
                return resolve(info);
            });
        });
    }
}
