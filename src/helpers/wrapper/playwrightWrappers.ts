import { Page } from "@playwright/test";
import KeyBoardItems from "./keyBoardItems";
import BrowserEvents from "./browserEvents";
import PlaywrightWrapperDataReader from "./pwWrapperDataReader";
import PlaywrightWrapperElementAction from "./pwWrapperElementAction";
import PlaywrightWrapperKeyboard from "./pwWrapperKeyboard";
import PlaywrightWrapperPageElement from "./pwWrapperPageElement";
import PlaywrightWrapperCommon from "./pwWrapperCommon";
import PlaywrightWrapperDataWriter from "./pwWrapperDataWriter";

export default class PlaywrightWrapper {
    common: PlaywrightWrapperCommon;
    dataReader: PlaywrightWrapperDataReader;
    dataWriter: PlaywrightWrapperDataWriter;
    elementAction: PlaywrightWrapperElementAction;
    keyBoard: PlaywrightWrapperKeyboard;
    pageElement: PlaywrightWrapperPageElement;

    constructor(private page: Page) { 
        this.common = new PlaywrightWrapperCommon(this.page);

        this.pageElement = new PlaywrightWrapperPageElement(this.page, this.common);
        this.dataReader = new PlaywrightWrapperDataReader(this.page, this.common, this.pageElement);
        this.dataWriter = new PlaywrightWrapperDataWriter(this.page, this.common, this.pageElement);
        this.keyBoard = new PlaywrightWrapperKeyboard(this.page, this.common);
        
        this.elementAction = new PlaywrightWrapperElementAction(this.page, this.common, this.pageElement);
    }

    async waitForNavigation(navigationUrl: string, timeout:number = 90000){
        await this.page.waitForURL(navigationUrl, {timeout: timeout});
    }
    async waitForPageStability(timeout:number = 90000){
        //await this.page.waitForLoadState('networkidle');
        await this.page.waitForLoadState(BrowserEvents.PAGE_LOADED_QUICK, {timeout: timeout});
    }
    
    async goto(url: string, timeout: number = 90000) {
        await this.page.goto(url, {
            waitUntil: BrowserEvents.PAGE_LOADED_QUICK,
            timeout: timeout
        });
    }

    async gotoFullPageLoading(url: string, timeout: number = 90000) {
        await this.page.goto(url, {
            waitUntil: BrowserEvents.PAGE_LOADED_FULL,
            timeout: timeout
        });
    }
    /**
     * Refreshes current page and reloads the same
     * @param delayOrTimeoutInMillSec amount of time to delay before refreshing and then to wait for page reload to complete after refreshing
     * @param [delayAfterRefresh=-1] amount of time to delay after refreshing the page; this is useful if the page is loading slowly  
    */
    async refreshCurrentPage(delayOrTimeoutInMillSec: number, delayAfterRefresh: number = 0){
        //await this.keyBoard.pressKeyBoard(null, KeyBoardItems.F5, delayOrTimeoutInMillSec);
        await this.keyBoard.pressKeyBoard(null, KeyBoardItems.F5);
        await this.page.reload({timeout: delayOrTimeoutInMillSec});
        if(delayAfterRefresh > 0)
            await this.common.delay(delayAfterRefresh);
    }
}