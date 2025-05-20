import { Locator, Page, expect } from "@playwright/test";
import PlaywrightWrapperCommon from "./pwWrapperCommon";
import HtmlRoles from "./htmlRoles";
import PlaywrightWrapperPageElement from "./pwWrapperPageElement";
export default class PlaywrightWrapperDataReader {

    constructor(private page: Page, private common: PlaywrightWrapperCommon, private pageElement: PlaywrightWrapperPageElement) { }

    async getTextboxValue(inputId: string){
        const locatorPath = this.common.getInputXPathWithId(inputId);
        return await this.page.locator(locatorPath).inputValue();
    }

    private async getElementTextValue(element: Locator){
        let result = "";
        if(element !== undefined && await element.isVisible())
            result = await this.getLocatorText(element);

        return result;
    }

    private async getLocatorText(element: Locator): Promise<string>{
        return await element.textContent();
    }

    async getElementText(searchText: string, exact: boolean = false): Promise<string>{
        const element = this.page.getByText(searchText, {exact: exact});
        return await this.getElementTextValue(element);
    }

    async getSiblingElementText(parentElement: Locator, siblingNodeType: string, siblingIndex: number = 1): Promise<string>{
        const siblingLocatorXPath = `./following-sibling::${siblingNodeType}[${siblingIndex.toString()}]`;
        const element = parentElement.locator(siblingLocatorXPath)
        return await this.getElementTextValue(element);
    }

    async getElementTextById(id: string): Promise<string>{
        const element = await this.pageElement.getElementById(id);
        return await this.getLocatorText(element);
    }

    async getElementTextByTestId(txtBoxTestId: string): Promise<string>{
        const element = this.page.getByTestId(txtBoxTestId);
        return await this.getLocatorText(element);
    }

    async getVisibleElementTextById(id: string): Promise<string>{
        const element = await this.pageElement.getVisibleElementById(id, 60000);
        return await this.getLocatorText(element);
    }

    async getElementTextByXPath(xpath: string, includeChildElementsText: boolean): Promise<string>{
        if(includeChildElementsText)
            return await this.page.locator(xpath).textContent();
        else
            return await this.page.locator(xpath).innerText();
    }

    async getInputFieldValueByName(name: string): Promise<string>{
        const xPath = `//${HtmlRoles.INPUT}[@name='${name}']`;
        return await this.page.locator(xPath).inputValue();
    }

    async getInputFieldValueByXPath(xpath: string): Promise<string>{
        return await this.page.locator(xpath).inputValue();
    }

    async getIndexedInputFieldValueByXPath(xpath: string, index: number): Promise<string>{
        return await this.page.locator(xpath).nth(index).inputValue();
    }

    async getIFrameFieldValueByRole(iframeName: string, role: any, fieldName: string): Promise<string>{
        return await this.page.frameLocator(`iframe[name="${iframeName}"]`).getByRole(role, { name: fieldName }).inputValue();
    }

    async getIFrameFieldValueByXPath(iFrameName: string, xpath: string): Promise<string>{
        const element = await this.pageElement.getIFrameElementByXPath(iFrameName, xpath);
        return element.inputValue();
    }

    async getIndexedIFrameFieldValueByXPath(iFrameName: string, xpath: string, index: number): Promise<string>{
        const element = await this.pageElement.getIndexedIFrameElementByXPath(iFrameName, xpath, index);
        return element.inputValue();
    }

    async isDropdownItemSelected(locator: Locator, optionTextToCheck: string){
          await expect(locator).toHaveValue(optionTextToCheck);
          return true;
    }
}