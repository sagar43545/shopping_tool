/**
 * Model gives common functions that are used in other models.The auditing of database operations are performed in this module
 * @module models/dbModel
 * @type {connectionInstance|exports}
 */

import * as mongoose from 'mongoose';
import MongoAccess from "./mongoConnection";
import { CONFIG } from '../config/vars';
import mongoosePaginate from 'mongoose-paginate';
import aggregatePaginate from 'mongoose-aggregate-paginate';
import commonFunctions from "./commonFunctions";

// Counter Schema
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },      // Collection name
    seqCount: { type: Number, default: 0 },     // Counter value
}, {collection: 'counters', versionKey: false});

// Audit schema
const auditSchema = new mongoose.Schema({
    action: { type: String, required: true },   // Action which we performed like create, update etc
    data: { type: String, required: true },     // Which we create/update
    coln: { type: String, required: true },     // Collection Name
    cond: { type: String, required: true },     // Condition
    userId: {  type: Number, required: false },     // Store User Id 
    userType: { type: String, required: false },   // Store User Type
    crtdOn: { type: Date,  default: Date.now }    // Created On Date
}, {collection: 'audits', versionKey: false});
MongoAccess.connect();

export default class DBModel{
    private mongoInstance = MongoAccess.getInstance();
    private countersModel;
    private auditModel;
    collectionObj:any;  
    collectionName:any;
    counter: any;
    strict: any;
    /**
     * Function to creates an object of the collection
     * @param collection {String} the collection name
     * @param dbSchema {object} the schema definition
     * @param counter {boolean} the counter for index
     * @param strict {boolean} the counter for index
     * @param writeConcern {boolean} the counter for index
     */
    constructor (collection: string, dbSchema: any, counter: boolean, strict: boolean, writeConcern: boolean= false){
        MongoAccess.connect().then((mongoInstance) => {
            if (mongoInstance) {
                this.mongoInstance = mongoInstance;
                this.countersModel = mongoInstance.model('counters', counterSchema);
                this.auditModel = mongoInstance.model('audits', auditSchema);
            }
            this.collectionName = collection;
            this.counter = counter;
            let options: mongoose.SchemaOptions = {'collection': collection, 'versionKey': false};
            if(!strict){
                options.strict = this.strict;
            }

            if(writeConcern){
                options.safe = { w: "majority", wtimeout: 5000 };
            }
            let accessSchema: any = new mongoose.Schema(dbSchema, options);
            accessSchema.plugin(mongoosePaginate);
            accessSchema.plugin(aggregatePaginate);
            this.collectionObj = this.mongoInstance.model(collection, accessSchema);
        });
    }
    
    /**
     * Function to creates a document, inserts a document in the collection
     * @param conn {object} the collection object
     * @param data {object} the object data to be in
     */
    public async insertRec (conn: any, data: object) {
        try {   
            const newRecord = conn(data);
            const leanObject: any = await newRecord.save();
            return leanObject.toObject();
        } catch (error) {
            throw error;
        }        
    }

    /**
     * Function to audit the action
     * @param coln {String} Collection updated
     * @param data {object} Data sent in request
     * @param cond {object} condition (for update/delete)
     * @param action {String} Action performed (Insert/update/d
     */
    public async addAudit(coln: string, data: any, cond: object, action: string) {
        try {
            //create the object to add
            const body = {
                coln : coln,
                data : JSON.stringify(data),
                cond : JSON.stringify(cond),
                action : action
            }
            // return await this.insertRec(this.auditModel, body);
        } catch(error) {
            throw error;
        }
    };
    
    /**
     * Function returns all the documents of the collection
     * @param selectParams {string} list of fields to be returned. If blank, all fields will be passed.
     * @param isWrite {number} the field to read from which db
     */
    public async getAll(selectParams: any, isWrite:boolean= false) {
        let query = isWrite? this.collectionObj.find() : this.collectionObj.find().read('sp');
        if(selectParams) {
            query.select(selectParams);
        }
        return await query.lean();
    };
    
    /**
     * Function finds a list using group by
     * @param conditions {object} the condition to be passed for grouping and where cond
     * @param isWrite {number} the field to read from which db
     */
    public async getAggregate (conditions: object, isWrite:boolean= false) {
        // if (isWrite) {
        //     return await this.collectionObj.aggregate([conditions]).exec();
        // }
        return await this.collectionObj.aggregate([conditions]).read('sp').exec();
    };

    /**
     * Function finds a list using aggregation with allow disk use
     * @param conditions {object} the condition to be passed for grouping and where cond
     * @param isWrite {number} the field to read from which primary db
     */
    public async aggregateWithAllowDiskUse (conditions: object, isWrite:boolean= false){
        if (isWrite) {
            return await this.collectionObj.aggregate([conditions]).allowDiskUse(true).exec();
        }
        return await this.collectionObj.aggregate([conditions]).allowDiskUse(true).read('sp').exec();
    }
    
    /**
     * Function finds a document in the collection using its id
     * @param objId {String} object id of the document to
     * @param selectParams {String} fetch selected params only
     * @param isWrite {number} the field to read from which db
     */
    public async findById(objId: object, selectParams:any, isWrite:boolean= false) {
        const query = isWrite ? this.collectionObj.findById(objId) : this.collectionObj.findById(objId).read('sp');
        if(selectParams) {
            query.select(selectParams);
        }
        return await query.lean();
    };

    /**
     * Function finds a document in the collection using its auto increment id
     * @param id {int} id of the document to
     * @param selectParams {string} id of the document to
     * @param isWrite {number} the field to read from which db
     */
    public async findByAutoId(id: any, selectParams: any, isWrite:boolean= false){
        const query = isWrite ? this.collectionObj.findOne({id: id}) : this.collectionObj.findOne({id: id}).read('sp');
        if(selectParams) {
            query.select(selectParams);
        }
        return await query.lean();
    };
    
    /**
     * Finds a single document in the collection using criteria passed
     * @param conditions {object} the condition criteria{eml:'test@gmail.com'}
     * @param selectParams {string} the select parameters 'usr _id'
     * @param isWrite {number} the field to read from which db
     */
    public async findOne(conditions: object, selectParams: any, isWrite:boolean= false) {
        try {
            const query: any = isWrite ? this.collectionObj.findOne(conditions) : this.collectionObj.findOne(conditions).read('sp');
            if(selectParams) {
                query.select(selectParams);
            }
            return await query.lean();
        }  catch(error) {
            throw error;
        }
    };
    
    /*
    * Finds document by the criteria passed and the limit from the database
    * @*param conditions {JSON_obj} the condition criteria{eml:'test@gmail.com'}
    * @param selectParams {String} the select parameters 'usr_id email'
    * @param limit {int} the limit to decide row count, default
    * @param sort {JSON_obj} the sorting attribute
    * @param isWrite {number} the field to read from which db
    */
    public async find(conditions: object, selectParams: any, limit: number, sort: object, page: number, isWrite:boolean= false, inSensitiveSort = false) {
        const query = isWrite? this.collectionObj.find(conditions) : this.collectionObj.find(conditions).read('sp');
        sort = !Object.keys(sort).length ? { '_id': -1 } : sort;
        if(limit){
            query.limit(limit);
        }
        if(sort) {
            if(inSensitiveSort){
                query.collation({locale: "en" });
            }
            query.sort(sort);
        }
        if(page && page - 1 && limit){
            query.skip((page - 1) * limit);
        }
        if(selectParams) {
            query.select(selectParams);
        }
        return await query.lean();
    };
    
    /**
     * [findPerPage Gets only the specific page items from paginated array]
     */
    public async findPerPage(condition: object, selectParams: any, limit: number, sort: object, page: number, isWrite:boolean= false) {
        let query = isWrite? this.collectionObj.find(condition) : this.collectionObj.find(condition).read('sp');

        if(sort){
            query.sort(sort);
        }

        if(selectParams) {
            query.select(selectParams);
        }

        if(page && limit){
            query.skip(page * limit);
        }

        if(limit){
            query.limit(limit);
        }

        return await query.lean();
    }
        
    /**
     * Function to get records for paginations using the from and to fields
     * @param condition {object} the condition for select
     * @param selectParams {string} the fields to select
     * @param limit {number} the sort parameters
     * @param sort {object} the field to find from
     * @param page {number} the field to find
     * @param isWrite {number} the field to read from which db
     */
    public async findLimited(condition: any, selectParams: any, limit: number, sort: any, page: number, isWrite:boolean= false) {
        //todo need to check can we add .read('sp')
        const options = {};
        if(selectParams) {
            options['selectParams'] = selectParams;
        }
        if(limit) {
            options['limit'] = limit;
        }
        if(sort) {
            options['sort'] = sort;
        }
        if(page) {
            options['page'] = page;
        }
        if(!isWrite) {
            options['read'] = { pref: 'secondaryPreferred' };
        }
        const query = await this.collectionObj.paginate(condition, options);
        query.docs = query.docs.map( doc => doc.toObject() );
        return query;
    };

    public async aggregatePaginate(condition: any, limit: number, sort: any, page: number, isWrite:boolean= false) {
        const options = {};
        if(limit) {
            options['limit'] = limit;
        }
        if(sort) {
            options['sortBy'] = sort;
        }
        if(page) {
            options['page'] = page;
        }
        const aggregate = isWrite? this.collectionObj.aggregate(condition) : this.collectionObj.aggregate(condition).read('sp');
        return await this.collectionObj.aggregatePaginate(aggregate, options);
    }
    
    /**
     * Function creates a document, inserts a document in the collection with autoincrement id
     * @param data {object} the object data to be in
     */
    public async create (data: object) {
        if(this.counter == true) { // value set for product model
            const counter: any = await this.getNextSequence(this.collectionName);
            switch (this.collectionName) {
                case 'orders':
                    data['id'] = Math.floor(100000 + (Math.random() * 900000)) + "_" + counter.seqCount;
                    break;
                case  'products':
                    data['uniqueUrl'] += commonFunctions.getEncrypted(counter.seqCount);
                    break;
            }
        }
        const insertedRecord : any = await this.insertRec(this.collectionObj, data);
        delete insertedRecord['__v'];
        return insertedRecord;
    };
    
    /**
     * Function to updates a document
     * @param conditions {object} containing the where clause
     * @param update {object} contains the values to be set
     * @param options {object} can contain such as {upsert
     */
    public async update(conditions: object, update: object, options: object) {
        update['modifiedOn'] = new Date();
        try {
            const updatedData = await this.collectionObj.update(conditions, update, options);
            this.addAudit(this.collectionName, update, conditions, CONFIG.ACTION.update);
            return updatedData;
        } catch(error) {
            throw error;
        }
    };
    
    public async updateMany(conditions: object, update: object, options: object) {
        update['modifiedOn'] = new Date();
        try {
            const updatedData = await this.collectionObj.updateMany(conditions, update, options);
            this.addAudit(this.collectionName, update, conditions, CONFIG.ACTION.update);
            return updatedData;
        } catch(error) {
            throw error;
        }
    };

    /**
     * Function to delete a document
     * @param conditions {object} containing where
     */
    public async delete(conditions: object) {
        try {
            const removedDoc = await this.collectionObj.remove(conditions);
            this.addAudit(this.collectionName, '', conditions, CONFIG.ACTION.delete);
            return removedDoc;
        } catch(error) {
            throw error;
        }
    };
    
    /**
     * Function to soft delete a document by changing status
     * @param conditions {object} containing where
     */
    public async softDelete(conditions: object) {
        try {
            const update = {status: CONFIG.STATUS.Deleted}; update['modifiedOn'] = new Date();
            // this.addAudit(this.collectionName, update, conditions, CONFIG.ACTION.update);
            return await this.collectionObj.update(conditions, update, {});
        } catch(error) {
            throw error;
        }
    };
    
    /**
     * Function to soft delete a document by changing status by using Id
     * @param id {String} containing obj
     */
    public async softDeleteById(id: any) {
        try {
            const update = {status: CONFIG.STATUS.Deleted};
            update['modifiedOn'] = new Date();
            this.addAudit(this.collectionName, update, {id: id}, CONFIG.ACTION.update);
            return await this.collectionObj.findOneAndUpdate({id: id}, update, {new: true});
        } catch(error) {
            throw error;
        }
    };
    
    /**
     * Function finds document by id and updates doc
     * @param id {String} containing object Id
     * @param update {object} contains the set parameters
     * @param options {object} options include:
     * new: bool - true to return the modified document rather than the original. defaults to true
     * upsert: bool - creates the object if it doesn't exist. defaults to false.
     * sort: if multiple docs are found by the conditions, sets the sort order to choose which doc to update
     * select: sets the document fields to 
     */
    public async findByIdAndUpdate(id: any, update: object, options: object) {
        try {
            update['modifiedOn'] = new Date();
            if(!options['new']) options['new'] = true;
            let resp = await this.collectionObj.findByIdAndUpdate(id, update, options);
            await this.addAudit(this.collectionName, update, {"_id": id}, CONFIG.ACTION.update);
            return resp;
        } catch(error) {
            throw error;
        }
    };
    
    /**
     * Function finds document by Id and updates doc
     * @param id {String} containing object Id
     * @param update {object} contains the set parameters
     * @param options {object} options include:
     * new: bool - true to return the modified document rather than the original. defaults to true
     * upsert: bool - creates the object if it doesn't exist. defaults to false.
     * sort: if multiple docs are found by the conditions, sets the sort order to choose which doc to update
     * select: sets the document fields to 
     */
    public async findByAutoIdAndUpdate(id: any, update: object, options: object) {
        try {
            let conditions = {id: id};  update['modifiedOn'] = new Date();
            if(!options['new'])
                options['new'] = true;
            let resp = await this.collectionObj.findOneAndUpdate(conditions, update, options).exec();
            // let leanObject = resp.toObject();
            // leanObject.schema = null;
            await this.addAudit(this.collectionName, update, conditions, CONFIG.ACTION.update);
            return resp;
        } catch(error) {
            throw error;
        }
    };
    
    /**
     * Function finds document by id and updates document
     * @param conditions {object} the condition for selection criteria
     * @param update {object} contains the set parameters
     * @param options {object}  include:
     * new: bool - true to return the modified document rather than the original. defaults to true
     * upsert: bool - creates the object if it doesn't exist. defaults to false.
     * sort: if multiple docs are found by the conditions, sets the sort order to choose which doc to update
     * select: sets the document fields to 
     */
    public async findOneAndUpdate(conditions: object, update: object, options: object) {
        try {
            update['modifiedOn'] = new Date();
            if(!options['new']) options['new'] = true;
            let resp = await this.collectionObj.findOneAndUpdate(conditions, update, options);
            await this.addAudit(this.collectionName, update, conditions, CONFIG.ACTION.update);
            return resp;
        } catch(error) {
            throw error;
        }
    };
    
    /**
     * get next sequence gets the next sequence id from counter collection
     * @param sequenceName {String} name of the collection
     */
    public async getNextSequence(sequenceName: string) {
        try {
            const sequenceDocument = await this.countersModel.findOneAndUpdate(
                {_id: sequenceName},
                {$inc: {seqCount: 1}},
                {new: true}
            );
            if (sequenceDocument) {
                return sequenceDocument;
            }
            // if seqCount doesn't exists in counter model then insert new value (seqCount)
            return await this.countersModel.create({_id: sequenceName, seqCount: sequenceName != "questions" ? 1 : (CONFIG.DEFAULT_QUESTION_IDS_LIMIT + 1) });
        } catch (error) {
            throw error;
        }
    };
        
    /**
     * To get the sub document of a collection
     * @param1 match {object} eliminates parents with no children
     * @param2 unwind {object} considers useful documents
     * @param3 match2 {object} removes $unwind output that doesn't match,
     * @param4 isWrite {number} the field to read from which db
     */
    public async aggregate(match: object, unwind: any, match2: object, isWrite:boolean= false) {
        if (isWrite) {
            return await this.collectionObj.aggregate([
                { $match: match },
                { $unwind :unwind},
                { $match: match2 }]).exec();
        }
        return await this.collectionObj.aggregate([
            { $match: match },
            { $unwind :unwind},
            { $match: match2 }]).read('sp').exec();
    };
    
    /**
     * To get the sub document of a collection
     * @param1 match {object} eliminates parents with no children
     * @param2 project {object} to get required fields only,
     * @param3 isWrite {number} the field to read from which db
     */
    public async aggregateProjection(match: object, project: object, isWrite:boolean= false) {
        if (isWrite) {
            return await this.collectionObj.aggregate([
                { $match: match },
                { $project: project}]).exec();
        }
        return await this.collectionObj.aggregate([
            { $match: match },
            { $project: project}]).read('sp').exec();
    };
    
    
    /**
     * To get the count of sub document of a collection
     * @param1 match {object} eliminates parents with no children
     * @param2 unwind {object} considers useful documents
     * @param3 group {object} group by condition given and sums up,
     * @param4 isWrite {number} the field to read from which db
     */
    public async aggregateGroup(match: object, unwind: any, group: object, isWrite:boolean= false) {
        if (isWrite) {
            return await this.collectionObj.aggregate([
                { $match: match },
                { $unwind :unwind},
                { $group: group }]).exec();
        }
        return await this.collectionObj.aggregate([
            { $match: match },
            { $unwind :unwind},
            { $group: group }]).read('sp').exec();
    };
    
    /**
     * get count
     * @param condition {object} where conditions
     */
    public async getCount(condition: object) {
        return await this.collectionObj.count(condition);
    };

    /**
     * insert many
     * @param data {array of objects}
     */
    public async insertMany(data: object) {
        try {
            const insertedList = await this.collectionObj.insertMany(data)
            // this.addAudit(this.collectionName, data, {}, CONFIG.ACTION.insert);
            return insertedList;
        } catch(error) {
            throw error;
        }
    };
    
    public async findWithIndex(conditions: object, selectparams: any, limit: number, sort: any, hint: any, isWrite:boolean= false) {
        const query = isWrite? this.collectionObj.find(conditions) : this.collectionObj.find(conditions).read('sp');

        if(limit){
            query.limit(limit);
        }
        if(sort) {
            query.sort(sort);
        }
        if(selectparams) {
            query.select(selectparams);
        }
        if(hint) {
            query.hint(hint)
        }
        return query.lean();
    };

    public async distinct (attr: string) {
        return await this.collectionObj.distinct(attr);
    }

 }
