import { APIResponse } from "@playwright/test";
import { fixture } from "../../../hooks/fixture";
import DataBagKeys from "../../../tests/steps/dataBagKeys";
import AuthHeaders from "./authHeaders";

export default class ApiExecutor {
    private static readonly TIME_OUT = 150000;
    static saveQueryParams(records: Record<string, string>[]) {
        let queryParams = "";
        for (const row of records) {
            for (const key in row) {
                queryParams = queryParams + `${key}=${row[key]}&`;
            }
        }
        queryParams = queryParams.substring(0, queryParams.length - 1);
        fixture.dataBag.saveData(DataBagKeys.QUERY_PARAMETERS, queryParams);
    }

    static saveAdditionalHeaders(records: Record<string, string>[]){
        fixture.dataBag.saveData(DataBagKeys.ADDITIONAL_HEADERS, records);
    }

    static async callGetMethod(url: string): Promise<APIResponse> {
        fixture.logger.info(`about to call ${url}`);
        let headersData = ApiExecutor.getHeadersData();
        //fixture.logger.info(`headersData is ... ${JSON.stringify(headersData)}`);
        let response = await fixture.requestContext.get(url, {
            headers: headersData,
            timeout: ApiExecutor.TIME_OUT
        });
    
        //console.log(await response.json());
        return response;
    }
    
    static async callPostMethod(url: string): Promise<APIResponse> {
        fixture.logger.info(`about to call ${url}`);
        
        let headersData = ApiExecutor.getHeadersData();
        let endpointData = fixture.dataBag.getData(DataBagKeys.REQUEST_BODY);
        //fixture.logger.info(`endpointData value is ${JSON.stringify(endpointData)}`);
        let response = await fixture.requestContext.post(url, {
            headers: headersData,
            data: endpointData,
            timeout: ApiExecutor.TIME_OUT
        });
    
        //console.log(await response.json());
        return response;
    }
    static getHeadersData(){
        const headers = fixture.dataBag.getData(DataBagKeys.AUTH_HEADERS) as AuthHeaders;
        //fixture.logger.info(`headers is...${JSON.stringify(headers)}`);
        let headersData = {};
        headersData = Object.assign({},headers); 
    
        const additionalHeaders = fixture.dataBag.getData(DataBagKeys.ADDITIONAL_HEADERS) as Record<string, string>[];
        //fixture.logger.info(`additionalHeaders is...${JSON.stringify(additionalHeaders)}}`);
        if(additionalHeaders !== undefined && additionalHeaders !== null && additionalHeaders.length > 0)
        {
            for (const row of additionalHeaders) {
                for (const key in row) {
                    headersData[key] = row[key];
                }
            }
        }
        //fixture.logger.info(`final headers is...${JSON.stringify(headersData)}}`);
        return headersData;
    }
}