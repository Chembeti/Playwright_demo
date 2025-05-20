/* eslint @typescript-eslint/no-explicit-any: "off" */
import { Locator, Page } from "@playwright/test";
import KeyBoardItems from "./keyBoardItems";
import StringValidator from "../types/stringValidator";
import CssItems from "./cssItems";
import HtmlRoles from "./htmlRoles";
import PlaywrightWrapperCommon from "./pwWrapperCommon";
export default class PlaywrightWrapperKeyboard{

    constructor(private page: Page, private common: PlaywrightWrapperCommon) { }

    async pressKeyBoard(element: Locator, keyToPress: string, delayOrTimeoutInMillSec: number = 0){
        const options = {delay: 0};
        if(delayOrTimeoutInMillSec >= 0)
            options.delay = delayOrTimeoutInMillSec

        if(element == undefined || element == null)
            await this.page.keyboard.press(keyToPress, options);
        else{
            await element.press(keyToPress);
        }
    }

    async tabOutFromCurrentElement(element: Locator) {
        //await element.press(KeyBoardItems.TAB);
        await this.pressKeyBoard(element, KeyBoardItems.TAB);
    }
    async tabOutFromCurrentAndGetFocusedElement(currentElementLocatorIdentifier: string, noOfTimesToTabOut: number){
        //const PSEUDO_CSS_FOR_FOCUS = '*:focus';
        let tempLocator = currentElementLocatorIdentifier;
        if(!StringValidator.isValidString(tempLocator))
            tempLocator = CssItems.FOCUS;
        
        const tempElement = this.page.locator(tempLocator);
        if (noOfTimesToTabOut < 1)
            return tempElement;

        await this.pressKeyBoard(tempElement, KeyBoardItems.TAB);

        if (noOfTimesToTabOut > 1)
        {
            for (let index = 0; index < noOfTimesToTabOut - 1; index++) {
                const tempFocusedElement = this.page.locator(CssItems.FOCUS);
                await this.pressKeyBoard(tempFocusedElement, KeyBoardItems.TAB);
            }
        }
        return this.page.locator(CssItems.FOCUS);
    }

    async tabOutToPreviousElement(){
        await this.page.locator(HtmlRoles.PAGE_BODY).press(KeyBoardItems.SHIFT_TAB); 
    }

    async tabOutToNextElement(){
        await this.page.locator(HtmlRoles.PAGE_BODY).press(KeyBoardItems.TAB); 
    }
}