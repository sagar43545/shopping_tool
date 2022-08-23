import { exceptionConfig } from "./exception";

export default class ErrorException extends Error {
    exception = exceptionConfig;
    status: number;
    error: any;
    constructor(errorException: string, message: any='') {
        super(message);
        console.log("errorException => ", errorException)
        
        const exceptionError:any = JSON.parse(JSON.stringify(this.exception[errorException]));
        exceptionError.message = (message)? message: exceptionError.message;
        this.status = exceptionError.status;
        delete exceptionError.status;
        this.error =  exceptionError;
        if(typeof exceptionError.message == "object"){
            let tempObj = Object.assign({}, exceptionError.message);
            exceptionError.message = (tempObj.name == "MongoError" && tempObj.code == 11000 && tempObj.keyPattern && tempObj.keyPattern.email) ? 
                                    "There already exists an account registered with this email address, " : "The record already exists, ";
            exceptionError.message += exceptionError.supportMessage; 
            delete exceptionError.supportMessage; 
        }
    }
}
