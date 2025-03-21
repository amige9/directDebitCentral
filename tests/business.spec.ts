import { test } from '@playwright/test';
import POManager from '../pageObject/POManager';
import ENV from '../utils/env';
import faker from '@faker-js/faker';
import { createLogger } from '../utils/logger/logger'; import fs from 'fs';
import path from 'path';
const dataset = JSON.parse(JSON.stringify(require('../testData/loginData.json')));



// Create a logger specifically for this spec file
const logger = createLogger('Business');

test("Create a Valid Business Test", async ({ page }) => {

    // Initialize Page Object Manager
    const poManager = new POManager(page);

    // Initialize individual Page Objects
    const loginPage = poManager.getLoginPage();
    const businessPage = poManager.getBusinessPage();

    // Log in to the application using credentials from ENV variables
    // The function accepts email, password, expected page title, expected URL,
    await loginPage.loginAsUser(ENV.EMAIL, ENV.PASSWORD, dataset[0].pageTitle,
        dataset[0].pageURL);

    // Navigate to the Business Page by clicking the "Business" link
    await businessPage.clickOnBusinessLink();

    // Click the "Add Business" to start creating a business 
    // await businessPage.clickAddBusinessButton();

    // Enter Business Name
    // var businessName = faker.company.name();
    // console.log(businessName)
    // await businessPage.enterBusinessName(businessName)

    // Enter Business Code
    // var businessCode = faker.string.alphanumeric(3);
    // await businessPage.enterBusinessCode(businessCode);

    // Click on the Create Business Button to create a business
    // await businessPage.clickCreateBusinessButton();

    // Assertain the business was addedd successfully
    // await businessPage.assertainBusinessIsAddedSuccessfully(businessName);

})