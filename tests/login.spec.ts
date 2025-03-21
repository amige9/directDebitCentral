import { test } from '@playwright/test';
import POManager from '../pageObject/POManager';
import ENV from '../utils/env';
import { createLogger } from '../utils/logger/logger'; import fs from 'fs';
import path from 'path';
const dataset = JSON.parse(JSON.stringify(require('../testData/loginData.json')));

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Create a logger specifically for this spec file
const logger = createLogger('login');

// Test script for a valid login test
test('@regression Valid Login Test', async ({ page }) => {
    // Validate environment variables before using them
    if (!ENV.EMAIL || !ENV.PASSWORD) {
        throw new Error('EMAIL or PASSWORD environment variables are not set');
    }
    logger.info('Starting login test');

    // Initialize Page Object Manager
    const poManager = new POManager(page);

    // Initialize individual Page Objects
    const loginPage = poManager.getLoginPage();

    /*
       Using the loginAsUser function
       Naviagate to the URL, 
       login using valid credentials from environment variables 
       assert the user is logged in by verifying the page title and url
   */
    await loginPage.loginAsUser(ENV.EMAIL, ENV.PASSWORD, dataset[0].pageTitle,
        dataset[0].pageURL);

})