import { test } from '@playwright/test';
import POManager from '../pageObject/POManager';
import ENV from '../utils/env';
import { faker } from '@faker-js/faker';
import { createLogger, clearLogFile } from '../utils/logger/logger'; import fs from 'fs';
import path from 'path';


// Import test data
const dataset = JSON.parse(JSON.stringify(require('../testData/loginData.json')));

// test.beforeAll(async () => {
//     // Clear the log file for this test module
//     clearLogFile('business-spec');
// })

// Clear only this spec's log file
clearLogFile('business-spec');

// Create a logger specifically for this spec file
const logger = createLogger('business-spec', false);

/**
 * Test for creating and editing a business
 * This test validates the complete business management workflow
 */

test("@regression Create and Edit Business Test", async ({ page }) => {

    // Initialize Page Object Manager
    const poManager = new POManager(page);
    const loginPage = poManager.getLoginPage();
    const businessPage = poManager.getBusinessPage();

    // Test step 1: Login to application
    logger.info("Step 1: Logging into the application")
    await loginPage.loginAsUser(ENV.EMAIL, ENV.PASSWORD, dataset[0].pageTitle,
        dataset[0].pageURL);

    // Test step 2: Navigate to Business section
    logger.info("Step 2: Navigating to Business section");
    await businessPage.clickOnBusinessLink();
    
    // Test step 3: Create a new business
    logger.info("Step 3: Create a new business");
    await businessPage.clickAddBusinessButton();
    
    // Generate random business name and code
    const businessName: string = faker.company.name();
    logger.info(`Generated business name: ${businessName}`);
    await businessPage.enterBusinessName(businessName)

    const businessCode: string = faker.string.alphanumeric(3).toUpperCase();
    logger.info(`Generated business name: ${businessCode}`);
    await businessPage.enterBusinessCode(businessCode);

    logger.info("Click Create Business Button")
    await businessPage.clickCreateBusinessButton();

    // Test step 4: verify business was created successfully
    logger.info("Step 4: Verifying business creation");
    await businessPage.assertainBusinessIsAddedSuccessfully(businessName);
    

    // Test step 5: Edit the created business
    logger.info("Step 5: Editing the business");
    await businessPage.clickEditButton(businessName);

    // Generate updated business details
    const updatedBizName: string = faker.company.name();
    logger.info(`Generated updated business name: ${updatedBizName}`);
    await businessPage.editBusinessName(updatedBizName);

    const updatedBizCode: string = faker.string.alphanumeric(3).toUpperCase();
    logger.info(`Generated updated business code: ${updatedBizCode}`);
    await businessPage.editBusinessCode(updatedBizCode);

    await businessPage.selectActiveButton();
    await businessPage.clicksaveChangesButton();

    // Test step 6: Verify business was edited successfully
    logger.info("Step 6: Verifying business updates");
    await businessPage.assertainBusinessIsEditedSuccessfully(updatedBizName);

    logger.info("Test completed successfully");

})