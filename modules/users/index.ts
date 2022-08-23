import { Router } from "express";
import { connectLogger, getLogger } from "log4js";
import UsersController from "./usersController";
const router: Router = Router();
const loggerOptions = {
    level: 'info',
    format: (req, res, format) => format(`:remote-addr - ":method :url " :status ":referrer" ":user-agent"`)
}
const log = getLogger("UsersController");

router.use('/users', connectLogger(log, loggerOptions), (req, res, next) => {
    return next();
}, router);

router.post('/create', UsersController.addNewUser);
router.get('/authonicate', UsersController.userLogin);
router.put('/update/:id', UsersController.updateUser);
router.get('/list', UsersController.getUsersList);

router.get('/:id', UsersController.getUserById);



module.exports = { router };
