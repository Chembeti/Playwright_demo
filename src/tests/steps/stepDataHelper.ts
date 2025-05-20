import { TestDataType } from "../../helpers/util/test-data/TestDataType";
import TestDataRequest from "../../helpers/util/test-data/testDataRequest";
import { fixture } from "../../hooks/fixture";

export default class StepDataHelper {
    
    static getDataStoreName(dataPath: string){
        const parsedDataRefs = fixture.testDataProvider.parseDataPath(dataPath);
        return parsedDataRefs[1];
    }
    static getSingleTestDataRecordForType(type: TestDataType, dataPath: string) {
        return this.getTestDataRecordForType(type, dataPath, true);
    }

    static getMultipleTestDataRecordsForType(type: TestDataType, dataPath: string) {
        return this.getTestDataRecordForType(type, dataPath, false);
    }

    private static getTestDataRecordForType(type: TestDataType, dataPath: string, returnSingleResult: boolean) {
        const dataRequest = new TestDataRequest();
        dataRequest.dataType = type;
        dataRequest.dataPath = dataPath;

        return fixture.testDataProvider.getTestDataFromDataStore(dataRequest, returnSingleResult);
    }
    static getSingleStringNodeData(dataPath: string): string{
        return StepDataHelper.getStringData(dataPath, true) as string;
    }

    static getStringNodeListData(dataPath: string): string[]{
        return StepDataHelper.getStringData(dataPath, false) as string[];
    }

    private static getStringData(dataPath: string, returnSingleResult: boolean): string | string[]{
        //const testDataProvider = pf.getTestDataProvider();
        const dataRequest = new TestDataRequest();
    
        dataRequest.dataType = TestDataType.String;
        dataRequest.dataPath = dataPath;
    
        const result = fixture.testDataProvider.getTestDataFromDataStore<TestDataType.String>(dataRequest, returnSingleResult);

        if(returnSingleResult)
            return result as string;
        else
            return result as string[];
    }
}