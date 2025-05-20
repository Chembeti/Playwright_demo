import { Given, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { fixture } from "../../hooks/fixture";
import StepPageHelper from "./stepPageHelper";

setDefaultTimeout(60 * 1000 * 5);

Given('User navigates to the application', async function () {
    const loginPage = await StepPageHelper.getLoginPage();
    const expectedTitle = await loginPage.getLoginPageTitle();
    const result = await navigateToAppLandingPage(expectedTitle, true);
    expect(result).toBeTruthy();
});

export async function navigateToAppLandingPage(expectedTitle: string, isNavigationForFreshLogin: boolean, maxRetryCount: number = 0): Promise<boolean>{
    const loginPage = await StepPageHelper.getLoginPage();
    let result = false;
    if(maxRetryCount == 0)
        maxRetryCount = parseInt(process.env.LOGIN_PAGE_CHECK_RETRY_COUNT.replaceAll(",", ""));
    await loginPage.navigateToAppLandingPage(maxRetryCount, isNavigationForFreshLogin);
    
    fixture.logger.info(`expectedTitle is - ${expectedTitle}`);
    for (let retryCount = 0; retryCount < maxRetryCount; retryCount++) {
        fixture.logger.warn(`checking for login page title; retry count = ${retryCount + 1}`);
        const receivedTitle = await loginPage.getPageCurrentTitle();
        fixture.logger.info(`receivedTitle is - ${receivedTitle}`);
        if (receivedTitle === expectedTitle) {
            result = true;
            break;
        }
    }
    return result;
}