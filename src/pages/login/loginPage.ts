import AuthHeaders from "../../helpers/util/api/authHeaders";
import HtmlRoles from "../../helpers/wrapper/htmlRoles";
import { fixture } from "../../hooks/fixture";
import DataBagKeys from "../../tests/steps/dataBagKeys";
import BasePage from "../basePage";

export default class LoginPage extends BasePage {

    Elements = {
        url: process.env.BASEURL,
        authorization_url: process.env.AUTHORIZATION_URL,
        landingPageUri: "cc/landing-data",
        userNameInput: "Username",
        passwordInput: "Password",
        loginBtnXPath: "//button[text()='Sign In']",
        loginBtn: 'Sign In',
        errorMessage: "alert",
        loggedInUser: "//span[contains(@class,'userName')]",
        failedLoginErr: "div.invalidLoginMsg",
        emulatedUser: "//div[contains(@class,'emulatedUserBox')]",
        searchBtnTxtOnLandingPage: 'Search',
        logoutBtnTxt: 'Logout',
    }

    async isPageStable(): Promise<boolean> {
        return true;
    }
    
    async navigateToAppLandingPage(retries = 3, isNavigationForFreshLogin: boolean) {
        const consoleListener = (msg: { text: () => any; }) => fixture.logger.info('PAGE LOG:', msg.text());
        const pageErrorListener = (error: any) => fixture.logger.error('PAGE ERROR:', error);

        fixture.page.on('console', consoleListener);
        fixture.page.on('pageerror', pageErrorListener);

        for (let i = 0; i < retries; i++) {
            try {
                await this.pwWrapper.gotoFullPageLoading(this.Elements.url, 60000);
                // Wait for a specific element that indicates the page has loaded
                await this.page.waitForSelector('body', { state: 'attached', timeout: 60000 });
                if (await this.isPageWhite()) {
                    throw new Error('Page loaded but content is empty');
                }
               if(isNavigationForFreshLogin)
                await this.page.waitForSelector(`text=${this.Elements.loginBtn}`, { state: 'visible', timeout: 60000 });

                return; // Exit if navigation is successful and page is not white
            } catch (error) {
                console.error(`Navigation attempt ${i + 1} failed: `, error.message);
                if (i === retries - 1) throw error; // Rethrow error after final attempt
            }
        }

        // Unsubscribe from events after login
        fixture.page.removeListener('console', consoleListener);
        fixture.page.removeListener('pageerror', pageErrorListener);
    }
    async isPageWhite() {
        const content = await fixture.page.content();
        return content.trim() === '';
    }

    async getPageCurrentTitle(): Promise<string> {
        return await this.page.title();
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async getLoginPageTitle(): Promise<string> {
        return "Sign In - Winfield United Evolve Login";
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async getLoggedInPageTitle(): Promise<string> {
        return "evolve";
    }

    async enterUserName(user: string) {
        await this.page.getByPlaceholder(this.Elements.userNameInput).fill(user);
    }

    async getUserName() {
        return await this.page.getByPlaceholder(this.Elements.userNameInput).inputValue();
    }
    async enterPassword(password: string) {
        await this.page.getByPlaceholder(this.Elements.passwordInput).fill(password);
    }

    async getPassword() {
        return await this.page.getByPlaceholder(this.Elements.passwordInput).inputValue();
    }

    async clickLoginButton(checkHomePageNavigation: boolean = true) {
        await this.pwWrapper.elementAction.waitAndClick(this.Elements.loginBtnXPath);
        if (checkHomePageNavigation) {
            const loggedInUserHomePageUrl = `${process.env.BASEURL}` + `${this.Elements.landingPageUri}`;
            await this.pwWrapper.waitForNavigation(loggedInUserHomePageUrl, 90000);
            await this.page.locator(this.Elements.loggedInUser).waitFor({ state: "visible", timeout: 90000 });
        }
    }

    async getLoggedInUserName(): Promise<string> {
        let userName = "";
        try {
            userName = await this.page.locator(this.Elements.loggedInUser).textContent({timeout: 120000});
        } catch (error) {
            fixture.logger.error("failed to get the content of the element - " + this.Elements.loggedInUser);
            fixture.logger.error(error);
        }
        return userName;
    }
    
    async refreshLandingPage() {
        // Emulation does not work if set in one browsing context and next browsing context is opened in private mode.
        // For this, we need to refresh page
        await this.pwWrapper.refreshCurrentPage(90000, 3000);
        while(await this.sharedBehavior.isOperationInProgress());
        await super.waitUntilButtonIsDisplayed(this.Elements.searchBtnTxtOnLandingPage, false, 30)
        //await this.page.waitForResponse(process.env.BASEURL + '/api/OTI/get-order-to-invoice-order', {timeout: 60000});
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async getErrorMessage() {
        return this.page.locator(this.Elements.failedLoginErr);
    }

    async loginUser(user: string, password: string) {
        await this.enterUserName(user);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }

    async logout(){
        const currentLoggedInUser = await this.getLoggedInUserName();
        (await this.pwWrapper.pageElement.getElementByRole(HtmlRoles.NAVIGATION))
            .locator('div').filter({ hasText: `${currentLoggedInUser}` }).locator('i').click();
        await this.pwWrapper.elementAction.clickElementByText(this.Elements.logoutBtnTxt);
    }

    async initializeOAuthToken(): Promise<boolean>{
        while(await this.sharedBehavior.isOperationInProgress());
        try {
          const storedData = await this.page.evaluate((key) => {
            return localStorage.getItem(key);
        }, "token"); // "token" is the key name used to store OAuth token in the localStorage by the UI app
     
          if (storedData) {
            //fixture.logger.info('Key found in local storage: ' + storedData);
            let authHeaders = new AuthHeaders();
            authHeaders.Token = storedData;
            fixture.dataBag.saveData(DataBagKeys.AUTH_HEADERS, authHeaders);
            //fixture.logger.info(storedData);
            
            return true;
          } else {
            fixture.logger.info('OAuth Key not found in local storage: ');
            return false;
          }
        }
         catch (error) {
          fixture.logger.error('Error retrieving token from session storage:', error);
          throw false;
        }
    }
    
    async saveLoggedInUserAuthInfo(){
        await fixture.page.context().storageState({ path: 'auth.json' });
    }
}