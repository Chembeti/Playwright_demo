require('dotenv').config({path: `src/helpers/env/.env.QA2`});

module.exports = {
    default: {
        tags: process.env.npm_config_TAGS || "",
        formatOptions: {
            snippetInterface: "async-await"
        },
        paths: [
            "src/tests/features/"
        ],
        dryRun: false,
        require: [
            "src/tests/steps/*.ts",
            "src/hooks/hooks.ts"
        ],
        requireModule: [
            "ts-node/register"
        ],
        format: [
            "progress-bar",
            // "html:test-results/cucumber-report.html",
            // "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt"
        ],
        parallel: 2,
        retry: (() => {
            const retryCount = parseInt(process.env.CUCUMBER_RETRY_COUNT, 10);
            return isNaN(retryCount) ? 0 : retryCount;
        })()
    },
    rerun: {
        formatOptions: {
            snippetInterface: "async-await"
        },
        publishQuiet: true,
        dryRun: false,
        require: [
            "src/tests/steps/*.ts",
            "src/hooks/hooks.ts"
        ],
        requireModule: [
            "ts-node/register"
        ],
        format: [
            "progress-bar",
            // "html:test-results/cucumber-report.html",
            // "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt"
        ],
        parallel: 2,
        retry: (() => {
            const retryCount = parseInt(process.env.CUCUMBER_RETRY_COUNT, 10);
            return isNaN(retryCount) ? 0 : retryCount;
        })()
    }
}
