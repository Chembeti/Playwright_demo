import { Locator, Page } from "@playwright/test";
import PlaywrightWrapperCommon from "./pwWrapperCommon";
import HtmlRoles from "./htmlRoles";
import KeyBoardItems from "./keyBoardItems";
import PlaywrightWrapperPageElement from "./pwWrapperPageElement";
import AngularElements from "../../pages/angularElements";
import { fixture } from "../../hooks/fixture";
import PageConstants from "../../pages/pageConstants";
export default class PlaywrightWrapperDataWriter {

    constructor(private page: Page, private common: PlaywrightWrapperCommon, private pageElement: PlaywrightWrapperPageElement) { }

    /**
     * Must be called only when there are multiple elements matching the given ID
     * @param id 
     * @param elementIndex zero-based index; to click the first element, this value must be zero
     * @param txtToFill
     */
    async fillIndexedElementById(id: string, elementIndex: number, txtToFill: string){
        const ele = this.page.locator(this.common.getXPathWithId(id)).nth(elementIndex);
        await ele.fill(txtToFill);
    }

    async enterDataIntoInputAndPressaKey(element: Locator, val: string, keyToPress?: string){
        await element.click();
        await element.fill(val);
        if(keyToPress !== undefined && keyToPress !== null && keyToPress.length > 0)
            //await element.press(KeyBoardItems.TAB);
            await element.press(keyToPress);
    }

    async enterDataIntoChildInputAndPressaKey(element: Locator, val: string, keyToPress?: string){
        const childInput = element.locator("//input");
        await element.click();
        await childInput.fill(val);
        if(keyToPress !== undefined && keyToPress !== null && keyToPress.length > 0)
            //await element.press(KeyBoardItems.TAB);
            await element.press(keyToPress);
    }

    async enterValueIntoTextboxByXPath(xpath: string, val: string, shouldTabOut: boolean = false){
        const element = await this.pageElement.getVisibleElement(xpath);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, val, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, val);
    }

    async enterValueIntoIFrameTextboxByXPath(iFrameName: string, xpath: string, val: string, shouldTabOut: boolean = false, timeout: number = 90000){
        const element = await this.pageElement.getVisibleIFrameElementByXPath(iFrameName, xpath, true, timeout);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, val, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, val);
    }

    async enterValueIntoIndexedTextboxByXPath(index: number, xpath: string, val: string, shouldTabOut: boolean = false){
        const element = await this.pageElement.getIndexedVisibleElement(index, xpath);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, val, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, val);
    }
    async enterValueIntoTextbox(inputId: string, val: number | string, shouldTabOut: boolean = false){
        const locatorPath = this.common.getInputXPathWithId(inputId);
        //fixture.logger.info(`locatorPath value is ${locatorPath}`);
        const ele = this.page.locator(locatorPath);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(ele, val.toString(), KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(ele, val.toString());
    }

    async enterValueIntoSiblingTextbox(val: number | string, parentElement: Locator, siblingNodeType: string, siblingIndex: number = 1, shouldTabOut: boolean = false){
        const siblingLocatorXPath = `./following-sibling::${siblingNodeType}[${siblingIndex.toString()}]`;
        const ele = parentElement.locator(siblingLocatorXPath)
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(ele, val.toString(), KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(ele, val.toString());
    }
    async enterValueIntoIndexedTextbox(index: number, inputId: string, val: number | string, shouldTabOut: boolean = false){
        const locatorPath = this.common.getInputXPathWithId(inputId);
        //fixture.logger.info(`indexed locatorPath value is ${locatorPath}`);
        const ele = this.page.locator(locatorPath).nth(index);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(ele, val.toString(), KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(ele, val.toString());
    }
    async enterValueIntoTextboxByTestId(txtBoxTestId: string, value: string, shouldTabOut: boolean = false){
        const element = this.page.getByTestId(txtBoxTestId);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }

    async enterValueIntoTextboxByTestIdAndRole(txtBoxTestId: string, value: string, shouldPressEnter: boolean = true){
        const element = this.page.getByTestId(txtBoxTestId).getByRole(HtmlRoles.TEXT_BOX);
        if(shouldPressEnter)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.ENTER);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }

    async enterValueIntoTextboxByPlaceholder(placeholderText: string, value: string, shouldTabOut: boolean = false){
        const element = this.page.getByPlaceholder(placeholderText);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }

    async enterValueIntoChildTextboxByPlaceholder(parentElementXPath: string, placeholderText: string, value: string, shouldTabOut: boolean = false){
        const element = this.page.locator(parentElementXPath).getByPlaceholder(placeholderText);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }
    async enterValueIntoTextboxByLabel(labelText: string, value: string, shouldTabOut: boolean = false, isExact: boolean = false){
        const element = this.page.getByLabel(labelText, {exact: isExact});
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }
    async enterValueIntoTextboxInATableRow(rowName: string, value: string, shouldTabOut: boolean = false){
        const element = this.page.getByRole(HtmlRoles.TABLE_ROW_ROLE, { name: `${rowName}` }).getByRole(HtmlRoles.TEXT_BOX);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }

    /**
     * Note: this methdo does not check if the specified xpath corresponds to an INPUT type. If it does not then this method will fail.
     * @param xpath xpath of the element to find below a table row ('row') element
     * @param rowName 
     * @param value 
     */
    async enterValueIntoTextboxInATableRowByXPath(xpath: string, rowName: string, value: string, shouldTabOut: boolean = false){
        const element = this.page.getByRole(HtmlRoles.TABLE_ROW_ROLE, { name: `${rowName}` }).locator(xpath);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }

    async enterValueIntoIndexedTextboxInATableRow(index: number, rowName: string, value: string, shouldTabOut: boolean = false){
        const element = this.page.getByRole(HtmlRoles.TABLE_ROW_ROLE, { name: `${rowName}` }).getByRole(HtmlRoles.TEXT_BOX).nth(index);
        if(shouldTabOut)
            await this.enterDataIntoInputAndPressaKey(element, value, KeyBoardItems.TAB);
        else
            await this.enterDataIntoInputAndPressaKey(element, value);
    }

    async enterValueIntoTextAreaByName(txtAreaInputName: string, val: string){
        const locatorPath = `//${HtmlRoles.TEXT_AREA}[@name='${txtAreaInputName}']`;
        const element = this.page.locator(locatorPath);
        await element.fill(val);
    }
    
    async enterValueIntoTextAreaById(txtAreaInputId: string, val: string){
        const locatorPath = `//${HtmlRoles.TEXT_AREA}[@id='${txtAreaInputId}']`;
        const element = this.page.locator(locatorPath);
        await element.fill(val);
    }

    async selectOption(optionName: string){
        //TODO: handle scrollbar to make the option visible
        const element = this.page.getByRole(HtmlRoles.OPTION, { name: optionName });
        await element.click({ force: true });
    }

    async selectLabelledDropdownOption(dropdownLabel: string, optionName: string){
        await this.page.getByLabel(dropdownLabel).selectOption(optionName);
    }
    /**
     * 
     * @param dropdownElement 
     * @param optionText will be used to filter items by searching
     * @param optionSearchText if this is empty, first search result will be used with the above filter; else specific text element will be clicked
     */
    async selectDropdownOption(dropdownElement: Locator, optionText: string, optionSearchText: string = ""){
        await this.clickDropdownOption(dropdownElement, optionText);
        if(optionSearchText.length == 0)
            await dropdownElement.press(KeyBoardItems.ENTER);
        else{
            await this.page.getByText(optionSearchText).click();
        }
    }

    async clickDropdownOption(dropdownElement: Locator, optionText: string){
        //await dropdownElement.fill(optionText);
        await dropdownElement.click();
        await this.common.delay(1000);
        await dropdownElement.fill(optionText);
        await this.common.delay(1000);
    }

    async selectDropdownOptionWithAdditionalSearch(dropdownElement: Locator, optionTextToFilter: string, optionTextToSelect: string){
        await dropdownElement.click();
        await dropdownElement.fill(optionTextToFilter);
        await this.common.delay(1000);
        this.page.getByLabel(HtmlRoles.OPTIONS_LIST).getByText(optionTextToSelect);
        await dropdownElement.press(KeyBoardItems.ENTER);
    }

    /**
     * Selects an item from a dropdown having no specific visual identifier such as name. Such dropdowns will be shown to user with the first dropdown option
     * @param defaultDropdownOption option that is displayed to user by default
     * @param optionToSelect 
     * @param [elementIndex=0] 
     */
    async selectOptionFromAngularDropdownHavingNoName(defaultDropdownOption: string, optionToSelect: string, elementIndex: number = 0): Promise<void>{
        const dropdown = await this.pageElement.getElementHavingText(AngularElements.ng_select, defaultDropdownOption, elementIndex);
        await dropdown.click();
        await this.page.getByRole(HtmlRoles.OPTION, {name: optionToSelect}).click();
    }
    /**
     * 
     * @param dropdownText 
     * @param optionText will be used to filter items by searching
     * @param optionSearchText if this is empty, first search result will be used with the above filter; else specific text element will be clicked
     */
    async selectAngularDropdownOption(dropdownText: string, optionText: string, optionSearchText: string = ""){
        const element = await this.pageElement.getSearchableDropDownHavingText(AngularElements.ng_select, dropdownText);
        await this.selectDropdownOption(element, optionText, optionSearchText);
    }

    async selectAngularDropdownOptionFromPanel(dropdownText: string, optionText: string, optionSearchText: string = "", optionContainerElement: string = 'p'){
        fixture.logger.info(`entering selectAngularDropdownOptionFromPanel`);
        const element = await this.pageElement.getSearchableDropDownHavingText(AngularElements.ng_select, dropdownText);
        // const element = this.page.locator(AngularElements.ng_select)
        //                     .filter({ hasText: dropdownText }).locator('input');            
        //                     //.filter({ hasText: dropdownText }).getByRole(HtmlRoles.TEXT_BOX);
        //                     //.filter({ hasText: dropdownText }).getByRole(HtmlRoles.COMBOBOX);
        await this.clickDropdownOption(element, optionText);
        if(optionSearchText.length == 0)
            optionSearchText = optionText.trim();
        try{
        //const optionXPath = `//ng-dropdown-panel//p[contains(.,'${optionSearchText}')]`;
        const optionXPath = `//${AngularElements.dropdown_panel}//${optionContainerElement}[contains(.,'${optionSearchText}')]`;
        await this.page.locator(optionXPath).click();
        }catch(err){
            fixture.logger.error(`err message is...${err.message}`);
            fixture.logger.error(`err name is...${err.name}`);
            if(err.name === PageConstants.TIMEOUT_ERROR || err.message.includes("Timeout"))
            {
                fixture.logger.info(`trying other ways as timeout error occurred`);
                //it is observed sometimes the dropdown with options is not displayed so we will try again
                // Get the input element within ng-select
                const input = this.page.locator('input[role="combobox"][type="text"]');
                
                // Clear existing value if any
                await input.clear();
                await this.common.delay(1000);
                // Type the text with small delays between characters
                await input.type(optionText, { delay: 100 });
                
                // Ensure dropdown panel is open
                await this.page.waitForSelector('ng-dropdown-panel', { 
                state: 'visible',
                timeout: 5000
                });
                
                // Wait for and click the filtered option
                const option = this.page.locator('ng-dropdown-panel .ng-option', {
                hasText: optionText
                });
                await option.waitFor({ state: 'visible' });
                await option.click();
                await this.common.delay(1000);   
            }
        }
    }
    async clickAngularDropdownOption(dropdownText: string, optionText: string): Promise<Locator>{
        const element = await this.pageElement.getSearchableDropDownHavingText(AngularElements.ng_select, dropdownText);
        await this.clickDropdownOption(element, optionText);
        return element;
    }
    
    async selectAngularDropdownOptionWithAdditionalSearch(dropdownText: string, primaryOptionText: string, secondaryOptionText: string){
        const element = await this.pageElement.getSearchableDropDownHavingText(AngularElements.ng_select, dropdownText);
        await this.selectDropdownOptionWithAdditionalSearch(element, primaryOptionText, secondaryOptionText);
    }
    async selectAngularCheckboxOption(){
        await this.page.locator(AngularElements.matCheckbox).click();
    }

    async selectIndexedAngularCheckboxOption(index: number){
        await this.page.locator(AngularElements.matCheckbox).nth(index).click();
    }
    async selectDropdownOptionInATabelCell(cellName: string, optionText: string, exactCellName: boolean = false){
        const element = this.page.getByRole(HtmlRoles.TABLE_CELL, { name: `${cellName}`, exact: exactCellName }).getByRole(HtmlRoles.TEXT_BOX);
        await this.selectDropdownOption(element, optionText);
    }

    async selectDropdownOptionInATabelCellWithAdditionalSearch(cellName: string, optionTextToFilter: string, optionTextToSelect: string, exactCellName: boolean = false){
        const element = this.page.getByRole(HtmlRoles.TABLE_CELL, { name: `${cellName}`, exact: exactCellName }).getByRole(HtmlRoles.TEXT_BOX);
        await this.selectDropdownOptionWithAdditionalSearch(element, optionTextToFilter, optionTextToSelect);
    }

    async checkCheckboxByLabel(labelName: string){
        const element = await this.pageElement.getElementByLabel(labelName);
        //await element.waitFor({state: "visible"});
        await element.check();
    }

    async checkCheckBox(xpath: string){
        const element = this.page.locator(xpath);
        if(!await element.isChecked())
            await element.check();
    }
}