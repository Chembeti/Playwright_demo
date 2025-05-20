import { TestDataType } from "./TestDataType";

/**Base class for Test Data Request */
export default class TestDataRequest {
    dataType: TestDataType;

    /** dataStore can be a file in the case of JSON data, table name in the case of SQL data, etc., */
    //dataStore: string;

    /** dataPath will be exact location where data is available in the store */
    /** dataPath contains location of data in the following format
     * dataStoreType://dataStore#dataLocation where
     * dataStoreType can be any supported protocol (for now local or json)
     * dataStore should be '.' for local, file-path-identifier for JSON file. Note: file-path-identifier must be a Key in the environment file
     * dataLocation should be the exact path; for 'local', it will be the direct value
     * Note 1: for local, both dataStoreType and dataStore can be ignored. For example, for a login user email, below are considered equal
     *      local://.#user@company.com
     *      user@company.com
     * However, these are NOT a valid formats: .#user@company.com, local://#user@company.com, local://user@company.com, local://., local://.#
     * 
     * Note 2: to retrieve entire data, value after '#' can be omitted. For example,
     * json://GROWER_ORDER_DATA will retrieve an entire JSON object available in the file pointed by GROWER_ORDER_DATA
     */
    dataPath: string;
}