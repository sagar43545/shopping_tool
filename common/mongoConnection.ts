import mongoose from "mongoose";
import { CONFIG } from './../config/vars';
import {getLogger} from 'log4js';

const mongoLogger = getLogger('Mongo');

class MongoAccess {
    static mongoInstance:any;

    static async connect() {
        if(this.mongoInstance) { return this.mongoInstance }
        let dbString = "";
        // const secretConfig: any = await SecretManager.getSecret();
        if(CONFIG.env == 'development'){
            // dbString = "mongodb+srv://ankit76980:Z3oegtKJCCWol3fs@syologiccluster.vsbr1.mongodb.net/onlineShopDB?retryWrites=true&w=majority";
            dbString = 'mongodb://' + CONFIG.MONGO.hostName + ':' +  CONFIG.MONGO.mongoDBPort + "/" + CONFIG.MONGO.dbName;
        } else {
            dbString = 'mongodb://' + CONFIG.MONGO.userName + ':' + CONFIG.MONGO.password + '@' + CONFIG.MONGO.hostName + ':' +  CONFIG.MONGO.mongoDBPort + "/" + CONFIG.MONGO.dbName;
        }
        mongoose['Promise'] = global.Promise;
        //DeprecationWarning: Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` without the `useFindAndModify` option set to false are deprecated.
        //See: https://mongoosejs.com/docs/deprecations.html#-findandmodify-
        mongoose.set('useFindAndModify', false);
        this.mongoInstance = mongoose.createConnection(dbString, CONFIG.MONGO.option);
        // this.mongoInstance.on('error', console.error.bind(console, 'connection error:'));

        this.mongoInstance.on('error', () => {
            mongoLogger.error('Could not connect to MongoDB');
        });

        this.mongoInstance.on('disconnected', (err) => {
            mongoLogger.error('Lost MongoDB connection...', err);
            this.mongoInstance.connect();
        });
        //connectionInstance connected
        this.mongoInstance.once('open', () => {
            this.mongoInstance.isConnected = true;
            mongoLogger.info("MongoDb connected successfully");
        });
        mongoose.set('debug', CONFIG.MONGO.debug);
        return this.mongoInstance;
    }

    static getInstance() {
        return this.mongoInstance;
    }
}
export default MongoAccess;
