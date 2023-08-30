import { Page } from "playwright";
import LoginPage from "./loginPage";

let loginPage: LoginPage;

export function getLoginPage(page: Page): LoginPage{
    if (loginPage == null)
        loginPage = new LoginPage(page);

    return loginPage;
}
