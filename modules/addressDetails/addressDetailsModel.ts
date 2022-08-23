import DBModel from "../../common/dbModel";

const collectionName = 'addressDetails';
const addressDetailSchema = {
    // id: {type: Number, required: true},
    userId: {type: String, required: false},
    vendorId: {type: String, required: false},
    byType: {type: String, required: true},
    addressType: {type: String, required: false, enum: ["Home", "Shop", "Office", "Others"]},
    storeName: {type: String, required: false},  // shop name
    fullName: {type: String, required: false},  // users first + last name
    city: {type: String, required: true},
    state: {type: String, required: true},
    country: {type: String, required: true},
    fullAddress: {type: String, required: true},
    zipcode: {type: String, required: true},
    status: {type: Number, required: true, default: 1, enum: [1, 2, 3]},
    createdOn: {type: Date, default: Date.now},
    modifiedOn: {type: Date, default: Date.now}
};
const paramToAvoid = "-__v -_id ";

class AddressDetailModel {
    private baseModel: any;

    constructor () {
        this.baseModel = new DBModel (collectionName, addressDetailSchema, false, false, true);
    }

    async add (mappedJson: any) {
        try {
            return await this.baseModel.create (this.schemaMapping (mappedJson));
        } catch (err) {
            throw err;
        }
    }

    async find (condition: any, selectedParams: string = '', limit: number = 0, sort: object = {'id': 1}, pageNo: number = 0, isWrite: boolean = false) {
        try {
            selectedParams = selectedParams || paramToAvoid;
            return await this.baseModel.find (condition, selectedParams, limit, sort, pageNo, isWrite);
        } catch (err) {
            throw err;
        }
    }

    async findById (id: number, selectedParams: string = '') {
        try {
            selectedParams = selectedParams || paramToAvoid;
            return await this.baseModel.findByAutoId (id, selectedParams);
        } catch (err) {
            throw err;
        }
    }

    async update (condition: any, updateObj: any) {
        try {
            return await this.baseModel.findOneAndUpdate (condition, this.schemaMapping (updateObj), {});
        } catch (err) {
            throw err;
        }
    }

    schemaMapping (jsonObj) {
        let mappedJson = {};
        Object.keys (addressDetailSchema).forEach ((key) => {
            if (jsonObj[key] || jsonObj[key] == 0 || jsonObj[key] == "") {
                if (typeof jsonObj[key] != "object") {
                    mappedJson[key] = jsonObj[key];
                } else {
                    mappedJson[key] = [];
                    for (let i = 0; i < jsonObj[key].length; i++) {
                        mappedJson[key][i] = {};
                        for (const arrObjKey in addressDetailSchema[key][0]) {
                            mappedJson[key][i][arrObjKey] = jsonObj[key][i][arrObjKey];
                        }
                    }
                }
            }
        })
        return mappedJson;
    }
}

export default new AddressDetailModel ();
