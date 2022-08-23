import DBModel from "../../common/dbModel";

const collectionName = 'users';
const usersSchema = {
    // id: { type: Number, required: true },
    // userId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: false },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    originPassword: { type: String, required: true },
    addressIds: [{type: String, required: false}],
    status: { type: Number, required: true, default: 1, enum: [1,2]},
    createdOn: { type: Date, default: Date.now },
    modifiedOn: { type: Date, default: Date.now }
};
const paramToAvoid = "-__v -_id ";

class CustomerModel {
    private baseModel: any;
    constructor() {
        this.baseModel = new DBModel(collectionName, usersSchema, false, false, true);
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
            selectedParams = selectedParams || paramToAvoid;
            return await this.baseModel.findOne(condition, selectedParams);
        } catch (err) {
            throw err;
        }
    }

    async findById(id:string, selectedParams: string='') {
        try{
            selectedParams = selectedParams || paramToAvoid;
            return await this.baseModel.findById(id, selectedParams);
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
        Object.keys(usersSchema).forEach((key)=>{
            if(jsonObj[key] || jsonObj[key] == 0 || jsonObj[key] == "") {
                if(typeof jsonObj[key] != "object"){
                    mappedJson[key] = jsonObj[key];
                } else {
                    mappedJson[key] = [];
                    for (let i = 0; i < jsonObj[key].length; i++) {
                        mappedJson[key][i] = {};
                        for (const arrObjKey in usersSchema[key][0]) {
                            mappedJson[key][i][arrObjKey] = jsonObj[key][i][arrObjKey];
                        }
                    }
                }
            }
        })
        return mappedJson;
    }
}

export default new CustomerModel();
