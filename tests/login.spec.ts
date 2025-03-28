import { test } from '@playwright/test';
import POManager from '../pageObject/POManager';
import ENV from '../utils/env';
import { createLogger, clearLogFile } from '../utils/logger/logger';
import fs from 'fs';
import path from 'path';

// import test data
const dataset = JSON.parse(JSON.stringify(require('../testData/loginData.json')));

/**
* Test for loggin into the application
* This test validates the complete login workflow
*/

// test.beforeAll(async () => {
//     // Clear the log file for this test module
//     clearLogFile('login-spec');
// })

// Clear only this spec's log file
clearLogFile('login-spec')

// Create a logger specifically for this spec file
const logger = createLogger('login-spec', false);

// Test script for a valid login test
test.describe('Login Functionality', () => {
    test('@regression Valid Login Test', async ({ page }) => {
        // Validate environment variables before using them
        if (!ENV.EMAIL || !ENV.PASSWORD) {
            throw new Error('EMAIL or PASSWORD environment variables are not set');
        }
        logger.info('Starting login test with valid login credentials and verify login was successful');

        // Initialize Page Object Manager
        const poManager = new POManager(page);
        const loginPage = poManager.getLoginPage();

        /*
           Using the loginAsUser function
           Naviagate to the URL, 
           login using valid credentials from environment variables 
           assert the user is logged in by verifying the page title and url
       */
        await loginPage.loginAsUser(
            ENV.EMAIL,
            ENV.PASSWORD,
            dataset[0].pageTitle,
            dataset[0].pageURL);

        logger.info('Test Completed');

    });

});