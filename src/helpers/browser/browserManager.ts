import { LaunchOptions, chromium, firefox, webkit } from "playwright-core";

const defaultOptions: LaunchOptions = {
    headless: process.env.CI === 'true' || (process.env.IS_LOCAL !== 'true'),
    args: ['--window-size=1920,1080'],
}

export const invokeBrowser = (options: LaunchOptions = null) => {
    if(options == null){
        options = defaultOptions;
    }
    //const browserType = process.env.npm_config_BROWSER || "chrome";
    const browserType = process.env.BROWSER || "chrome";
    switch (browserType) {
        case "chrome":
            return chromium.launch(options);
        case "firefox":
            return firefox.launch(options);
        case "webkit":
            return webkit.launch(options);
        default:
            throw new Error("Please set the proper browser!")
    }

}