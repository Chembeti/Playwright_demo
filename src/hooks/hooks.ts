import { BeforeAll, AfterAll, Before, After, Status } from "@cucumber/cucumber"
import { Browser, BrowserContext } from "@playwright/test";
import { fixture } from "./fixture";
import { invokeBrowser } from "../helpers/browser/browserManager";
import { getEnv } from "../helpers/env/env";
import { createLogger } from "winston";
import { options } from "../helpers/util/logger";
const fs = require("fs-extra");

let browser: Browser;
let context: BrowserContext;

BeforeAll(async function () {
    getEnv();
    browser = await invokeBrowser();
});
// It will trigger for all tests/scenarios that don't have any tags
Before(async function ({ pickle }) {
    const scenarioName = pickle.name + pickle.id
    context = await browser.newContext({
        recordVideo: {
            dir: "test-results/videos",
        },
    });
    const page = await context.newPage();
    fixture.page = page;
    fixture.logger = createLogger(options(scenarioName));
});


// It will trigger for the specific scenarios that have specified tags
Before("@auth", async function ({ pickle }) {
    const scenarioName = pickle.name + pickle.id
    context = await browser.newContext({
        //storageState: getStorageState(pickle.name),
        recordVideo: {
            dir: "test-results/videos",
        },
    });
    const page = await context.newPage();
    fixture.page = page;
    fixture.logger = createLogger(options(scenarioName));
});

After(async function ({ pickle, result }) {
    let videoPath: string;
    let img: Buffer;
    if (result?.status == Status.PASSED) {
        img = await fixture.page.screenshot({ path: `./test-results/screenshots/${pickle.name}.png`, type: "png" })
        videoPath = await fixture.page.video().path();
    }
    await fixture.page.close();
    await context.close();
    if (result?.status == Status.PASSED) {
        await this.attach(
            img, "image/png"
        );
        await this.attach(
            fs.readFileSync(videoPath),
            'video/webm'
        );
    }

});

AfterAll(async function () {
    await browser.close();
})

// function getStorageState(user: string): string | { cookies: { name: string; value: string; domain: string; path: string; expires: number; httpOnly: boolean; secure: boolean; sameSite: "Strict" | "Lax" | "None"; }[]; origins: { origin: string; localStorage: { name: string; value: string; }[]; }[]; } {
//     if (user.endsWith("admin"))
//         return "src/helper/auth/admin.json";
//     else if (user.endsWith("lead"))
//         return "src/helper/auth/lead.json";
// }
