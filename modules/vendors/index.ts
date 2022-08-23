import { Router } from "express";
import { connectLogger, getLogger } from "log4js";
import vendorController from "./vendorsController";
import {AuthValidator} from "../../common/authentication";
import commonFunctions from "../../common/commonFunctions";
const router: Router = Router();
const loggerOptions = {
    level: 'info',
    format: (req, res, format) => format(`:remote-addr - ":method :url " :status ":referrer" ":user-agent"`)
}
const log = getLogger("CustomerController");

router.use('/vendors', connectLogger(log, loggerOptions), (req, res, next) => {
    console.log("in vendors");
    return next();
}, router);


router.post('/create', vendorController.addNewVendor);
router.post('/addNewProduct', AuthValidator.validate, commonFunctions.upload, vendorController.addNewVendor);
router.get('/authonicate', vendorController.vendorLogin);
// router.get('/:id', vendorController.getVendorById);

module.exports = { router };
