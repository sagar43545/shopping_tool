import express, { Request, Response, NextFunction } from 'express';
import AppMiddleware from './modules/index';
import MongoAccess from "./common/mongoConnection";
import ResponseHandler from './common/responseHandler';
import methodOverride from "method-override";
import { CONFIG } from './config/vars';
import { configure } from "log4js";
import device from "express-device";
import { getLogger } from 'log4js';
import ErrorException from './common/errorException';

class App {
    public app: express.Application = express();
    public log = getLogger('Application');

    constructor() {
        configure(CONFIG.LOGGER);
        this.app.use(methodOverride('X-Method-Override'));
        this.app.use(ResponseHandler.setHandler);
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ limit: '100mb', extended: true, parameterLimit: 50000 }));
        this.app.use(device.capture());
        // this.app.use('/api/images', express.static(CONFIG.BASE_FOLDER_PATH + '/images'));
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', (req.headers['access-control-request-method'] ? req.headers['access-control-request-method'] : '') as string);
            res.header('Access-Control-Allow-Headers', (req.headers['access-control-request-headers'] ? req.headers['access-control-request-headers'] : '') as string);
            res.header('Access-Control-Max-Age', (60 * 60 * 24 * 365).toString());
            // intercept OPTIONS method
            if (req.method === 'OPTIONS') {
                return res.sendStatus(200);
            }
            return next();
        })

        this.app.use("/", (req: Request, res: Response, next: NextFunction) => {
            if(CONFIG.MAINTENANCE_MODE && CONFIG.DOWN_TIME.getTime() >= new Date().getTime()){
                return (<any>res).sendError(new ErrorException('DownTimeError'));
            }
            next();
        });

        /* health check API */
        this.app.get('/start', (req: Request, res: Response) => {
            return res.sendStatus(200);
        });
        MongoAccess.connect().then((mongoInstance) => {
            (mongoInstance && mongoInstance.isConnected) ? new AppMiddleware(this.app) : process.exit();
        });
        process.on('unhandledRejection', (error: any) => {
            this.log.error('unhandledRejection', error);
        });
    }
}

export default new App().app;
