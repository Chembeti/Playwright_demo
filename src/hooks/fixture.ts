import { Page, APIRequestContext, BrowserContext } from "@playwright/test";
import { Logger } from "winston";
import DataBag from "../helpers/util/dataBag";
import TestDataProvider from "../helpers/util/test-data/testDataProvider";
import PageFactory from "../pages/pageFactory";

export const fixture = {
    /* eslint @typescript-eslint/ban-ts-comment: "off" */
    //@ts-ignore"
    requestContext: undefined as APIRequestContext,
    scenarioRetryCount: undefined as { [key: string]: number },// Global object to store retry attempts
    maxRetryCount: undefined as number, // Max retry count from environment variable or default value
    browserContext: undefined as BrowserContext,
    page: undefined as Page,
    logger: undefined as Logger,
    dataBag: undefined as DataBag,//local which is specific to each scenario
    globalDataBag: undefined as DataBag,//global which is common to all scenarios
    testDataProvider: undefined as TestDataProvider,
    pageFactory: undefined as PageFactory,
}