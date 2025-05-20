import { BrowserContextOptions, Page } from "@playwright/test";
import HtmlElementProperties from "./htmlElementProperties";
import HtmlRoles from "./htmlRoles";

export default class PlaywrightWrapperCommon {
    constructor(private page: Page) { }
    async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getSelectorWithPlaceholderText(placeholderText: string): string{
        return `[${HtmlElementProperties.PLACEHOLDER}="${placeholderText}"]`;
    }

    getSelectorWithTestId(testIdValue: string): string{
        return `[${HtmlElementProperties.TEST_ID}="${testIdValue}"]`;
    }

    /**
     * Uses XPath to find an element with a similar test id using 'contains' in the XPath expression.
     * This is useful for finding elements that have a test id that contains a specific value, rather than an exact match.
     * @param testIdValue 
     * @returns 
     */
    getSelectorWithSimilarTestId(testIdValue: string): string{
        return `//*[contains(@${HtmlElementProperties.TEST_ID}, "${testIdValue}")]`;
    }

    getXPathWithId(id: string) {
        return `[${HtmlElementProperties.ID}='${id}']`;
    }

    getInputXPathWithId(inputId: string) {
        return `${HtmlRoles.INPUT}[name="${inputId}"]`
    }

    async getNewPageWithNewContext(contextOptions: BrowserContextOptions): Promise<Page> {
        const newCtx = await this.page.context().browser()?.newContext(contextOptions);
        return await newCtx?.newPage();
    }

    getHttpsIgnoredBrowserContextOptions(): BrowserContextOptions {
        const contextOptions: BrowserContextOptions = {
            ignoreHTTPSErrors: true,
        };
        return contextOptions;
    }
}