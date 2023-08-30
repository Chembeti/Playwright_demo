import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";

import { expect } from "@playwright/test";
import { fixture } from "../../hooks/fixture";
import * as pf from "../../pages/pageFactory"

setDefaultTimeout(60 * 1000 * 2)

Given('User navigates to the application', async function () {
    const loginPage = pf.getLoginPage(fixture.page)
    await loginPage.navigateToLoginPage()
    fixture.logger.info("Navigated to the application")
})


Given('User enters the username as {string}', async function (username) {
    const loginPage = pf.getLoginPage(fixture.page);
    await loginPage.enterUserName(username);
});

Given('User enters the password as {string}', async function (password) {
    const loginPage = pf.getLoginPage(fixture.page);
    await loginPage.enterPassword(password);
})

When('User clicks on the login button', async function () {
    const loginPage = pf.getLoginPage(fixture.page);
    await loginPage.clickLoginButton();
    fixture.logger.info("Waiting for 2 seconds")
    await fixture.page.waitForTimeout(2000);
});


Then('Login should pass', async function () {
    const loginPage = pf.getLoginPage(fixture.page);
    const text = await loginPage.getLoggedInUserName();
    console.log("Username: " + text);
    fixture.logger.info("Username: " + text);
})

When('Login should fail', async function () {
    const loginPage = pf.getLoginPage(fixture.page);
    const failureMesssage = await loginPage.getErrorMessage();
    await expect(failureMesssage).toBeVisible();
});
