/*eslint @typescript-eslint/no-unsafe-argument: "off" */
/*eslint @typescript-eslint/no-unsafe-assignment: "off" */
/*eslint @typescript-eslint/no-unsafe-call: "off" */
/*eslint @typescript-eslint/no-unsafe-member-access: "off" */
const { format } = require('date-fns');
import PageConstants from "./pageConstants";
import { fixture } from "../hooks/fixture";
import HtmlRoles from "../helpers/wrapper/htmlRoles";
import BasePage from "./basePage";
import { expect } from "@playwright/test";


export default class SharedPageBehavior  extends BasePage {

    displayedButtonClickActionMsgLabelTxt: string;
    replaceErrorText: string = "replace-error-text";
    
    Elements = {
        progressElementXPath: "//div[@class='loaderWhiteOuter']",
        successfulButtonClickActionMsgId: 'toast-container',
        successfulButtonClickActionMsgXPath: "//div[@role='alert']",
        noItemsFoundXPath: `//div[text()='No items found']`,
        errorLineXPath: `//li[contains(text(),'${this.replaceErrorText}')]`,
        noRecordFoundXPath: `//*[contains(text(),'No record Found')]`,
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async initialize(): Promise<boolean>{
        return true;
    }
    /*eslint @typescript-eslint/require-await: "off" */
    async isPageStable(): Promise<boolean> {
        return true;
    }

    async isOperationInProgress(spinnerXPath: string = ""): Promise<boolean>{
        await this.pwWrapper.common.delay(500); //it was observed that sometimes UI is not starting the spinner immediately; hence added this delay
        let count = 0;
        try{
            if (spinnerXPath.length == 0)
                spinnerXPath = this.Elements.progressElementXPath;

            let maxRetryCount = 50;
            while (maxRetryCount > 0) {
                if (count !== 0) {
                    break;
                }
                count = await this.page.locator('[class^="loader"]').count();  // starts with loader
                --maxRetryCount;
            }
        }
        catch(err){
            fixture.logger.error(`failed to track spinner. Error - ${err}`);
            if(err.message.includes("has been closed")) //expected message: "Target page, context or browser has been closed"
            {
                fixture.logger.error(`page/context/browser has been closed. Hence, exiting from the test`);
                expect(false).toBeTruthy(); //this is to fail the test case as we are not able to track spinner
            }
            return err;
         }
         await this.pwWrapper.common.delay(1000); //it was observed that sometimes UI is not showing data even after the spinner disappeared; hence added this delay
         return count > 0;
    }

    async isToastMsgVisible(): Promise<boolean>{
        let result = true;

        try{
            await this.pwWrapper.pageElement.getVisibleElementById(this.Elements.successfulButtonClickActionMsgId, 30000);
        }
        catch(err){
            if(err.name === PageConstants.TIMEOUT_ERROR)
             {
                result = false;
             }
         }
        return result;
    }

    async checkLabelPresence(labelName: string, performOperationInprogressCheck: boolean = true){
        if(performOperationInprogressCheck)
            while (await this.isOperationInProgress());

        return await this.pwWrapper.pageElement.isElementByLabelAvailable(labelName); 
    }

    async clickButtonAndInspectSuccessMessage(operationName: string, buttonName: string, isExact: boolean = false): Promise<string>{
        fixture.logger.info(`${operationName} has started`);
        this.displayedButtonClickActionMsgLabelTxt = "";
        try {
            const allPromise = await Promise.all([
                this.pwWrapper.elementAction.waitAndClickButtonByRole(buttonName, 90000, isExact),
                this.pwWrapper.dataReader.getElementTextById(this.Elements.successfulButtonClickActionMsgId)  //toast success message on transfer successfully
            ]);
            let values = allPromise;
            this.displayedButtonClickActionMsgLabelTxt = values[1].trim();
            if(this.displayedButtonClickActionMsgLabelTxt == null || this.displayedButtonClickActionMsgLabelTxt.length == 0)//try once again
            {
                fixture.logger.info("could not retrieve toast message....trying again");
                const count = await this.pwWrapper.pageElement.getAvailableElementCountById(this.Elements.successfulButtonClickActionMsgId);
                fixture.logger.info(`toast message count is....${count}`);
                if(count > 0){
                    while(await this.isOperationInProgress());//sometimes UI is still showing the spinner and in such cases, clicking on the toast will fail so we will wait
                    this.displayedButtonClickActionMsgLabelTxt = await this.pwWrapper.dataReader.getElementTextById(this.Elements.successfulButtonClickActionMsgId);
                    //await this.pwWrapper.elementAction.clickElementById(this.Elements.successfulButtonClickActionMsgId);//it is observed sometimes it is failing to click the toast message; it could be  - by the time it is clicked, toast message disappears; hence disabled this step
                }
            }
            
            fixture.logger.info(`${operationName} has completed with the message - ${this.displayedButtonClickActionMsgLabelTxt}`);
        } catch (error) {
            const errMsg = `failed to resolve promises during ${operationName}...${error}`;
            this.logAndThrowError(errMsg);
        }
        return this.displayedButtonClickActionMsgLabelTxt;
    }

    async clickButtonByTestIdAndInspectSuccessMessage(operationName: string, buttonTestId: string): Promise<string>{
        fixture.logger.info(`${operationName} has started`);
        this.displayedButtonClickActionMsgLabelTxt = "";
        try {
            const allPromise = await Promise.all([
                this.pwWrapper.elementAction.clickElementByTestId(buttonTestId, 0),
                this.pwWrapper.dataReader.getElementTextById(this.Elements.successfulButtonClickActionMsgId)  //toast success message on transfer successfully
            ]);
            let values = allPromise;
            this.displayedButtonClickActionMsgLabelTxt = values[1].trim();
            if(this.displayedButtonClickActionMsgLabelTxt == null || this.displayedButtonClickActionMsgLabelTxt.length == 0)//try once again
            {
                fixture.logger.info("could not retrieve toast message....trying again");
                const count = await this.pwWrapper.pageElement.getAvailableElementCountById(this.Elements.successfulButtonClickActionMsgId);
                fixture.logger.info(`toast message count is....${count}`);
                if(count > 0){
                    while(await this.isOperationInProgress());//sometimes UI is still showing the spinner and in such cases, clicking on the toast will fail so we will wait
                    this.displayedButtonClickActionMsgLabelTxt = await this.pwWrapper.dataReader.getElementTextById(this.Elements.successfulButtonClickActionMsgId);
                    //await this.pwWrapper.elementAction.clickElementById(this.Elements.successfulButtonClickActionMsgId);//it is observed sometimes it is failing to click the toast message; it could be  - by the time it is clicked, toast message disappears; hence disabled this step
                }
            }
            
            fixture.logger.info(`${operationName} has completed with the message - ${this.displayedButtonClickActionMsgLabelTxt}`);
        } catch (error) {
            const errMsg = `failed to resolve promises during ${operationName}...${error}`;
            this.logAndThrowError(errMsg);
        }
        return this.displayedButtonClickActionMsgLabelTxt;
    }

    async clickButtonAndInspectSuccessMessageIndependently(operationName: string, buttonName: string, additionalBtnName: string = "", isExact: boolean = false, timeout: number = 3000): Promise<string>{
        fixture.logger.info(`${operationName} has started`);
        this.displayedButtonClickActionMsgLabelTxt = "";
        try {
            await this.pwWrapper.elementAction.waitAndClickButtonByRole(buttonName, timeout, isExact);
            while(await this.isOperationInProgress())
            {
                if(await this.pwWrapper.pageElement.getAvailableElementCount(this.Elements.successfulButtonClickActionMsgXPath) > 0)
                    this.displayedButtonClickActionMsgLabelTxt = await this.pwWrapper.dataReader.getElementTextById(this.Elements.successfulButtonClickActionMsgId);
            }
            if(this.displayedButtonClickActionMsgLabelTxt.length > 0 //if we received this message then there is no need to check the additional button
                && additionalBtnName.length > 0)
            {
                if(await this.pwWrapper.pageElement.isButtonDisplayed(additionalBtnName, timeout, isExact))
                {
                    await this.pwWrapper.elementAction.waitAndClickButtonByRole(additionalBtnName, timeout, isExact);
                    while (await this.isOperationInProgress()) {
                        if (await this.pwWrapper.pageElement.getAvailableElementCount(this.Elements.successfulButtonClickActionMsgXPath) > 0)
                            this.displayedButtonClickActionMsgLabelTxt = await this.pwWrapper.dataReader.getElementTextById(this.Elements.successfulButtonClickActionMsgId);
                    }
                }
            }
            for (let i = 0; i < 5; i++) {
                if (this.displayedButtonClickActionMsgLabelTxt == null || this.displayedButtonClickActionMsgLabelTxt.length == 0)//try once again
                    this.displayedButtonClickActionMsgLabelTxt = await this.pwWrapper.dataReader.getElementTextById(this.Elements.successfulButtonClickActionMsgId);
                else
                    break;
            }
            fixture.logger.info(`${operationName} has completed with the message - ${this.displayedButtonClickActionMsgLabelTxt}`);
        } catch (error) {
            const errMsg = `failed to resolve promises during ${operationName}...${error}`;
            this.logAndThrowError(errMsg);
        }
        return this.displayedButtonClickActionMsgLabelTxt;
    }
    
    async waitForPageNavigation(pageUri: string){
        const pageUrl = process.env.BASEURL + pageUri;
        await this.pwWrapper.waitForNavigation(pageUrl, 10000);
    }
    async clickOnTab(tabName: string, isExact: boolean = false){
        await (await this.pwWrapper.pageElement.getElementByRole(HtmlRoles.TAB, tabName, isExact)).click();
        while(await this.isOperationInProgress());
    }
    /**
     * 
     * @param dropDownPlaceholderText 
     * @param dropdownOptionText will be used to filter items by searching
     * @param noSelectionXPath 
     * @param optionSearchText if this is empty, first search result will be used with the above filter; else specific text element will be clicked
     */
    async selectAngularDropdownOptionByPlaceholder(dropDownPlaceholderText: string, dropdownOptionText: string, noSelectionXPath:string = "", optionSearchText: string = "", selectOptionFromPanel: boolean = false){
        if(noSelectionXPath.length == 0)
            noSelectionXPath = this.Elements.noItemsFoundXPath;

        dropdownOptionText = dropdownOptionText.trim();
        if(selectOptionFromPanel){
            await this.pwWrapper.dataWriter.selectAngularDropdownOptionFromPanel(dropDownPlaceholderText, dropdownOptionText, optionSearchText);
        }else
        {
            await this.pwWrapper.dataWriter.selectAngularDropdownOption(dropDownPlaceholderText, dropdownOptionText, optionSearchText);
        }
        while(await this.isOperationInProgress());
        const count = await this.pwWrapper.pageElement.getAvailableElementCount(noSelectionXPath);
        if(count == 0)
            fixture.logger.info(`from - ${dropDownPlaceholderText} - the option - ${dropdownOptionText} - has been selected`);
        else {
            const errorMsg = `specified dropdown option - ${dropdownOptionText} - could not be selected from - ${dropDownPlaceholderText} - dropdown`;
            this.logAndThrowError(errorMsg);
        }
    }

    async selectAngularDropdownOptionByPlaceholderFromPanel(dropDownPlaceholderText: string, dropdownOptionText: string, noSelectionXPath:string = "", optionSearchText: string = ""){
        await this.selectAngularDropdownOptionByPlaceholder(dropDownPlaceholderText, dropdownOptionText, noSelectionXPath, optionSearchText, true);
    }

    throwErrorIfCountIsEmpty(count: number, errorMsg: string){
        if(count == 0){
            this.logAndThrowError(errorMsg);
        }
    }

    throwErrorIfCountIsNotEmpty(count: number, errorMsg: string){
        if(count > 0){
            this.logAndThrowError(errorMsg);
        }
    }

    logAndThrowError(errorMsg: string){
        fixture.logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    async checkIfErrorExists(errorText:string){
        const finalXPath = this.Elements.errorLineXPath.replace(this.replaceErrorText, errorText);
        while(await this.isOperationInProgress());
        const count = await this.pwWrapper.pageElement.getAvailableElementCount(finalXPath);
        return count > 0;
    }

    async isNoDataAvailable(): Promise<boolean>{
        const existingProductRowCount = await this.pwWrapper.pageElement.getAvailableElementCount(this.Elements.noRecordFoundXPath);
        return existingProductRowCount > 0;
    }
}