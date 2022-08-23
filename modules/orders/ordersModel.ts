import DBModel from "../../common/dbModel";

const collectionName = 'orders';
const orderSchema = {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    status: { type: Number, required: true, enum: [1,2,3,4,5,6,7] }, // New, Checkout, COD, Paid, Failed, Shipped, Delivered, Returned, and Complete.
    statusReason: { type: String, required: false },
    subTotal: { type: Number, default: 0, required: true },
    tax: { type: Number, default: 0,required: false },
    shippingCharge: { type: Number, required: false },
    promocode: { type: String, required: false },
    promoAmount: { type: Number,  required: false },
    disconnect: { type: Number, required: false },
    orderTotal: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    itemsDiscount: { type: Number, required: false },
    shippingDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: false },
        mobile: { type: String, required: true },
        city: {type: String, required: true},
        state: {type: String, required: true},
        country: {type: String, required: true},
        fullAddress: {type: String, required: true},
        zipcode: {type: String, required: true},
    },
    orderItems: [{
        orderId: { type: String, required: true },
        orderStatus: { type: Number, required: true, default: 1, enum: [1,2,3,4] }, // On Review, Shipped, Delivered, Returned
        productId: { type: String, required: true },
        vendorId: { type: String, required: true },
        vendorAddressId: { type: String, required: true },
        price: { type: Number, default: 0, required: true },
        quantity: { type: Number, default: 1,required: true },
        discount: { type: Number, default: 0, required: true },
        subTotal: { type: Number, default: 0, required: true },
    }],
    createdOn: { type: Date, default: Date.now },
    modifiedOn: { type: Date, default: Date.now }
};

const paramToAvoid = "-__v -_id ";

class OrdersModel {
    private baseModel: any;
    constructor() {
        this.baseModel = new DBModel(collectionName, orderSchema, true, false, true);
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
        Object.keys(orderSchema).forEach((key)=>{
            if(jsonObj[key] || jsonObj[key] == 0 || jsonObj[key] == "") {
                if(typeof jsonObj[key] != "object"){
                    mappedJson[key] = jsonObj[key];
                } else {
                    mappedJson[key] = [];
                    for (let i = 0; i < jsonObj[key].length; i++) {
                        mappedJson[key][i] = {};
                        for (const arrObjKey in orderSchema[key][0]) {
                            mappedJson[key][i][arrObjKey] = jsonObj[key][i][arrObjKey];
                        }
                    }
                }
            }
        })
        return mappedJson;
    }
}

export default new OrdersModel();
