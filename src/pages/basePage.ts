import PlaywrightWrapper from "../helpers/wrapper/playwrightWrappers";
import HtmlRoles from "../helpers/wrapper/htmlRoles";
import SharedPageBehavior from "./sharedPageBehavior";
import StepPageHelper from "../tests/steps/stepPageHelper";
import { Page } from "@playwright/test";

export default abstract class BasePage{
    protected Elements = {};
    protected pwWrapper: PlaywrightWrapper;
    protected sharedBehavior: SharedPageBehavior;

    constructor(protected page: Page) {
        this.pwWrapper = new PlaywrightWrapper(page);
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async canNavigateWithUrl(): Promise<boolean>{
        return true;
    }
    async initialize(): Promise<boolean>{
        this.sharedBehavior = await StepPageHelper.getSharedPageBehavior();
        return true;
    }
    abstract isPageStable(): Promise<boolean>;

    getCurrentPageURL(): string{
        return this.page.url();
    }
    /**
     * This method checks if the button is displayed and visible
     * @param btnName 
     * @param shouldRefreshPageOnRetry 
     * @param retryCount 
     */
    protected async waitUntilButtonIsDisplayed(btnName: string, shouldRefreshPageOnRetry: boolean = false, retryCount: number = 3){
        while (await this.sharedBehavior.isOperationInProgress());
        let btnCount = 0;
        for(let index=0; index<retryCount; index++){
            btnCount = await this.pwWrapper.pageElement.getAvailableElementCountByRole(HtmlRoles.BUTTON, btnName);
            if(btnCount > 0)
                break;
            if(shouldRefreshPageOnRetry)
                await this.pwWrapper.refreshCurrentPage(2000);
        }
        if(btnCount == 1)
            await this.pwWrapper.pageElement.getButton(btnName); //wait until at least one button is displayed
        else if(btnCount > 1)
            (await this.pwWrapper.pageElement.getButton(btnName)).nth(1); //wait until at least one button is displayed

        while (await this.sharedBehavior.isOperationInProgress());
    } 

    protected async waitUntilPlaceholderIsDisplayed(placeholderTxt: string){
        while (await this.sharedBehavior.isOperationInProgress());
        while(await this.pwWrapper.pageElement.getAvailableElementCountByPlaceholder(placeholderTxt) < 1);
        while (await this.sharedBehavior.isOperationInProgress());
    } 

    protected async waitUntilLinkIsDisplayed(linkTxt: string){
        while (await this.sharedBehavior.isOperationInProgress());
        while(await this.pwWrapper.pageElement.getAvailableElementCountByRole(HtmlRoles.LINK, linkTxt) < 1);
        while (await this.sharedBehavior.isOperationInProgress());
    } 
    
    async waitUntilToastMessageIsClosed(){
        while(await this.sharedBehavior.isToastMsgVisible());
        await this.pwWrapper.common.delay(2000);
    }
    
    clear(): void {
        this.Elements = null;
    }
}