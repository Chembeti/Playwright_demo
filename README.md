# Introduction 
This repo serves as a guide to develop test automation based on Playwright framework with Cucumber BDD framework.

# Getting Started
Prerequisites: 
- Playwright needs Node.js so install it first: https://nodejs.org/en/download
- This repo is developed using VSCode IDE so install VSCode.
------------------------------------------------------------------------------------------
1. Create an empty folder and open in VSCode
2. Install Playwright (Ctrl + Shift + P) 
	--> installs necessary packages for Playwright
	--> creates a folder structure for the project along with 2 sample test files 
3. Delete Playwright sample test files (this repo is based on Gherkin based tests so Playwright tests are not necessary)
4. Install cucumber (at command prompt) --> npm install @cucumber/cucumber --save-dev
5. Install VSCode extension "Cucumber (Gherkin) Full Support"
	--> as of this repo development, official Cucumber extension has some problems with VSCode so go with the above extension
6. Install below additional packages
	a) multiple-cucumber-html-reporter --save-dev (Cucumber has default reporting module but this package is better than that)
	b) fs-extra (Node has default fs package for file system but this package has more functionalities)
	c) dotenv -D (to get support for managing various environments such as dev, production, staging, etc.,)
	d) cross-env -D (to get multi platform support; if it is going to be only OS such as Windows then this package can be optional)
	e) winston -D (to get logging support)
	f) ts-node --save-dev (for TypeScript execution engine related)
7. Create below directory structure along with files
	a) add 'tsconfig.json' at the project root level
	a) a folder 'config' directly under the root folder --> contains cucumber configurations for this project
		i) add a file with the name 'cucumber.js' (name should be EXACT)
			--> this can contain as many profiles as needed and various settings for each profile as required
	b) a folder 'src' directly under the root folder --> contains all the automation development related items
		i) add 'helpers' folder under 'src' 
			1) add 'browser' folder under 'helpers'
				--> add 'browserManager.ts' file to manage browser creation
			2) add 'env' folder under 'helpers'
				--> add as many enviornment files as needed (file name should start with .env.)
			3) add 'report' folder under 'helpers'
				--> add 'init.ts' file (contains code for any report related initialization code)
				--> add 'report.ts' file (contains code for report related code)
			4) add 'types' folder under 'helpers'
				--> add 'env.d.ts' (name should be EXACT; contains Node realted type definitions specific to the project; these types can be used for command line execution)
			5) add 'util' folder under 'helpers'
				--> add 'test-data' folder --> create JSON files with test data
				--> add 'logger.ts' file --> contains winston package related configuration
			6) add 'wrapper' folder under 'helpers' --> create Playwright related wrapper classes for commonly used methods
				--> 'assert.ts'
				--> 'playwrightWrappers.ts'
		ii) add 'hooks' folder under 'src'
			--> add 'fixture.ts' : contains test fixture realted code
			--> add 'hooks.ts' : contains test hooks realted code
		iii) add 'pages' folder --> add application webpage related implementation
		vi) add 'tests' folder --> test implementation
			1) add 'features' folder that contains all feature definitions
			2) add 'steps' folder that contains all step implementations
8. Update package.json file with "scripts" so that tests can be executed as "npm test", etc.,

# Build and Test
This project uses UNIX style commands so it is better to execute all below commands using Gitbash (if you are on Windows) rather than using regular Windows command prompt. Powershell also should work.
    i)   Open Gitbash command prompt in VSCode 
    ii)  Execute "npm test" command. This will run all the tests
    iii) In this project couple of environment variables are defined (check the file: src/helpers/types/env.d.ts). If you want to execute tests with any of these variables, execute below command
            'npm test --{env_variable_name}="{env_variable_value}"'
            Example: below command executes tests with '@smokeTests' tag in QA2 environment 
            'npm test --ENV="QA2" --TAGS="@smokeTests"'
    iV)  When these tests are executed, following directory structure will be created:
        at project root level:
        test-results/
            logs/
            reports/
                assets/
                features/
                index.html ---------> OPEN THIS FILE TO SEE COMPLETE TEST EXECUTION REPORT
            screenshots/
            videos/
        Note: Above index.html report is because of multiple-cucumber-html-reporter package. 
            By default, cucumber also creates a report "cucumber-report.html" inside test-results/.
