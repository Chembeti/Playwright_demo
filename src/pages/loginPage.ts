import { expect, Page } from "@playwright/test";
import PlaywrightWrapper from "../helpers/wrapper/playwrightWrappers";


export default class LoginPage {
    private base: PlaywrightWrapper
    constructor(private page: Page) {
        this.base = new PlaywrightWrapper(page);
    }

    private Elements = {
        url: process.env.BASEURL,
        userNameInput: "Username",
        passwordInput: "Password",
        loginBtn: "//button[text()='Sign In']",
        errorMessage: "alert",
        loggedInUser: "//span[contains(@class,'userName')]",
        failedLoginErr: "div.invalidLoginMsg"
    }

    async navigateToLoginPage() {
        await this.base.goto(this.Elements.url);
        await expect(this.page).toHaveTitle("Sign In - Winfield United Evolve Login");
    }
    async enterUserName(user: string) {
        await this.page.getByPlaceholder(this.Elements.userNameInput).fill(user);
    }
    async enterPassword(Password: string) {
        await this.page.getByPlaceholder(this.Elements.passwordInput).fill(Password);
    }

    async clickLoginButton() {
        await this.base.waitAndClick(this.Elements.loginBtn);
    }

    async getLoggedInUserName(){
        const userName = await this.page.locator(this.Elements.loggedInUser).textContent();
        return userName;
    }
    async getErrorMessage() {
        //return this.page.getByRole("alert");
        return await this.page.locator(this.Elements.failedLoginErr);
    }

    async loginUser(user: string, password: string) {
        await this.enterUserName(user);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }
}