import { Router } from "express";
import { connectLogger, getLogger } from "log4js";
import { AuthValidator } from "../../common/authentication";
import productController from "./productsController";
import vendorsController from "./../vendors/vendorsController";
import commonFunctions from "../../common/commonFunctions";

const router: Router = Router();
const loggerOptions = {
    level: 'info',
    format: (req, res, format) => format(`:remote-addr - ":method :url " :status ":referrer" ":user-agent"`)
}
const log = getLogger("CustomerController");

router.use('/product', connectLogger(log, loggerOptions),router);

router.post('/create', AuthValidator.validate, commonFunctions.upload, vendorsController.addNewProduct);
router.put('/update/:id', productController.updateProduct);
router.get('/list', productController.getProductsList);
router.get('/:id', productController.getProductById);

module.exports = { router };
