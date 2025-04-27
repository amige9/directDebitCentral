import { test } from '@playwright/test';
import POManager from '../pageObject/POManager';
import ENV from '../utils/env';
import { faker } from '@faker-js/faker';
import { createLogger, clearLogFile } from '../utils/logger/logger';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import BusinessPage from '../pageObject/BusinessPage';




// Import test data
const dataset = JSON.parse(JSON.stringify(require('../testData/loginData.json')));

// Clear only this spec's log file
clearLogFile('business-spec');

// Create a logger specifically for this spec file
const logger = createLogger('business-spec', false);

// Global Declaration
let poManager;
let loginPage;
let businessPage: BusinessPage;

test.beforeEach(async ({ page }) => {
    // Initialize Page Object Manager
    poManager = new POManager(page);
    loginPage = poManager.getLoginPage();
    businessPage = poManager.getBusinessPage();


    // Test step 1: Login to application
    logger.info("Step 1: Logging into the application")
    await loginPage.loginAsUser(ENV.EMAIL, ENV.PASSWORD, dataset[0].pageTitle,
        dataset[0].pageURL);
})

/**
 * Test for creating and editing a business
 * This test validates the complete business management workflow
 */
test.describe('Business Functionality', () => {

    test("Create Business Test", async ({ page }) => {

        // Test step 2: Navigate to Business section
        logger.info("Step 2: Navigating to Business section");
        await businessPage.clickOnBusinessLink();

        // Test step 3: Create a new business
        logger.info("Step 3: Create a new business");
        await businessPage.clickAddBusinessButton();

        // Generate random business name and code
        const businessName: string = faker.company.name();
        const businessCode: string = faker.string.alphanumeric(3).toUpperCase();

        // Save both values to a JSON file for reuse
        await fsPromises.writeFile('./testData/businessData.json', JSON.stringify({
            businessName,
            businessCode,
        }));

        logger.info(`Generated business name: ${businessName}`);
        await businessPage.enterBusinessName(businessName)

        logger.info(`Generated business name: ${businessCode}`);
        await businessPage.enterBusinessCode(businessCode);

        logger.info("Click Create Business Button")
        await businessPage.clickCreateBusinessButton();

        // Test step 4: verify business was created successfully
        logger.info("Step 4: Verifying business creation");
        await businessPage.assertainBusinessIsAddedSuccessfully(businessName);

    })

    test('Edit Business Test', async ({ page }) => {

        // Test step 2: Navigate to Business section
        logger.info("Step 2: Navigating to Business section");
        await businessPage.clickOnBusinessLink();

        // Read the data from the buisness data
        const bizData = JSON.parse(fs.readFileSync('./testData/businessData.json', 'utf-8'))
        const businessName = bizData.businessName;

        // Test step 3: Edit the created business
        logger.info("Step 3: Editing the business");
        await businessPage.clickEditButton(businessName);

        // Generate random business name and code
        const updatedBizName: string = faker.company.name();
        const updatedBizCode: string = faker.string.alphanumeric(3).toUpperCase();

        //  Save both original and updated values
        await fsPromises.writeFile('./testData/businessData.json', JSON.stringify({
            businessName: bizData.businessName,
            businessCode: bizData.businessCode,
            updatedBizName,
            updatedBizCode,
        }));

        logger.info(`Generated updated business name: ${updatedBizName}`);
        await businessPage.editBusinessName(updatedBizName);

        logger.info(`Generated updated business code: ${updatedBizCode}`);
        await businessPage.editBusinessCode(updatedBizCode);

        // Select the active button
        logger.info('Select the active option')
        await businessPage.selectActiveButton();

        // Click the save changes button
        logger.info('Click the save changes button')
        await businessPage.clicksaveChangesButton();

        // Test step 4: Verify business was edited successfully
        logger.info("Step 6: Verifying business updates");
        await businessPage.assertainBusinessIsEditedSuccessfully(updatedBizName);
    })

    logger.info("Test completed successfully");


})



