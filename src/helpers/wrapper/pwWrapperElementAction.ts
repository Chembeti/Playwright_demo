/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Locator, Page } from "@playwright/test";
import PlaywrightWrapperPageElement from "./pwWrapperPageElement";
import PlaywrightWrapperCommon from "./pwWrapperCommon";
import HtmlRoles from "./htmlRoles";
export default class PlaywrightWrapperElementAction {

    constructor(private page: Page, private common: PlaywrightWrapperCommon, private pageElement: PlaywrightWrapperPageElement) { }

    async bringElementIntoViewPort(element: Locator){
        await element.scrollIntoViewIfNeeded();
    }

    /**
     * returns true if the button is visible and enabled 
     * @param btnName 
     */
    async canClickButton(btnName: string){
        const button = await this.pageElement.getButton(btnName);
        return await button.isEnabled();
    }

    /**
     * 
     * @param testId data-testid attribute; testId must correspond to an element that is clicable
     * @returns true if item is in enabled state otherwise false
     */
    async canClickItemByTestId(testId: string){
        const item = await this.pageElement.getElementByTestId(testId);
        return await item.isEnabled();
    }

    async waitAndClick(locator: string) {
        const element = await this.pageElement.getVisibleElement(locator);
        await element.click();
    }

    async waitAndClickButtonByText(btnTxt: string, isExact: boolean = false) {
        const element = this.pageElement.getElementByText(btnTxt, isExact);
        await this.bringElementIntoViewPort(element);
        await element.click();
    }

    async waitAndClickButtonByRole(btnName: string, timeout: number = 90000, isExact: boolean = false) {
        const element = await this.pageElement.getButton(btnName, timeout, isExact);
        //await this.bringElementIntoViewPort(element);
        await element.click();
    }

    async waitAndClickButtonByNonDefaultRole(btnName: string, role:HtmlRoles,  timeout: number = 90000, isExact: boolean = false) {
        const element = await this.pageElement.getButtonByNonDefaultRole(btnName, role, timeout, isExact);
        //await this.bringElementIntoViewPort(element);
        await element.click();
    }

    async waitAndClickIFrameButtonByRole(iFrameName: string, btnName: string, timeout: number = 90000, isExact: boolean = false) {
        const element = await this.pageElement.getIFrameButton(iFrameName, btnName, timeout, isExact);
        await element.click();
    }

    async clickElementById(id: string){
        await this.page.click(this.common.getXPathWithId(id));
    }

    /**
     * Must be called only when there are multiple elements matching the given ID
     * @param id 
     * @param elementIndex zero-based index; to click the first element, this value must be zero
     */
    async clickIndexedElementById(id: string, elementIndex: number){
        const ele = this.page.locator(this.common.getXPathWithId(id)).nth(elementIndex);
        await ele.click();
    }

    async clickElementByPlaceholder(placeholderText: string){
        await (await this.pageElement.getElementByPlaceholder(placeholderText)).click();
    }

    async clickElement(elementXPath: string, shouldIgnoreIfDisabled: boolean = false, disabledStatusAttribute:string = '', shouldForceClick: boolean = false): Promise<Locator>{
        const element = this.page.locator(elementXPath);
        const result = await this.clickElementIfAppropriate(element, shouldIgnoreIfDisabled, disabledStatusAttribute, shouldForceClick);
        return result ? element: null;
    }

    async clickElementHavingText(elementText: string, shouldIgnoreIfDisabled: boolean = false, disabledStatusAttribute:string = ''): Promise<Locator>{
        const elementXPath = `//*[text()='${elementText}']`;
        return await this.clickElement(elementXPath, shouldIgnoreIfDisabled, disabledStatusAttribute);
    }

    async clickElementByText(elementText: string, isExactText: boolean = false){
        await this.page.getByText(elementText, {exact: isExactText}).click();
    }

    async clickRadioButtonOption(elementText: string, shouldIgnoreIfDisabled: boolean = false, disabledStatusAttribute:string = ''): Promise<Locator>{
        return await this.clickElementHavingText(elementText, shouldIgnoreIfDisabled, disabledStatusAttribute);
    }
    /**
     * @param elementIndex 
     * @param elementXPath 
     * @param shouldIgnoreIfDisabled 
     * @param disabledStatusAttribute 
     * @returns 
     */
    async clickIndexedElement(elementIndex: number, elementXPath: string, shouldIgnoreIfDisabled: boolean = false, disabledStatusAttribute: string = ''): Promise<Locator> {
        const element = this.page.locator(elementXPath).nth(elementIndex);
        await this.clickElementIfAppropriate(element, shouldIgnoreIfDisabled, disabledStatusAttribute);
        return element;
    }

    async clickReferenceElement(parentElement: Locator, referenceXPath: string, shouldIgnoreIfDisabled: boolean = false, disabledStatusAttribute: string = ''){
        const element = parentElement.locator(referenceXPath);
        await this.clickElementIfAppropriate(element, shouldIgnoreIfDisabled, disabledStatusAttribute);
    }
    
    private async clickElementIfAppropriate(element:Locator, shouldIgnoreIfDisabled: boolean, disabledStatusAttribute:string, shouldForceClick: boolean = false){
        //fixture.logger.info('entering clickElementIfAppropriate');
        if (shouldIgnoreIfDisabled) {
            let isDisabled: boolean = false;
            if(disabledStatusAttribute){
                const temp = await element.getAttribute(disabledStatusAttribute);
                if(temp.toLowerCase() == "true")
                    isDisabled = true;
            }else{
                isDisabled = await element.isDisabled();
            }
            
            if (isDisabled)
                return false;
        }else{
            const isDisabled = await element.isDisabled();
            if(isDisabled)
                return false;
        }
        //fixture.logger.info('clickElementIfAppropriate before focus');
        await element.focus();
        //fixture.logger.info('clickElementIfAppropriate before click');
        await element.click({force: shouldForceClick});
        return true;
    }

    async clickLabelledTextElement(label: string, txtToClick: string){
        await this.page.getByLabel(label).getByText(txtToClick).click();
    }

    async clickLinkElement(linkTxt: string, isExact: boolean = false){
        await this.page.getByText(linkTxt, {exact: isExact}).click();
    }

    async clickElementByLabel(labelName: string, isExact: boolean = false): Promise<Locator>{
        const element = await this.pageElement.getElementByLabel(labelName, isExact);
        await element.click();
        return element;
    }

    async selectDropdownOptionByParentLabel(dropDownLabelName: string, optionToSelect: string, isExact: boolean = false){
        const locator = await this.clickElementByLabel(dropDownLabelName, isExact);
        await locator.selectOption(optionToSelect);
    }
    async clickElementByTestId(testId: string, index: number = 0){
        const element = await this.pageElement.getElementByTestId(testId,index);
        await element.click();
    }

    async clickItemByTestIdAndRole(testId: string, role: any): Promise<Locator>{
        const element = await this.pageElement.getElementByTestId(testId);
        /*eslint @typescript-eslint/no-unsafe-argument: "off" */
        await element.getByRole(role).click();
        return element;
    }

    async clickItemByLocatorAndRole(locator: string, role: any): Promise<Locator>{
        const element = await this.pageElement.getElementByLocatorAndRole(locator, role);
        /*eslint @typescript-eslint/no-unsafe-argument: "off" */
        await element.click();
        return element;
    }

    async clickElementByRole(role: any, name: string =""){
        if(name.length == 0)
            await this.page.getByRole(role).click();
        else
            await this.page.getByRole(role, {name : name}).click();
    }
    async clickChildElementByRole(parentElementXPath: string, role: any, name: string =""){
        if(name.length == 0)
            await this.page.locator(parentElementXPath).getByRole(role).click();
        else
            await this.page.locator(parentElementXPath).getByRole(role, {name : name}).click();
    }

    async clickChildElementByPlaceholder(parentElementXPath: string, placeholderTxt: any){
        await this.page.locator(parentElementXPath).getByPlaceholder(placeholderTxt).click();
    }

    async clickChildElementByText(parentElementXPath: string, text: any){
        await this.page.locator(parentElementXPath).getByText(text).click();
    }
    async clickTableCell(cellName: string, isExact: boolean = false){
        let element: Locator;
        if(isExact)
        {
            element = this.page.getByRole(HtmlRoles.TABLE_CELL, { name: cellName, exact: true})
        }else{
            element = this.page.getByRole(HtmlRoles.TABLE_CELL, { name: cellName})
        }
        await element.click();
    }
    async clickItemByText(textToClick: string, isExact: boolean = false){
        await this.page.getByText(textToClick, {exact: isExact}).click();
    }

    async clickElementByNameAndAttributeValue(elementName: string, attributeName: string, attributeValue:string){
        await (await this.pageElement.getElementByNameAndAttributeValue(elementName, attributeName, attributeValue)).click();
    }
}