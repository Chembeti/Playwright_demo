import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";

import { expect } from "@playwright/test";
import { fixture } from "../../hooks/fixture";
import { TestDataType } from "../../helpers/util/test-data/TestDataType";
import AppUser from "../../helpers/util/test-data/account/appUser";
import StepDataHelper from "./stepDataHelper";
import StepPageHelper from "./stepPageHelper";
import { navigateToAppLandingPage } from "./commonFeatureSteps";

const fs = require("fs-extra");

setDefaultTimeout(60 * 1000 * 5);

Given('User enters the username as {string}', async function (username: string) {
    const loginPage = await StepPageHelper.getLoginPage();
    try {
        await loginPage.enterUserName(username);
        fixture.logger.info("User entered username");
    }
    catch (error) {
        fixture.logger.error("Failed to enter user name. Error: " + error);
    }
    expect(await loginPage.getUserName()).toBe(username);
});

Given('User enters the password as {string}', async function (password: string) {
    const loginPage = await StepPageHelper.getLoginPage();
    try {
        await loginPage.enterPassword(password);
        fixture.logger.info("User entered password");
    }
    catch (error) {
        fixture.logger.error("Failed to enter password. Error: " + error);
    }
    expect(await loginPage.getPassword()).toBe(password);
});

When('User clicks on the login button', async function () {
    let result = true;
    try {
        const loginPage = await StepPageHelper.getLoginPage();
        await loginPage.clickLoginButton(false);//don't check for homepage navigation
    } catch (error) {
        result = false;
        fixture.logger.error("Failed to click login button. Error: " + error);
    }
    expect(result).toBeTruthy();
});


Then('Login should pass', async function () {
    await checkLoggedInUser();
});

When('Login should fail', async function () {
    const loginPage = await StepPageHelper.getLoginPage();
    const failureMesssage = await loginPage.getErrorMessage();
    await expect(failureMesssage).toBeVisible();
});

Given('logs-in as {string}', async function (userDetailDataPath: string) {
    await loginToApp(userDetailDataPath);
});

async function loginToApp(userDetailDataPath: string){
    let result = true;
    const loginPage = await StepPageHelper.getLoginPage();
    const userDetail = StepDataHelper.getSingleTestDataRecordForType(TestDataType.AppUser, userDetailDataPath) as AppUser;

    fixture.logger.info(`User - ${userDetail.userName} - is about to login to the application`);
    try {
        await loginPage.enterUserName(userDetail.userName);
        await loginPage.enterPassword(userDetail.password);
        await loginPage.clickLoginButton();
        //const loggedInUserAuthInfoFilePath = fixture.dataBag.getData(DataBagKeys.USER_AUTH_INFO_FILE_PATH);
        //await fixture.browserContext.storageState({ path: loggedInUserAuthInfoFilePath });
        result = await loginPage.initializeOAuthToken();
    } catch (error) {
        result = false;
        fixture.logger.error("User failed to log-in. Error: " + error);
    }
    expect(result).toBeTruthy();
}

async function checkLoggedInUser() {
    let result = true;
    const loginPage = await StepPageHelper.getLoginPage();
    let text = "";
    try {
        text = await loginPage.getLoggedInUserName();
        //console.log("Username: " + text);
        fixture.logger.info("Username: " + text);
    } catch (error) {
        result = false;
        fixture.logger.error("Failed to get logged-in user name. Error: " + error);
    }
    expect(text.length).toBeGreaterThan(1);
    expect(result).toBeTruthy();
    fixture.logger.info(`User - ${text} - has logged-in to the application`);
}
