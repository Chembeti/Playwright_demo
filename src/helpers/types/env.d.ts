export { };

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BROWSER: "chrome" | "firefox" | "webkit",
            ENV: "QA1" | "QA2",
            BASEURL: string,
            HEAD: "true" | "false"
        }
    }
}