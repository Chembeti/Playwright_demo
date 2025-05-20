import { TestDataType } from './TestDataType';
import JsonTestDataRequest from './jsonTestDataRequest';
import JsonTestDataProvider from './testDataProvider.json';
import TestDataRequest from './testDataRequest';

export default class TestDataProvider {

    private readonly dataStoreType_local = "local";
    private readonly dataStoreType_json = "json";
    private jsonDataProvider: JsonTestDataProvider;

    constructor(){
        const extendedJsonCacheFileNameKeys = process.env.EXTEND_CACHE.split(",");
        const extendedJsonCacheFileNames: string[] = [];
        extendedJsonCacheFileNameKeys.forEach(key => {
            const fileName = process.env[key];
            if(!extendedJsonCacheFileNames.includes(fileName))
                extendedJsonCacheFileNames.push(fileName);
        });
        const DEFAULT_CACHE_TIMEOUT_IN_SEC = parseInt(process.env.DEFAULT_CACHE_TIMEOUT_IN_SEC.replaceAll(",","") || '');
        const DEFAULT_CACHE_TIMEOUT_IN_SEC_Number = Number.isInteger(DEFAULT_CACHE_TIMEOUT_IN_SEC) ? DEFAULT_CACHE_TIMEOUT_IN_SEC : 120;

        const EXTENDED_CACHE_TIMEOUT_IN_SEC = parseInt(process.env.EXTENDED_CACHE_TIMEOUT_IN_SEC.replaceAll(",","") || '');
        const EXTENDED_CACHE_TIMEOUT_IN_SEC_Number = Number.isInteger(EXTENDED_CACHE_TIMEOUT_IN_SEC) ? EXTENDED_CACHE_TIMEOUT_IN_SEC : 600;
        
        this.jsonDataProvider = new JsonTestDataProvider(
            DEFAULT_CACHE_TIMEOUT_IN_SEC_Number, EXTENDED_CACHE_TIMEOUT_IN_SEC_Number, extendedJsonCacheFileNames
        );
    }
    public getTestDataFromDataStore<T>(testDataRequest: TestDataRequest, returnSingleResult: boolean) {
        const parsedDataRefs = this.parseDataPath(testDataRequest.dataPath);

        const dataStoreType = parsedDataRefs[0];

        switch(dataStoreType){
            case this.dataStoreType_local:{
                //local data store means required data is mentioned in the feature file itself
                //hence return dataPath as the needed data
                return parsedDataRefs[2];
            }
            case this.dataStoreType_json:
                {
                    const jsonDataRequest = testDataRequest as JsonTestDataRequest;
                    jsonDataRequest.jsonFilePath = this.getTestDataFromKeyStore(parsedDataRefs[1]);
                    jsonDataRequest.jsonDataNodePath = parsedDataRefs[2];

                    if(jsonDataRequest.dataType == TestDataType.String)
                        return this.jsonDataProvider.getTestPrimitiveData(jsonDataRequest, returnSingleResult);
                    else
                        return this.jsonDataProvider.getTestData<T>(jsonDataRequest, returnSingleResult);
                }
            default:
                throw new Error("invalid data store type - " + dataStoreType);
        }
    }

    /**
     * 
     * @param dataPath 
     * @returns [string, string, string] where first item is dataStoreType, second item is dataStore and third item is data field location
     */
    public parseDataPath(dataPath: string):[string, string, string]{
        let dataStoreType = "";
        let dataStore = "";
        let location = "";

        const firstSplit = "://";
        const secondSplit = "#";

        const val1: string[] = dataPath.split(firstSplit);
        if(val1.length == 1){
            //if we are here means, dataPath does not contain dataStoreType hence treat it as local
            dataStoreType = this.dataStoreType_local;
            dataStore = ".";
            location = val1[0];
        }else{
            if(val1[0].toLowerCase() != this.dataStoreType_local && val1[0].toLowerCase() != this.dataStoreType_json)
                throw new Error("invalid data store type specified in parseDataPath method- " + val1[0]);

            dataStoreType = val1[0];

            if(val1[1].length == 0)
                throw new Error("invalid data format - missing data after " + firstSplit);

            const val2: string[] = val1[1].split(secondSplit);

            if(val2.length == 1){
                //if we are here means, dataPath does not contain dataLocation hence retrieve entire data from dataStore
                dataStore = val2[0];
                location = "";
            }else{
                if(val2[1].length == 0)
                    throw new Error("invalid data format - missing data after " + secondSplit);
                
                dataStore = val2[0];
                location = val2[1];
            }
        }

        return [dataStoreType, dataStore, location];
    }
    public getTestDataFromKeyStore(key:string) : string{
        //keystore is environment
        return process.env[key];
    }

    public close(){
        if(this.jsonDataProvider != null)
            this.jsonDataProvider.close();
    }
}