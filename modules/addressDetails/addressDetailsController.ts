import { Request, Response } from 'express';
import { getLogger } from 'log4js';
import commonFunctions from '../../common/commonFunctions';
import ErrorException from '../../common/errorException';
import { COMMON } from '../../common/messages';
import addressDetail from './addressDetailsModel';
import { CONFIG } from './../../config/vars';
const log = getLogger('UserController');

class AddressDetailController {
    constructor() { }
    public async addNewAddress(req: Request, res: Response){
        try{
            const addressResult = await addressDetail.add(req.body);
            return (<any>res).sendResponse(addressResult, COMMON.RESPONSE.CREATED);
        } catch(error){
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }

    public async getAddressesList(req: Request, res: Response){
        try {
            let selectParams = req.query.basicOnly ? 'id firstName lastName email mobile' : '';
            const userList = await addressDetail.find({ }, selectParams);
            return (<any>res).sendResponse(userList, COMMON.RESPONSE.FETCHED);
        } catch(error) {
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }

    public async updateAddress(req: Request, res: Response){
        if(!req.params.id){
            return (<any>res).sendError(new ErrorException('BadRequestError'));
        }
        try{
            let cleanedObj:any = commonFunctions.cleanJson(req.body, CONFIG.DEFAULT_CLEAN_KEYS);
            const updatedObj = await addressDetail.update({'id': req.params.id}, cleanedObj);
            return (<any>res).sendResponse(updatedObj, COMMON.RESPONSE.UPDATED);
        } catch(error) {
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }

    public async getAddressById(req: Request, res: Response){
        try {
            let selectParams = req.query.basicOnly ? 'id firstName lastName email mobile' : '';
            const data = await addressDetail.findById(Number(req.params.id), selectParams);
            return (<any>res).sendResponse(data, COMMON.RESPONSE.FETCHED);
        } catch(error) {
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }
}

export default new AddressDetailController()
