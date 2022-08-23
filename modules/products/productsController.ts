import { Request, Response } from 'express';
import { getLogger } from 'log4js';
import commonFunctions from '../../common/commonFunctions';
import ErrorException from '../../common/errorException';
import { COMMON } from '../../common/messages';
import products from './productsModel';
import { CONFIG } from './../../config/vars';
const log = getLogger('ProductController');

class ProductController {
    constructor() { }
    public async addNewProduct(req: Request, res: Response){
        try{
            const productResp = await products.add(req.body);
            return (<any>res).sendResponse(productResp, COMMON.RESPONSE.CREATED);
        } catch(error){
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }

    public async getProductsList(req: Request, res: Response){
        try {
            let selectParams = req.query.basicOnly ? 'id firstName lastName email mobile' : '';
            const userList = await products.find({ "companyId": (<any>req).user.companyId || CONFIG.DEFAULT_COMPANY_ID }, selectParams);
            return (<any>res).sendResponse(userList, COMMON.RESPONSE.FETCHED);
        } catch(error) {
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }

    public async updateProduct(req: Request, res: Response){
        if(!req.params.id){
            return (<any>res).sendError(new ErrorException('BadRequestError'));
        }
        try{
            let updatedObj:any = commonFunctions.cleanJson(req.body, CONFIG.DEFAULT_CLEAN_KEYS);
            return (<any>res).sendResponse(updatedObj, COMMON.RESPONSE.UPDATED);
        } catch(error) {
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }

    public async getProductById(req: Request, res: Response){
        try {
            let selectParams = req.query.basicOnly ? 'id firstName lastName email mobile' : '';
            const data = await products.findById(Number(req.params.id), selectParams);
            return (<any>res).sendResponse(data, COMMON.RESPONSE.FETCHED);
        } catch(error) {
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }
}

export default new ProductController()
