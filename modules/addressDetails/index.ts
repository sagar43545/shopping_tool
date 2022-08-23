import { Router } from "express";
import { connectLogger, getLogger } from "log4js";
import addressController from "./addressDetailsController";
const router: Router = Router();
const loggerOptions = {
    level: 'info',
    format: (req, res, format) => format(`:remote-addr - ":method :url " :status ":referrer" ":user-agent"`)
}
const log = getLogger("AddressDetailController");

router.use('/addressDetail', connectLogger(log, loggerOptions),router);

router.get('/list', addressController.getAddressesList);
router.get('/:id', addressController.getAddressById);
router.post('/create', addressController.addNewAddress);
router.put('/update/:id', addressController.updateAddress);

module.exports = { router };
