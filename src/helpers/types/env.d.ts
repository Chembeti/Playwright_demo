export { };

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BROWSER: "chrome" | "firefox" | "webkit",
            ENV: "QA1" | "QA2",
            BASEURL: string,
            TOKEN: "token",
            API_BASEURL: string,
            API_URI_PREFIX: string,
            IS_LOCAL: "true" | "false",
            CUCUMBER_RETRY_COUNT: string,
            playwrightUser: string,
            playwrightPasswd: string,
            DB_SERVER: string,
            DB_PORT: string,
            DB_DATABASE: string,
            DB_REQ_TIMEOUT: string,
            AUTHORIZATION_URL: string,
            HEAD: "true" | "false",
            LOG_LEVEL: "error" | "warn" | "info" | "http" | "verbose" | "debug" | "silly",
            DEFAULT_DATA_SOURCE_LOCATION: string,
            DEFAULT_CACHE_TIMEOUT_IN_SEC: string,
            EXTENDED_CACHE_TIMEOUT_IN_SEC: string,
            EXTEND_CACHE: string,
            USE_AZURE_CLI_FOR_DB: "true" | "false", //if the current login user (on the machine where the test is running) has Azure compatible access to the database, then this should be true
            DATA_REQUIREMENTS_COMMON: string,
        }
    }
}