import { APIResponse } from "@playwright/test";
import { fixture } from "../../../hooks/fixture";
import DataBagKeys from "../../../tests/steps/dataBagKeys";
import ApiExecutor from "./apiExecutor";
import SampleApiRequest from "./models/requests/sampleApiRequest";
import SampleApiResponse from "./models/responses/sampleApiResponse";

export default class ApiManager {
    private static getEndpointUri(uriPart: string) {
        let uri = process.env.API_BASEURL;
        if (!uri.endsWith("/"))
            uri = uri + "/";

        uri = uri + process.env.API_URI_PREFIX;
        if (!uri.endsWith("/"))
            uri = uri + "/";

        return uri + uriPart;
    }

    private static readonly SAMPLE_API_URI = `sample/api`;

    static async getDataFromTheSampleapi(request: SampleApiRequest): Promise<any[]> {
        const url = ApiManager.getEndpointUri(ApiManager.SAMPLE_API_URI);
        fixture.dataBag.saveData(DataBagKeys.REQUEST_BODY, request);

        let result = true;
        try {
            let response: APIResponse = await ApiExecutor.callPostMethod(url);
            const responseJson = await response.json();
            //fixture.logger.info(JSON.stringify(responseJson));
            const res = new SampleApiResponse(responseJson);
            return res.resultData;

        } catch (error) {
            result = false;
            fixture.logger.error("Failed to call the endpoint. Error: " + error);
        }
        return null;
    }
}