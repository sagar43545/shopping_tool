import {Request, Response} from 'express';
import {getLogger} from 'log4js';
import commonFunctions from '../../common/commonFunctions';
import ErrorException from '../../common/errorException';
import {COMMON} from '../../common/messages';
import vendor from './vendorsModel';
import addressDetail from './../addressDetails/addressDetailsModel';
import {CONFIG} from './../../config/vars';
import {sign} from "jsonwebtoken";
import products from "../products/productsModel";
const log = getLogger ('vendorController');

class VendorController {
    constructor () {
    }

    public async addNewVendor (req: Request, res: Response) {
        try {
            const payloadObj: any = JSON.parse(JSON.stringify(req.body));
            if(!payloadObj.password || !payloadObj.confirmPassword || (payloadObj.password !== payloadObj.confirmPassword)){
                return (<any>res).sendError (new ErrorException ('BadRequestError', "password and confirmPassword are required and it's should be same"));
            }
            Object.assign(payloadObj, {
                'originPassword': payloadObj.confirmPassword
            });
            delete payloadObj.confirmPassword;
            payloadObj.email = payloadObj.email.toLowerCase();
            payloadObj.password = await commonFunctions.getHashValue(payloadObj.password);
            const vendorResult: any = await vendor.add(payloadObj);
            const vendorAddressObj: any = {
                isSameAddress: !!(payloadObj.isSameAddress)
            };
            const addressObj: any = {
                vendorId: vendorResult._id.toString(),
                byType: 'vendor',
                addressType: payloadObj.addressType,
                storeName: payloadObj.storeName
            };
            const storeAddress: any = await addressDetail.add(Object.assign(payloadObj.storeAddress, addressObj));
            vendorAddressObj.storeAddressId = storeAddress._id.toString();
            if (!vendorAddressObj.isSameAddress) {
                let tempAdd = Object.assign (payloadObj.vendorAddress, addressObj);
                delete tempAdd.storeName;
                tempAdd.fullName = payloadObj.firstName + " " + payloadObj.lastName;
                const vendorAddress: any = await addressDetail.add(tempAdd);
                vendorAddressObj.vendorAddressId = vendorAddress._id.toString();
            } else {
                vendorAddressObj.vendorAddressId = storeAddress._id.toString();
            }
            console.log("vendorAddressObj => ", vendorAddressObj)
            const updatedObj = await vendor.update({ '_id': vendorResult._id }, vendorAddressObj);
            return (<any>res).sendResponse (updatedObj, COMMON.RESPONSE.CREATED);
        } catch (error) {
            log.error (error);
            return (<any>res).sendError (new ErrorException ('BadRequestError', error));
        }
    }

    public async getVendorById (req: Request, res: Response) {
        if(!req.params.id || req.params.id.toString().length != 12){
            log.error("Invalid Params ID => " + req.params.id);
            return (<any>res).sendError(new ErrorException('BadRequestError', COMMON.ERROR.VALID_ID));
        }
        try {
            let selectParams = !req.query.fullDetail ? 'firstName, lastName, email, mobile, storeName, storeGSTIN, status' : '';
            const data = await vendor.findById(req.params.id, selectParams);
            return (<any>res).sendResponse (data, COMMON.RESPONSE.FETCHED);
        } catch (error) {
            log.error (error);
            return (<any>res).sendError (new ErrorException ('BadRequestError', error));
        }
    }

    public async vendorLogin(req: Request, res: Response) {
        try {
            
            let reqHeaderObj: any = req.headers;
           
            const vendorObj = await vendor.findOne({ 'email': reqHeaderObj.email.toLowerCase() }, 'firstName lastName email mobile password storeName storeGSTIN status');
            console.log(vendorObj)
            if (vendorObj && vendorObj.status == CONFIG.STATUS['Active'] && reqHeaderObj.password && commonFunctions.getHashValue(reqHeaderObj.password) === vendorObj.password) {
                vendorObj.authType = "vendor";
                let token = sign(vendorObj, CONFIG.jwtSecretKey, { expiresIn: CONFIG.jwtExpireTime });
                return (<any>res).sendResponse({token: token, vendorObj}, "Vendor Authenticate Successfully...");
            }
            return (<any>res).sendError(new ErrorException('BadRequestError', 'Invalid Creditional Details'));
        } catch (error) {
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }

    public async addNewProduct(req: Request, res: Response){
        try{
            const payloadObj = req.body;
            payloadObj.vendorId = (<any>req).vendor._id;
            const productResp = await products.add(payloadObj);
            return (<any>res).sendResponse(productResp, COMMON.RESPONSE.CREATED);
        } catch(error){
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }
}

export default new VendorController ()
