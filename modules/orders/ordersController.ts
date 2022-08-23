import { Request, Response } from 'express';
import { getLogger } from 'log4js';
import ErrorException from '../../common/errorException';
import { COMMON } from '../../common/messages';
import order from './ordersModel';
import addressDetail from './../addressDetails/addressDetailsModel';
const log = getLogger('ProductController');

class OrdersController {
    constructor() { }

    public async getOrderById(req: Request, res: Response){
        if(!req.params.id || req.params.id.toString().length <= 8 || req.params.id.toString().indexOf('_') == -1){
            log.error("Invalid Params ID => " + req.params.id);
            return (<any>res).sendError(new ErrorException('BadRequestError', COMMON.ERROR.VALID_ID));
        }
        try {
            let selectParams = !req.query.withItems ? 'id userId status statusReason subTotal tax shippingCharge promoAmount disconnect orderTotal grandTotal itemsDiscount shippingDetails createdOn' : '';
            const orderObj = await order.findOne({'id': req.params.id, 'userId': (<any>req).user._id}, selectParams);
            return (<any>res).sendResponse(orderObj, COMMON.RESPONSE.FETCHED);
        } catch(error) {
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }

    public async genarateUserOrder(req: Request, res: Response){
        try{
            const payloadObj: any = req.body;
            payloadObj.userId = (<any>req).user._id;
            let vendorAddIds: any = payloadObj.orderItems.map((x:any) => x.vendorId);
            const vendorAdrsList = await addressDetail.find({'vendorId': {'$in': vendorAddIds}}, '_id vendorId');
            payloadObj.orderTotal = payloadObj.orderItems.reduce((a, b) => a + ((b.price|| 0) * (b.quantity || 1)), 0);
            payloadObj.orderItems.forEach((orderObj:any) => {
                let addIds = vendorAdrsList.find((x:any) => x.vendorId == orderObj.vendorId);
                orderObj.vendorAddressId = addIds ? addIds._id : "";
                orderObj.discount = payloadObj.itemsDiscount * (orderObj.price * orderObj.quantity) /  payloadObj.orderTotal;
                orderObj.subTotal =(orderObj.price * orderObj.quantity);
                return orderObj;
            })
            const productResp = await order.add(payloadObj);
            return (<any>res).sendResponse(productResp, COMMON.RESPONSE.CREATED);
        } catch(error){
            log.error(error);
            return (<any>res).sendError(new ErrorException('BadRequestError', error));
        }
    }
}

export default new OrdersController()
