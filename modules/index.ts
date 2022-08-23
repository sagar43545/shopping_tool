import * as express from 'express';
import fs from 'fs';
import path from "path";
import { CONFIG } from './../config/vars';

export default class AppMiddleware {
    public router = express.Router();
    constructor(app: express.Application) {
        this.enableRouting(app);
        this.createDefaultFolder();
    }

    public enableRouting(app: express.Application) {
        fs.readdirSync(__dirname).forEach((file) => {
            const dirName = path.join(__dirname + '/' + file), stats = fs.lstatSync(dirName);
            if (stats.isDirectory()) {
                fs.readdirSync(dirName).forEach((file) => {
                    let fileName = file.substr(0, file.indexOf('.'));
                    if (fileName == 'index') {
                        let routerObj = require(path.join(dirName));
                        app.use(CONFIG.BASE_API_PATH, routerObj.router);
                    }
                });
            }
        });
    };

    private createDefaultFolder(){
        Object.keys(CONFIG.DEFAULT_FOLDERS).forEach((folderName: string) => {
            if (!fs.existsSync(CONFIG.VENDOR_USERS_FOLDER + '/' + folderName)){
                fs.mkdirSync(CONFIG.VENDOR_USERS_FOLDER + '/' + folderName);
            }
        });
    }
}
