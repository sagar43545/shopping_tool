import DBModel from "../../common/dbModel";

const collectionName = 'vendors';
const vendorSchema = {
    // id: { type: Number, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: false, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    originPassword: { type: String, required: true },
    storeName: { type: String, required: true },  // shop name
    storeProof: { type: String, required: true },
    storeGSTIN: { type: String, required: true },
    storeAddressId: { type: String, required: false }, // address Id from addressDetails collection
    storeAddressProof: { type: String, required: false },
    isSameAddress: { type: Boolean, require: true, default: false },  // store and vendor both address same then it's true otherwise false
    vendorAddressId: { type: String, required: false },  // address Id from addressDetails collection
    status: { type: Number, required: true, default: 1, enum: [1, 2, 3]},
    createdOn: { type: Date, default: Date.now },
    modifiedOn: { type: Date, default: Date.now }
};
const paramToAvoid = "-__v ";

class vendorModel {
    private baseModel: any;
    constructor() {
        this.baseModel = new DBModel(collectionName, vendorSchema, false, false, true);
    }

    async add(mappedJson: any) {
        try {
            return await this.baseModel.create(this.schemaMapping(mappedJson));
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

    async findOne(condition:any, selectedParams: string='') {
        try{
            // selectedParams = selectedParams || paramToAvoid;
            console.log("condition => ", condition)
            console.log("selectedParams => ", selectedParams)
            return await this.baseModel.findOne(condition, selectedParams);
        } catch (err) {
            throw err;
        }
    }

    async findById(id:string, selectedParams: string='') {
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

    schemaMapping(jsonObj){
        let mappedJson = {};
        Object.keys(vendorSchema).forEach((key)=>{
            if(jsonObj[key] || jsonObj[key] == 0 || jsonObj[key] == "") {
                if(typeof jsonObj[key] != "object"){
                    mappedJson[key] = jsonObj[key];
                } else {
                    mappedJson[key] = [];
                    for (let i = 0; i < jsonObj[key].length; i++) {
                        mappedJson[key][i] = {};
                        for (const arrObjKey in vendorSchema[key][0]) {
                            mappedJson[key][i][arrObjKey] = jsonObj[key][i][arrObjKey];
                        }
                    }
                }
            }
        })
        return mappedJson;
    }
}

export default new vendorModel();
