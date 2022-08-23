import { Request, Response } from 'express';
import { getLogger } from 'log4js';
import { sign } from 'jsonwebtoken';
import commonFunctions from '../../common/commonFunctions';
import ErrorException from '../../common/errorException';
import { COMMON } from '../../common/messages';
import users from './usersModel';
import { CONFIG } from './../../config/vars';
import addressDetail from "../addressDetails/addressDetailsModel";
const log = getLogger('UserController');

class UserController {
    constructor() { }
    public async addNewUser(req: Request, res: Response){
        if(req.body.password != req.body.password){
            log.error("Both Password are not same...");
            return (<any>res).sendError(new ErrorException('BadRequestError', "Both password are not same..."));
        }
        try{
            const payloadObj: any = JSON.parse (JSON.stringify (req.body));
            console.log("payload ", payloadObj);
            payloadObj.password = commonFunctions.getHashValue(payloadObj.password)
            payloadObj.email = payloadObj.email.toLowerCase();
            const custResult = await users.add(payloadObj);
            if(payloadObj.userAddress && Object.keys(payloadObj.userAddress).length){
                const userAddress: any = await addressDetail.add (Object.assign (payloadObj.userAddress, {
                    userId: custResult.id,
                    byType: 'user',
                    addressType: payloadObj.addressType,
                    fullName: payloadObj.firstName + " " + payloadObj.lastName
                }));
                custResult.userAddress = userAddress;
                await users.update({id: custResult.id}, {'addressIds': userAddress.id});
            }
            return (<any>res).sendResponse(custResult, COMMON.RESPONSE.CREATED);
        } catch(error){
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }

    public async getUsersList(req: Request, res: Response){
        try {
            let selectParams = req.query.basicOnly ? 'id firstName lastName email mobile' : '';
            const userList = await users.find({ "companyId": (<any>req).user.companyId || CONFIG.DEFAULT_COMPANY_ID }, selectParams);
            return (<any>res).sendResponse(userList, COMMON.RESPONSE.FETCHED);
        } catch(error) {
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }

    public async updateUser(req: Request, res: Response){
        console.log("req.params.id => ", req.params.id);
        console.log("req.params.id => ",req.params.id.toString().length);
        if(!req.params.id || req.params.id.toString().length != 24){
            log.error("Invalid Params ID => " + req.params.id);
            return (<any>res).sendError(new ErrorException('BadRequestError', COMMON.ERROR.VALID_ID));
        }
        try{
            let updatedObj:any = commonFunctions.cleanJson(req.body, CONFIG.DEFAULT_CLEAN_KEYS);
            const updatedCustObj = await users.update({'_id': req.params.id}, updatedObj);
            return (<any>res).sendResponse(updatedCustObj, COMMON.RESPONSE.UPDATED);
        } catch(error) {
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }

    public async getUserById(req: Request, res: Response){
        console.log("req.params.id => ", req.params.id);
        console.log("req.params.id => ",req.params.id.toString().length);
        if(!req.params.id || req.params.id.toString().length != 24){
            log.error("Invalid Params ID => " + req.params.id);
            return (<any>res).sendError(new ErrorException('BadRequestError', COMMON.ERROR.VALID_ID));
        }
        try {
            let selectParams = req.query.basicOnly ? 'id firstName lastName email mobile' : '';
            const data = await users.findById(req.params.id, selectParams);
            return (<any>res).sendResponse(data, COMMON.RESPONSE.FETCHED);
        } catch(error) {
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }

    public async userLogin(req: Request, res: Response) {
        try {
            let reqHeaderObj: any = req.headers;
            // if(CONFIG.ENABLE_RECAPTCHA){
            //     const googleRecptchaResp: any = await commonFunctions.googleReCaptchaVerifyingAPI(reqHeaderObj.recaptcha);
            //     log.info("googleRecptchaResp => " + JSON.stringify(googleRecptchaResp))
            //     if(!googleRecptchaResp || !googleRecptchaResp.success){
            //         return (<any>res).sendError(new ErrorException('BadRequestError', "Google Captcha not Verified"));
            //     }
            // }
            const userObj = await users.findOne({ 'email': reqHeaderObj.email.toLowerCase() }, 'status firstName lastName email mobile password');
            console.log(userObj)
            console.log(reqHeaderObj.password)
            console.log(commonFunctions.getHashValue(reqHeaderObj.password))
            if (userObj && userObj.status == CONFIG.STATUS['Active'] && reqHeaderObj.password && commonFunctions.getHashValue(reqHeaderObj.password) === userObj.password) {
                userObj.authType = "user";
                delete userObj.password;
                let token = sign(userObj, CONFIG.jwtSecretKey, { expiresIn: CONFIG.jwtExpireTime });
                return (<any>res).sendResponse({token: token, userObj}, "User Authenticate Successfully...");
            }
            return (<any>res).sendError(new ErrorException('BadRequestError', 'Invalid Creditional Details'));
        } catch (error) {
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }


}

export default new UserController()
