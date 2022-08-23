import DBModel from "../../common/dbModel";
import {CONFIG} from "../../config/vars";

const collectionName = 'products';
const productSchema = {
    // id: { type: Number, required: true },
    vendorId: { type: String, required: true },
    title: { type: String, required: true },
    categories: { type: Number, required: false },
    metaTitle: { type: String, required: true }, // product search key / content
    uniqueUrl: { type: String, required: true },
    summary: { type: String, required: true },
    images: { type: [String], required: true },
    stock: { type: Number, required: true,  minimum: 1, maximum: 100 },
    price: { type: Number, required: true, minimum: 1, maximum: 100000 },
    disconnect: { type: Number, required: true, minimum: 0, maximum: 100 },
    status: { type: Number, required: true, default: 2, enum: [1,2,3,4,5] }, // Approve, Under Review, De-Active
    statusReason: { type: String, required: false },
    createdOn: { type: Date, default: Date.now },
    modifiedOn: { type: Date, default: Date.now }
};

const paramToAvoid = "-__v -_id ";

class ProductModel {
    private baseModel: any;
    constructor() {
        this.baseModel = new DBModel(collectionName, productSchema, true, false, true);
    }

    async add(mappedJson: any) {
        try {
            const productJson: any = this.schemaMapping(mappedJson);
            productJson.uniqueUrl = CONFIG.PRODUCT_UNIQUE_URL + productJson.title.replace(/[^\w ]/g, '').replace(/[ ]/g, '_') + '/' ;
            return await this.baseModel.create(productJson);
        } catch(err) {
            throw err;
        }
    }

    async find(condition:any, selectedParams: string='', limit:number = 0, sort:object = {'id':1}, pageNo: number = 0,isWrite: boolean= false) {
        try{
            selectedParams = selectedParams || paramToAvoid;
            return await this.baseModel.find(condition, selectedParams, limit, sort, pageNo, isWrite);
        } catch (err) {
            throw err;
        }
    }

    async findById(id:number, selectedParams: string='') {
        try{
            selectedParams = selectedParams || paramToAvoid;
            return await this.baseModel.findByAutoId(id, selectedParams);
        } catch (err) {
            throw err;
        }
    }

    async update(condition:any, updateObj: any) {
        try{
            return await this.baseModel.findOneAndUpdate(condition,this.schemaMapping(updateObj),{});
        } catch(err) {
            throw err;
        }
    }

    async aggregateByCond(condition: any) {
        try {
            return await this.baseModel.getAggregate(condition);
        } catch (err) {
            throw err;
        }
    }

    async getCountByCondition(condition: any) {
        try {
            return await this.baseModel.getCount(condition);
        } catch (err) {
            throw err;
        }
    }

    schemaMapping(jsonObj){
        let mappedJson = {};
        Object.keys(productSchema).forEach((key)=>{
            if(jsonObj[key] || jsonObj[key] == 0 || jsonObj[key] == "") {
                if(typeof jsonObj[key] != "object"){
                    mappedJson[key] = jsonObj[key];
                } else {
                    mappedJson[key] = [];
                    for (let i = 0; i < jsonObj[key].length; i++) {
                        mappedJson[key][i] = {};
                        for (const arrObjKey in productSchema[key][0]) {
                            mappedJson[key][i][arrObjKey] = jsonObj[key][i][arrObjKey];
                        }
                    }
                }
            }
        })
        return mappedJson;
    }
}

export default new ProductModel();
