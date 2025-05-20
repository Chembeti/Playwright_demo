/*eslint @typescript-eslint/no-unsafe-assignment: "off" */
/*eslint @typescript-eslint/no-unsafe-call: "off" */
/*eslint @typescript-eslint/no-unsafe-member-access: "off" */
import * as fs from 'fs';
const jp = require('jsonpath');
const NodeCache = require('node-cache');

import { TestDataType } from "./TestDataType";
import JsonTestDataRequest from "./jsonTestDataRequest";
import { fixture } from '../../../hooks/fixture';


export default class JsonTestDataProvider {

    // stdTTL is the default time-to-live for each cache entry
    private jsonObjectCache: typeof NodeCache;
    constructor(defaultCacheTimeoutInSec: number, private extendedCacheTimeoutInSec: number, private extendedCacheFileNames: string[]){
        this.jsonObjectCache = new NodeCache({ stdTTL: defaultCacheTimeoutInSec, checkperiod: 120 });
    }
    /**
     * Returns test data object as per the parameter testDataRequest
     * @param testDataRequest 
     * @param returnSingleResult 
     * @returns test data
     * @description this method throws error only if either the test data file does not exist or contains malformed data. However, it does not throw error
     * even if T does not correspond to the data available inside the test data file. 
     */
    public getTestData<T>(testDataRequest: JsonTestDataRequest, returnSingleResult: boolean): T | T[] {
        
        let jsonString: string;
        /* eslint @typescript-eslint/no-explicit-any: "off" */
        let data: any;
    
        try{
            // try to get the data from the cache
            data = this.jsonObjectCache.get(testDataRequest.jsonFilePath);
            if(data == undefined || data == null)
            {
                //fixture.logger.info(`${testDataRequest.jsonFilePath} is not cached yet`);
                jsonString = fs.readFileSync(testDataRequest.jsonFilePath, 'utf-8');
                data = JSON.parse(jsonString);

                //store the data in the cache
                if(this.extendedCacheFileNames.includes(testDataRequest.jsonFilePath))
                    this.jsonObjectCache.set(testDataRequest.jsonFilePath, data, this.extendedCacheTimeoutInSec);
                else
                    this.jsonObjectCache.set(testDataRequest.jsonFilePath, data);
                
                //fixture.logger.info(`${testDataRequest.jsonFilePath} is cached now`);
            }
            // else{
            //     fixture.logger.info(`${testDataRequest.jsonFilePath} is retrieved from cached`);
            // }
        }catch(error){
            fixture.logger.error(`failed to get JSON data from ${testDataRequest.jsonFilePath}. Either file does not exist or it contains malformed data. Error: `);
            throw error;
        }

        if(testDataRequest.dataType == TestDataType.String && testDataRequest.jsonDataNodePath.length == 0)
            throw new Error("invalid json path for TestDataType.String type");

        if (testDataRequest.jsonDataNodePath.length == 0)
                return data as T; // Return entire data from the JSON file

        const records = jp.query(data, `$.${testDataRequest.jsonDataNodePath}`);
        if (returnSingleResult)
            return records[0] as T; //warning: no type conversion safety. Even if the JSON contains some data other than T, this conversion succeeds 
        else
            return records[0] as T[]; //warning: no type conversion safety. Even if the JSON contains some data other than T[], this conversion succeeds
    }

    public getTestPrimitiveData(testDataRequest: JsonTestDataRequest, returnSingleResult: boolean) {
        if(testDataRequest.dataType == TestDataType.String)
            return this.getTestData<string>(testDataRequest, returnSingleResult); 
    }

    public close(){
        if(this.jsonObjectCache != null)
        {
            this.jsonObjectCache.flushAll();
            this.jsonObjectCache.close();
        }
    }
}