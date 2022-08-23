import { Request, Response, NextFunction } from "express";
import { getLogger } from "log4js";
import ErrorException from './errorException';
import { CONFIG } from '../config/vars';
import { verify } from 'jsonwebtoken';
const log = getLogger('AuthValidator');

/** validate This function used to validate token for API calls */
export class AuthValidator {
    
    public static async validate(req: Request, res: Response, next: NextFunction) {
        if(!(<any>req).headers || !(<any>req).headers.authorization){
            return (<any>res).sendError(new ErrorException('UnAuthorizedError'));
        }
        try{
            const decodedObj = await verify((<any>req).headers.authorization.replace('Token ', ''), CONFIG.jwtSecretKey);
            if(req.url.toString().indexOf("user") >= 0){
                (<any>req).user = decodedObj;
            } else {
                (<any>req).vendor = decodedObj;
            }
            return next();
        } catch(error){
            log.error(error);
            return (<any>res).sendError(new ErrorException('UnAuthorizedError', 'Failed to authenticate token.')); 
        }
    }
}

