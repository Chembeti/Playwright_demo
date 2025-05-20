import { BeforeAll, AfterAll, Before, After, Status, setDefaultTimeout, AfterStep } from "@cucumber/cucumber"
import { Browser, BrowserContext, request } from "@playwright/test";
import { fixture } from "./fixture";
import { invokeBrowser } from "../helpers/browser/browserManager";
import { getEnv } from "../helpers/env/env";
import { createLogger } from "winston";
import { options } from "../helpers/util/logger";
import DataBag from "../helpers/util/dataBag";
import TestDataProvider from "../helpers/util/test-data/testDataProvider";
import PageFactory from "../pages/pageFactory";
import DataBagKeys from "../tests/steps/dataBagKeys";
import StepDataHelper from "../tests/steps/stepDataHelper";
import { TestDataType } from "../helpers/util/test-data/TestDataType";
import CommonData from "../helpers/util/test-data/dataRequirements/commonData";
import { GherkinDocument, Pickle, TableCell, TableRow } from "@cucumber/messages";

/*eslint @typescript-eslint/no-unsafe-argument: "off" */
/*eslint @typescript-eslint/no-unsafe-assignment: "off" */
/*eslint @typescript-eslint/no-unsafe-call: "off" */
/*eslint @typescript-eslint/no-unsafe-member-access: "off" */
const fs = require("fs-extra");
const path = require("path");

let browser: Browser;
let context: BrowserContext;
const buildSignalFilePath = 'buildSignal.txt';
//const loggedInUserAuthInfoFilePath = 'auth.json';

interface FeatureResult {
    name: string;
    path: string;
    scenarios: ScenarioResult[];
}

interface ScenarioResult {
    name: string;
    duration: number;
    failedStep?: string;
    retries: number;
}

interface Example {
    name: string;
    tableHeader: string[];
    tableBody: string[][];
}
    
const testResultsDir = path.join(__dirname, '../../test-results'); 
const failedScenariosDir = path.join(testResultsDir, 'failed');

let passedFeatures: Record<string, FeatureResult> = {};

BeforeAll(async function () {
    getEnv();
    browser = await invokeBrowser();
    fixture.testDataProvider = new TestDataProvider();
    
    // Ensure test results directories exist
    fs.ensureDirSync(testResultsDir);
    // Cleanup previous results
    fs.emptyDirSync(testResultsDir);
    fs.ensureDirSync(failedScenariosDir);
    
    fixture.scenarioRetryCount = {};
    fixture.maxRetryCount= parseInt(process.env.CUCUMBER_RETRY_COUNT);

    if(fs.existsSync(buildSignalFilePath)){
       fs.removeSync(buildSignalFilePath); 
    }
    /*if(fs.existsSync(loggedInUserAuthInfoFilePath)){
        fs.removeSync(loggedInUserAuthInfoFilePath); 
     }*/
    initializeDataRequirements();
});

function initializeDataRequirements() {
    const globalDataBag = new DataBag();
    
    let defaultSourceLocation = process.env.DEFAULT_DATA_SOURCE_LOCATION;
    if (defaultSourceLocation.toLowerCase() === "json") {
        defaultSourceLocation += "://";
    }
    const commonReqDataLocation = defaultSourceLocation + "DATA_REQUIREMENTS_COMMON";
    
    const commonData = StepDataHelper.getSingleTestDataRecordForType(TestDataType.CommonData, commonReqDataLocation) as CommonData;

    globalDataBag.saveData(DataBagKeys.DATA_REQ_COMMON, commonData);
    fixture.globalDataBag = globalDataBag;
}

// It will trigger for all tests/scenarios that don't have any tags
Before(async function ({ pickle, gherkinDocument }) {
    await runScenarioSetup(gherkinDocument, pickle);
});

// It will trigger for all tests/scenarios that have the tag '@my-sample-tag'
Before("@my-sample-tag", async function ({ pickle, gherkinDocument }) {
    setDefaultTimeout(5 * 60 * 1000); 
    await runScenarioSetup(gherkinDocument, pickle, true);
});
function cleanUpLastScenarioDetails() {
    const lastScenarioexecutionCompleted = fixture.globalDataBag.getData(DataBagKeys.LAST_SCENARIO_EXECUTION_COMPLETED) as boolean;
    if (lastScenarioexecutionCompleted == undefined || lastScenarioexecutionCompleted == null || lastScenarioexecutionCompleted == true) {
        return;
    }
    const lastScenarioArtifactsDirectoryName = fixture.globalDataBag.getData(DataBagKeys.LAST_SCENARIO_ARTIFACTS_DIRECTORY_NAME) as string;
    const lastScenarioRetryIndicatorKey = fixture.globalDataBag.getData(DataBagKeys.LAST_SCENARIO_RETRY_INDICATOR_KEY) as string;
    if (lastScenarioArtifactsDirectoryName) {
        //when a scenario does not execute 'After' step, we need to clean up the artifacts created for that scenario that includes logs, video and trace files
        //NOTE: traces and screenshots are not cleaned up as they are created only when the scenario is executed successfully
        let lastScenarioArtifactsPath = path.join(testResultsDir, 'logs', lastScenarioArtifactsDirectoryName);
        if (fs.existsSync(lastScenarioArtifactsPath)) {
            fs.removeSync(lastScenarioArtifactsPath);
        }
        lastScenarioArtifactsPath = path.join(testResultsDir, 'videos', lastScenarioArtifactsDirectoryName);
        if (fs.existsSync(lastScenarioArtifactsPath)) {
            fs.removeSync(lastScenarioArtifactsPath);
        }
    }
    if (lastScenarioRetryIndicatorKey) {
        if (fixture.scenarioRetryCount[lastScenarioRetryIndicatorKey]) {
            fixture.scenarioRetryCount[lastScenarioRetryIndicatorKey]--; // Decrement retry count for the scenario
        }
    }
    fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_ARTIFACTS_DIRECTORY_NAME, null);
    fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_RETRY_INDICATOR_KEY, null);
}

async function runScenarioSetup(gherkinDocument: GherkinDocument, pickle: Pickle, ignoreHTTPSErrors: boolean = false){
    cleanUpLastScenarioDetails()
    let pickleName = pickle.name;
    
    // If it's a Scenario Outline, append the example values
    const examples = getCurrentExampleValues(gherkinDocument, pickle);
    console.log(`Example parameters are: ${JSON.stringify(examples)}`);
    if(examples.length > 0) {
        pickleName += ` [${examples.join("-")}]`;
    }
    const scenarioName = pickleName + "-" + Date.now().toString();
    fixture.logger = createLogger(options(scenarioName));
    const dataBag = new DataBag();
    fixture.dataBag = dataBag; //we want databag to be unique for each scenario and accessible for all steps in that scenario
    fixture.requestContext = await request.newContext();
    if (!fixture.scenarioRetryCount[pickleName]) {
        fixture.scenarioRetryCount[pickleName] = 1; // Initialize retry count for the scenario
    } else {
        fixture.scenarioRetryCount[pickleName]++; // Increment retry count on subsequent attempts
    }

    //const videoSize = { width: 1280, height: 720 };
    const videoSize = { width: 1920, height: 1080 };
    const contextOptions = {
        viewport: null, // setting viewport to null is required to launch the browser in full-screen mode
        //viewport: { width: 1920, height: 1080 }, //this is needed only if these sizes are mentioned in the browser LaunchOptions (check browserManager.ts)
        recordVideo: {
            dir: `test-results/videos/${scenarioName}`,
            size: videoSize,
        },
    };

    /*if (fs.existsSync(loggedInUserAuthInfoFilePath)) {
        fixture.logger.info(`Auth info is available, attaching it to the context`);
        contextOptions['storageState'] = loggedInUserAuthInfoFilePath;
    } else {
        fixture.logger.info(`Auth info is NOT available, not attaching it to the context`);
    }*/

    if (ignoreHTTPSErrors) {
        contextOptions['ignoreHTTPSErrors'] = true;
    }

    context = await browser.newContext(contextOptions);
    await context.tracing.start({
        name: scenarioName,
        //title: pickle.name,
        title: pickleName,
        sources: true, screenshots: true, snapshots: true,
    });
    const page = await context.newPage();
    
    // Maximize the window and get the available screen size
    const { innerWidth, innerHeight } = await page.evaluate(() => {
        window.moveTo(0, 0);
        window.resizeTo(screen.availWidth, screen.availHeight);
        return {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight
        };
      });

    console.log(`Available screen size: ${innerWidth}x${innerHeight}`);

    // Set viewport to match the available screen size
    await page.setViewportSize({ width: innerWidth, height: innerHeight });

    // Log the final page viewport size
    const viewportSize = page.viewportSize();
    console.log(`Final viewport size: ${viewportSize?.width}x${viewportSize?.height}`);

    fixture.dataBag.saveData(DataBagKeys.SCREEN_WIDTH, innerWidth);
    fixture.dataBag.saveData(DataBagKeys.SCREEN_HEIGHT, innerHeight);
    fixture.page = page;
    fixture.browserContext = context;
    fixture.pageFactory = new PageFactory();
    fixture.dataBag.saveData(DataBagKeys.SCENARIO_NAME, scenarioName);
    fixture.dataBag.saveData(DataBagKeys.PICKLE_NAME, pickleName);
    fixture.logger.info(`Scenario - ${scenarioName} - started`);
    console.log(`Scenario - ${scenarioName} - started`);
    fixture.logger.info(`Feature file path: ${pickle.uri}`);
    fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_EXECUTION_COMPLETED, false);
    fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_ARTIFACTS_DIRECTORY_NAME, scenarioName);
    fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_RETRY_INDICATOR_KEY, pickleName);
    //fixture.dataBag.saveData(DataBagKeys.USER_AUTH_INFO_FILE_PATH, loggedInUserAuthInfoFilePath);
}

/**
 * @NOTE 1: This function is used to get the current example values for a scenario outline. 
 * It is ASSUMED that the example values are present in the gherkin document and that the pickle steps contain the example values.
 * It is also ASSUMED that the example values are unique and do not repeat in the gherkin document.
 * It is also ASSUMED that the example values are NOT used in the scenario steps except inside the "<>" tags.
 * 
 * 2: With the example data, scenario name can become too large hence ensure to have crisp and short example values so that file creations are not an issue.
 * @param gherkinDocument 
 * @param pickle 
 * @returns 
 */
function getCurrentExampleValues(gherkinDocument: GherkinDocument, pickle: Pickle): string[] {
    const exampleValues: string[] = [];

    gherkinDocument.feature?.children.forEach((child) => {
        if (child.scenario && child.scenario.examples) {
            child.scenario.examples.forEach((example) => {
                example.tableBody.forEach((row: TableRow) => {
                    const rowValues = row.cells.map((cell: TableCell) => cell.value);
                    const isCurrentExample = rowValues.some(value =>
                        pickle.steps.some(step => step.text.includes(value))
                    );
                    if (isCurrentExample) {
                        exampleValues.push(...rowValues);
                    }
                });
            });
        }
    });

    return exampleValues;
}

AfterStep(async function ({ pickleStep, result }) {
    if (result?.status === Status.FAILED) {
        fixture.dataBag.saveData(DataBagKeys.FAILED_STEP, pickleStep.text);
    }
});

After(async function ({ pickle, result }) {
    const scenarioName = fixture.dataBag.getData(DataBagKeys.SCENARIO_NAME) as string;
    const pickleName = fixture.dataBag.getData(DataBagKeys.PICKLE_NAME) as string;
    const currentRetry = fixture.scenarioRetryCount[pickleName] || 1;
    const maxRetries = fixture.maxRetryCount;
    const isFinalAttempt = result?.status === Status.PASSED || currentRetry === maxRetries + 1;
    console.log(`isFinalAttempt: ${isFinalAttempt}, currentRetry: ${currentRetry}, maxRetries: ${maxRetries}, status: ${result?.status}`);
    
    try {
        await fixture.requestContext.dispose();
        let videoPath: string;
        let img: Buffer;
        if (result?.status == Status.PASSED) {
            img = await fixture.page.screenshot({ path: `./test-results/screenshots/${pickleName}.png`, type: "png" })
            videoPath = await fixture.page.video().path();
        }else if (result?.status == Status.FAILED) {
            if(!fs.existsSync(buildSignalFilePath)) {
                const currentRetry = fixture.scenarioRetryCount[pickleName];
                if (currentRetry == fixture.maxRetryCount + 1) {
                    fs.createFileSync(buildSignalFilePath);
                    fs.writeFileSync(buildSignalFilePath, "failed");
                }
            }
        }

        const tracePath = `./test-results/traces/${scenarioName}/${pickleName}`; 
        await context.tracing.stop({path: tracePath});
        
        await fixture.page.close();

        fixture.pageFactory.clear();

        /*if (!fs.existsSync(loggedInUserAuthInfoFilePath)) {
            fixture.logger.info(`Auth info is not available, hence creating it`);
            await context.storageState({ path: loggedInUserAuthInfoFilePath }); //note: this creates additional emtpy video file
        } else {
            fixture.logger.info(`Auth info is available`);
        }*/
        
        await context.close();
        
        const featurePath = pickle.uri;
        const featureName = getFeatureName(featurePath);
        const duration = result?.duration ? result.duration.nanos / 1_000_000 : 0;
        const scenarioResult: ScenarioResult = {
            name: scenarioName,
            duration: duration,
            retries: fixture.scenarioRetryCount[pickleName] - 1,
        };

        if (result?.status === Status.PASSED) {
            if (!passedFeatures[featurePath]) {
                passedFeatures[featurePath] = {
                    name: featureName,
                    path: featurePath,
                    scenarios: []
                };
            }
            passedFeatures[featurePath].scenarios.push(scenarioResult);
        } else if (result?.status === Status.FAILED && isFinalAttempt) {
            const failedStep = fixture.dataBag.getData(DataBagKeys.FAILED_STEP) as string;
            scenarioResult.failedStep = failedStep;

            // Write failed scenario immediately
            const featureResult: FeatureResult = {
                name: featureName,
                path: featurePath,
                scenarios: [scenarioResult]
            };

            writeFailedFeatureResult(featureResult);
        }

        fixture.dataBag = null;
        if (result?.status == Status.PASSED) {
            this.attach(
                img, "image/png"
            );
            this.attach(
                fs.readFileSync(videoPath),
                'video/webm'
            );

            fixture.logger.info(`Scenario - ${scenarioName} - completed SUCCESSFULLY`);
            console.log(`Scenario - ${scenarioName} - completed SUCCESSFULLY`);
        }else{
            console.log(`Scenario - ${scenarioName} - completed WITH ERRORS`);
            fixture.logger.error(`Scenario - ${scenarioName} - completed WITH ERRORS`);
        }
    } catch (error) {
        console.log(`After-logic for the scenario - ${scenarioName} - failed: ${error}`);
        fixture.logger.error(`After-logic for the scenario - ${scenarioName} - failed: ${error}`);
    }

    fixture.globalDataBag.saveData(DataBagKeys.LAST_SCENARIO_EXECUTION_COMPLETED, true);
});

AfterAll(async function () {
    // Write passed scenarios
    fs.writeJsonSync(
        path.join(testResultsDir, 'passed-scenarios.json'),
        Object.values(passedFeatures),
        { spaces: 2 }
    );
    fixture.globalDataBag = null;
    fixture.testDataProvider.close();
    await browser.close();
});

function getFeatureName(featurePath: string): string {
    return path.basename(featurePath, '.feature');
}

function writeFailedFeatureResult(featureResult: FeatureResult) {
    const sanitizedFeatureName = sanitizeFilename(featureResult.name);
    const fileName = `${sanitizedFeatureName}-failed-scenarios.json`;
    const filePath = path.join(failedScenariosDir, fileName);

    // Merge with existing results if file exists
    let existingData: FeatureResult = { name: '', path: '', scenarios: [] };
    if (fs.existsSync(filePath)) {
        existingData = fs.readJsonSync(filePath);
    }

    const mergedResult: FeatureResult = {
        name: featureResult.name,
        path: featureResult.path,
        scenarios: [...existingData.scenarios, ...featureResult.scenarios]
    };

    fs.writeJsonSync(filePath, mergedResult, { spaces: 2 });
}

function sanitizeFilename(name: string): string {
    return name
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .substring(0, 50) // Limit filename length
        .toLowerCase();
}