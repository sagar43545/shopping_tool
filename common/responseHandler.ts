import * as express from 'express';
import ErrorException from './errorException';
export default class ResponseHandler{

    static setHandler(req:express.Request, res:express.Response, next:express.NextFunction) {
        // @ts-ignore
        let resp:any = res.__proto__;
        //arrow function can't be used as it works as a class method
        resp.sendResponse =  function(data:any, msg:string='') {
            return this.status(200).send({
                    status: 'Success',
                    message: msg,
                    data: data
                });
        };

        resp.sendHTMLContent =  function(THMLContent:any) {
            return this.status(200).send(THMLContent);
        };

        resp.redirectPage =  function(redirectUrl:string='') {
            return this.redirect(redirectUrl);
        };

        resp.downloadFile = function(fileUrl:string, fileName?:string){
            return this.download(fileUrl, fileName);
        }

        resp.sendFileToClient = function(fileUrl:string){
            return this.sendFile(fileUrl);
        }

        resp.sendError = function(error:ErrorException) {
            return this.status(error.status).send({
                    status:'Failure',
                    error: error.error
                });
        };
        next();
    }
}