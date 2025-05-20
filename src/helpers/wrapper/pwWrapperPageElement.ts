/* eslint @typescript-eslint/no-explicit-any: "off" */

import { Locator, Page } from "@playwright/test";
import HtmlElementProperties from "./htmlElementProperties";
import HtmlRoles from "./htmlRoles";
import PlaywrightWrapperCommon from "./pwWrapperCommon";
import { fixture } from "../../hooks/fixture";
export default class PlaywrightWrapperPageElement {

    constructor(private page: Page, private common: PlaywrightWrapperCommon) { }

    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getElementByRole(role:any, elementName: string = "", isExact: boolean = false): Promise<Locator>{
        if(elementName.length > 0)
            return this.page.getByRole(role, { name: elementName, exact: isExact});
        else
            return this.page.getByRole(role, {exact: isExact});
    }

    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getChildElementByRole(parentElementXPath: string, role:any, elementName: string = "", isExact: boolean = false): Promise<Locator>{
        if(elementName.length > 0)
            return this.page.locator(parentElementXPath).getByRole(role, { name: elementName, exact: isExact });
        else
            return this.page.locator(parentElementXPath).getByRole(role, {exact: isExact});
    }

    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getIFrameElementByRole(iFrameName: string, role:any, elementName: string = "", isExact: boolean = false): Promise<Locator>{
        if(elementName.length > 0)
            return this.page.frameLocator(`iframe[name="${iFrameName}"]`).getByRole(role, { name: elementName, exact: isExact });
        else
        return this.page.frameLocator(`iframe[name="${iFrameName}"]`).getByRole(role, { exact: isExact });
    }

    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getIndexedIFrameElementByRole(iFrameName: string, role:any, index: number, elementName: string = "", isExact: boolean = false): Promise<Locator>{
        if(elementName.length > 0)
            return this.page.frameLocator(`iframe[name="${iFrameName}"]`).getByRole(role, { name: elementName, exact: isExact }).nth(index);
        else
            return this.page.frameLocator(`iframe[name="${iFrameName}"]`).getByRole(role, { exact: isExact }).nth(index);
    }

    async getElementByLocatorAndRole(locator: string, role: any, isExact: boolean = false): Promise<Locator>{
        const element = this.page.locator(locator);
        return element.getByRole(role, {exact: isExact});
    }

    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getIFrameElementByXPath(iFrameName: string, xpath:string): Promise<Locator>{
        return this.page.frameLocator(`iframe[name="${iFrameName}"]`).locator(xpath);
    }

    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getIndexedIFrameElementByXPath(iFrameName: string, xpath:string, index: number): Promise<Locator>{
        return this.page.frameLocator(`iframe[name="${iFrameName}"]`).locator(xpath).nth(index);    
    }

    /*eslint @typescript-eslint/require-await: "off" */
    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getIndexedElementByRole(index: number, role:any, elementName: string, exact: boolean = false): Promise<Locator>{
        if(index == 0)
            return this.page.getByRole(role, { name: elementName, exact: exact });
        else
            return this.page.getByRole(role, { name: elementName, exact: exact }).nth(index);
    }

    async getVisibleElement(locator: string, timeout: number = 90000): Promise<Locator>{
        const element = this.page.locator(locator);
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }

    async getIndexedVisibleElement(index: number, locator: string, timeout: number = 90000): Promise<Locator>{
        const element = this.page.locator(locator).nth(index);
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }
    
    async isButtonDisplayed(btnName: string, timeout: number = 90000, isExact: boolean = false): Promise<boolean>{
        return await this.page.getByRole(HtmlRoles.BUTTON, { name: btnName, exact: isExact }).isVisible({timeout: timeout});
    }

    async getButton(btnName: string, timeout: number = 90000, isExact: boolean = false): Promise<Locator>{
        const element = this.page.getByRole(HtmlRoles.BUTTON, { name: btnName, exact: isExact });
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }

    async getButtonByNonDefaultRole(btnName: string, role:any, timeout: number = 90000, isExact: boolean = false): Promise<Locator>{
        const element = this.page.getByRole(role, { name: btnName, exact: isExact });
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }

    async getIFrameButton(iFrameName: string, btnName: string, timeout: number = 90000, isExact: boolean = false): Promise<Locator>{
        const element = await this.getIFrameElementByRole(iFrameName, HtmlRoles.BUTTON, btnName, isExact);
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByXPath(xpath: string): Promise<Locator>{
        return this.page.locator(xpath);
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async getElementById(id: string): Promise<Locator>{
        return this.page.locator(this.common.getXPathWithId(id));
    }

    async getVisibleElementById(id: string, timeout: number = 90000): Promise<Locator>{
        const element = await this.getElementById(id);
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }

    async waitUtilElementIsVisible(element: Locator, timeout: number = 90000){
        //await element.scrollIntoViewIfNeeded();
        await element.waitFor({
            state: HtmlElementProperties.STATE_VISIBLE,
            timeout: timeout
        });
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByPlaceholder(placeholderText: string){
        return this.page.getByPlaceholder(placeholderText);
    }

    async getVisibleElementByLinkName(linkName: string, timeout: number = 90000){
        const element = this.page.getByRole(HtmlRoles.LINK, { name: linkName })
        await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByLabel(labelName: string, isExact: boolean = false){
        return this.page.getByLabel(labelName, {exact: isExact});
    }

    async getAvailableElementCountByLabel(labelName: string, isExact: boolean = false){
        return await (await this.getElementByLabel(labelName, isExact)).count();
    }

    async isElementByLabelAvailable(labelName: string, isExact: boolean = false): Promise<boolean>{
        const elementCount = await this.page.getByLabel(labelName, {exact: isExact}).count();
        return elementCount > 0;
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByTestId(testId: string, index: number = 0): Promise<Locator>{
        const element = this.page.getByTestId(testId).nth(index);
        return element;
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async getUniqueTableRowWithPartialCellText(cellTextToSearch: string): Promise<Locator>{
        return this.page.locator(`tr:has-text("${cellTextToSearch}")`);
    }

    async getSearchableDropDownHavingText(elementXPath: string, textToFilter: string, timeout:number = 90000, isExact: boolean = false): Promise<Locator>{
        const element = this.page.locator(elementXPath)
            //.filter({ hasText: textToFilter }).getByRole(HtmlRoles.TEXT_BOX);
            .filter({ hasText: textToFilter }).getByRole(HtmlRoles.COMBOBOX, {exact: isExact});
        await element.waitFor(
            {
                //state: "visible",
                timeout: timeout
            }
        );
        return element;
    }

    async getElementHavingText(elementXPath: string, textToFilter: string, elementIndex: number = 0, timeout:number = 90000): Promise<Locator>{
        const element = this.page.locator(elementXPath).filter({ hasText: textToFilter }).nth(elementIndex);
        await element.waitFor(
            {
                timeout: timeout
            }
        );
        return element;
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByClass(className: string):Promise<Locator>{
        return this.page.locator(`.${className}`);
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByNameAndAttributeValue(elementName: string, attributeName: string, attributeValue:string){
        return this.page.locator(`//${elementName}[@${attributeName}='${attributeValue}']`);
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async getButtonWithParentNode(parentNodeXPath: string, btnName: string, isExact: boolean = false){
        return this.page.locator(parentNodeXPath).getByRole(HtmlRoles.BUTTON, { name: btnName, exact: isExact});
    }

    async getAvailableElementCount(xpath: string, timeoutVal: number = -1){
        if(timeoutVal == -1)
            return await this.page.locator(xpath).count();
        else{
            const locator = this.page.locator(xpath);
            try {
                await this.page.waitForSelector(xpath, { timeout: timeoutVal });
                return await locator.count();
            } catch (error) {
                fixture.logger.error(`Element with the xpath - ${xpath} - not found within the specified timeout hence returning zero as the count`);
                //throw error;
                return 0;
            }
        }
    }

    async getAvailableElementCountByText(text: string, isExact: boolean = false){
        return await this.getElementByText(text, isExact).count();
    }

    getElementByText(text: string, isExact: boolean = false): Locator{
        return this.page.getByText(text, {exact: isExact});
    }

    async getAvailableElementCountByTestId(testId: string){
        return await this.page.getByTestId(testId).count();
    }

    async getAvailableElementCountBySimilarTestId(testId: string){
        const finalXPath = this.common.getSelectorWithSimilarTestId(testId);
        return await this.getAvailableElementCount(finalXPath);
    }

    async getAvailableElementCountById(id: string){
        const xpath = this.common.getXPathWithId(id);
        return await this.getAvailableElementCount(xpath);
    }
    
    async getAvailableElementCountByPlaceholder(placeholderTxt: string, isExact: boolean = false){
        return await this.page.getByPlaceholder(placeholderTxt, {exact: isExact}).count();
    }
    /**
     * Returns number of 'tr' items in the current page.
     * Note: this method assumes there is only one table in the current page
     * @param excludeHeaderRows if true then only those 'tr' items under 'tbody' will be considered; otherwise all 'tr' items including under 'thead' will be considered
     * @returns 
     */
    async getTableRowCount(excludeHeaderRows: boolean = true){
        if(excludeHeaderRows){
            return await this.page.locator(`//${HtmlRoles.TABLE_BODY}/${HtmlRoles.TABLE_ROW}`).count();
        }else
        {
            return await this.page.locator(`//${HtmlRoles.TABLE_ROW}`).count();
        }
    }

    /*eslint @typescript-eslint/require-await: "off" */
    /**
     * Note: this method assumes there is only one table in the current page
     * @param rowIndex 
     * @param cellIndex 
     * @returns 
     */
    async getTableCellElement(rowIndex: number, cellIndex: number): Promise<Locator>{
        return this.page.locator(`(((//${HtmlRoles.TABLE_BODY}/${HtmlRoles.TABLE_ROW})[${rowIndex}])/${HtmlRoles.TABLE_DATA})[${cellIndex}]`)
    }

    /*eslint @typescript-eslint/no-unsafe-argument: "off" */
    async getAvailableElementCountByRole(roleName: any, elementTxt: string = "", isExact: boolean = false){
        if(elementTxt.length >= 0)
            return await this.page.getByRole(roleName, {name: elementTxt, exact: isExact}).count();
        else
            return await this.page.getByRole(roleName, {exact: isExact}).count();
    }

    async isElementVisible(xpath: string) : Promise<boolean>{
        return await this.page.locator(xpath).isVisible();
    }

    // async isElementEnabled(xpath: string) : Promise<boolean>{
    //     return await this.page.locator(xpath).isEnabled();
    // }

    async isElementClickable(xpath: string) : Promise<boolean>{
        const element = await this.getElementByXPath(xpath);
        return await element.getAttribute('disabled') == null;
    }
    async isElementByRoleEnabled(roleName: any, elementTxt: string ="", isExact: boolean = false) : Promise<boolean>{
        let element: Locator = null;
        if(elementTxt.length >= 0)
            element = this.page.getByRole(roleName, {name: elementTxt, exact: isExact});
        else
            element = this.page.getByRole(roleName, {exact: isExact});

        if(element !== null)
            return await element.isEnabled();
        else
            return false;
    }

    /*eslint @typescript-eslint/require-await: "off" */
    async getElementByPara(paraText: string){
        return this.page.locator(`//p[text()='${paraText}']`);
    }

    async getVisibleIFrameElementByXPath(iFrameName: string, xpath: string, checkVisibility: boolean = false, timeout: number = 90000): Promise<Locator>{
        const element = this.page.frameLocator(`iframe[name="${iFrameName}"]`).locator(xpath);
        if(checkVisibility)
            await this.waitUtilElementIsVisible(element, timeout);
        return element;
    }
}