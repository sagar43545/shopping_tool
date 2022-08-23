import multer from "multer";
import { CONFIG } from '../config/vars';
import fetch from 'cross-fetch';
import crypto from 'crypto-js';
import moment from 'moment';
import Hashids from 'hashids';
const hashids = new Hashids("SyologicResearch",10);
import md5 from 'md5';
class CommonFunctions {
    config = CONFIG;

    /** Function to delete json
     * @param obj {Object} the json object to be modified
     * @param paramToAvoid {JSON_obj} the parameters of object to delete
     */
    public cleanJson(obj: object, paramToAvoid: Array<string>) {
        for (let key in paramToAvoid) {
            delete obj[paramToAvoid[key]];
        }
        return obj;
    }

    public async getHashValue(textValue: string) {
        return md5(textValue)
    };

    public getEncrypted(txtToEncrypt: string) {
        return hashids.encode(parseInt(txtToEncrypt));
    };

    public getDecrypted(txtToDecrypt: string) {
        return hashids.decode(txtToDecrypt).toString();
    };


    /**  This object is used to store upload images * */
    private storage = multer.diskStorage({
        destination: (req, file, cb) => {
            let folderName: string;
            const fileSize = req.headers["content-length"];
            if (Number(fileSize) <= (2 * 1024 * 1024)) {
                req.destroy();
               return cb(new Error("File size is large, Please try with another file"), '')
            } 
            if(req.url.toLowerCase().indexOf('api/vendors/create') > -1){
                folderName = CONFIG.DEFAULT_FOLDERS['vendorsProof']
            } else if(req.url.toLowerCase().indexOf('api/vendors/addNewProduct') > -1){
                folderName = CONFIG.DEFAULT_FOLDERS['vendorsProducts']
            } else {
                folderName = CONFIG.DEFAULT_FOLDERS['users'];
            }
            cb(null,  CONFIG.VENDOR_USERS_FOLDER + "/" + folderName)
            // cb(null, CONFIG.BASE_FOLDER_PATH.toString().concat(req.baseUrl.toString().indexOf('/employee') >= 0 ? '/images' :'/uploads'))
        },
        filename: (req, file, cb) => {

            let fileName = new Date().getTime().toString().concat("_"+ Math.floor((Math.random() * 10000) + 1).toString());
            // if (CONFIG.ALLOWED_VIDEO_TYPES.indexOf(file.mimetype) < 0) {
            //     return cb(null, fileName);
            // }
            const extension = file.originalname.split('.')[1];
            fileName = fileName + '.' + extension;
            cb(null, fileName);
        }
    });

    /**  This object is used to handle upload functionality */
    public upload = multer({ 
        storage: this.storage, 
        limits: {'fileSize': (2 * 1024 * 1024) }
    }).any();

    public async createEncryption(dataJson) {
        try {
            dataJson = typeof dataJson == "object" ? JSON.stringify(dataJson) : dataJson;
            const ciphertext = crypto.AES.encrypt(dataJson, 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3').toString();
            return ciphertext.replace(/[/]/gi, '_bhu_');
        } catch (err) {
            throw err;
        }
    }

    public async createDecryption(cipherString: string) {
        try {
            cipherString = cipherString.replace(/_bhu_/gi, '/')
            const bytes = crypto.AES.decrypt(cipherString, 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3');
            let decryptedData = bytes.toString(crypto.enc.Utf8);
            try {
                decryptedData = JSON.parse(decryptedData);
            } catch (e) {
                // error in the above string (in this case, yes)!
            }
            return decryptedData;
        } catch (err) {
            throw err;
        }
    }

    public arrayObjectToObject(arrObj: any, key1: string, value: string) {
        let object: any = {};
        for (let index in arrObj) {
            object[arrObj[index][key1]] = !isNaN(parseInt(arrObj[index][value], 10)) ? parseInt(arrObj[index][value], 10) : arrObj[index][value];
        }
        return object;
    }

    public sortingArray(array: Array<any>, field: string) {
        array.sort((a: any, b: any) => {
            return a[field] - b[field]
        });
        return array;
    }

    public flipObject(obj: any) {
        let new_obj = {}
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                new_obj[obj[prop]] = !isNaN(parseInt(prop, 10)) ? parseInt(prop, 10) : prop;
            }
        }
        return new_obj;
    }

    schemaMapping(jsonObj, schemaObj){
        let mappedJson = {};
        Object.keys(schemaObj).forEach((key)=>{
            if(jsonObj[key] || jsonObj[key] == 0 || jsonObj[key] == "") {
                if(typeof jsonObj[key] != "object"){
                    mappedJson[key] = jsonObj[key];
                } else {
                    mappedJson[key] = [];
                    for (let i = 0; i < jsonObj[key].length; i++) {
                        mappedJson[key][i] = {};
                        for (const arrObjKey in schemaObj[key][0]) {
                            mappedJson[key][i][arrObjKey] = jsonObj[key][i][arrObjKey];
                        }
                    }
                }
            }
        })
        return mappedJson;
    }
}

export default new CommonFunctions()
