
import { fixture } from "../../hooks/fixture";
import LoginPage from "../../pages/login/loginPage";
import SharedPageBehavior from "../../pages/sharedPageBehavior";

export default class StepPageHelper {
    static async getSharedPageBehavior()
    {
        return await fixture.pageFactory.getPage(SharedPageBehavior, fixture.page);
    }

    static async getLoginPage(){
        return await fixture.pageFactory.getPage(LoginPage, fixture.page);
    }
}