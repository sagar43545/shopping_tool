import { Router } from "express";
import { connectLogger, getLogger } from "log4js";
import orderController from "./ordersController";
import {AuthValidator} from "../../common/authentication";
const router: Router = Router();
const loggerOptions = {
    level: 'info',
    format: (req, res, format) => format(`:remote-addr - ":method :url " :status ":referrer" ":user-agent"`)
}
const log = getLogger("CustomerController");

router.use('/orders', connectLogger(log, loggerOptions),AuthValidator.validate, router);

router.post('/raisedOrder',  orderController.genarateUserOrder);
router.get('/:id', orderController.getOrderById);

module.exports = { router };
