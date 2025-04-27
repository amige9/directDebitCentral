import { test } from '@playwright/test';
import POManager from '../pageObject/POManager';
import ENV from '../utils/env';
import { faker } from '@faker-js/faker';
import { createLogger, clearLogFile } from '../utils/logger/logger';
import * as fs from 'fs';
import ProductPage from '../pageObject/ProductPage';

// Import test data
const dataset = JSON.parse(JSON.stringify(require('../testData/loginData.json')));

// Clear only this spec's log file
clearLogFile('product-spec');

// Create a logger specifically for this spec file
const logger = createLogger('product-spec', false);

// Global declaration
let poManager;
let loginPage;
let productPage: ProductPage
// let updatedProdName: string

test.beforeEach(async ({ page }) => {
    // Initialize Page Object Manager
    poManager = new POManager(page);
    loginPage = poManager.getLoginPage();
    productPage = poManager.getProductPage();


    // Test step 1: Login to application
    logger.info("Step 1: Logging into the application")
    await loginPage.loginAsUser(ENV.EMAIL, ENV.PASSWORD, dataset[0].pageTitle,
        dataset[0].pageURL);
})

/**
 * Test for creating and editing a product
 * This test validates the complete product management workflow
 */
test.describe('Product Functionality', () => {

    test('Create Product Test', async ({ page }) => {

        // Test step 2: Navigate to the Product Module
        logger.info('Step 2: Navigate to the Product Module')
        await productPage.clickonProductLink();

        // Test step3: Create a Product
        logger.info('Step 3: Create a Product');
        await productPage.clickSetupProductButton();

        // select business name
        // Read the updated business name from the business data
        const businessData = JSON.parse(fs.readFileSync('./testData/businessData.json', 'utf8'));
        const updatedBizName= businessData.updatedBizName;
        await productPage.selectBusiness(updatedBizName);

        // Generate random business name and code
        const prodName: string = faker.company.name();
        const prodCode: string = faker.string.alphanumeric(3).toUpperCase();
        

        // Save both values to a JSON file for reuse
        fs.writeFileSync('./testData/productData.json', JSON.stringify({
            prodName,
            prodCode
        }));

        // Enter Product Name
        logger.info(`Generated Product Name: ${prodName}`);
        await productPage.enterProductName(prodName);

        // Enter Product Code
        logger.info(`Generated Product Code: ${prodCode}`);
        await productPage.enterProductCode(prodCode);

        // Enter Client ID
        const clientID: string = faker.string.alphanumeric(10);
        logger.info(`Generated Client ID: ${clientID}`);
        await productPage.enterClientID(clientID);

        // Click Setup Product Button
        await productPage.clickSetupProduct();
        logger.info('Click Setup Product Button');

        // Test Step 4: Verify Product was created successfully
        logger.info('Step 4: Verifying business creation');
        await productPage.assertainProductIsAddedSuccessfully(prodName);

    })

    test('Edit Product Test', async ({ page }) => {

       // Test step 2: Navigate to the Product Module
       logger.info('Step 2: Navigate to the Product Module');
       await productPage.clickonProductLink();

        
        // Read the data from the product data
        const prodData = JSON.parse(fs.readFileSync('./testData/productData.json', 'utf8'));
        const prodName = prodData.prodName

        // Test step 3: Edit the created product
        logger.info('Step 3: Editing the product');
        await productPage.clickEditButton(prodName)

        // Generate random product name, product code, and client ID
        const updatedProdName = faker.company.name();
        const updatedProdCode: string = faker.string.alphanumeric(10).toUpperCase();
        const updatedCLientID: string = faker.string.alphanumeric(10);

        // Save both original and updated values
        fs.writeFileSync('./testData/productData.json', JSON.stringify({
            prodName: prodData.prodName,
            prodCode: prodData.prodCode,
            updatedProdName,
            updatedProdCode
         }));


        logger.info(`Generated Updated Product Name  ${updatedProdName}`);
        await productPage.editProductName(updatedProdName);

        logger.info(`Generated Updated Product Code ${updatedProdCode}`);
        await productPage.editProductCode(updatedProdCode);

        logger.info(`Generated Updated Client ID: ${updatedCLientID}`);
        await productPage.editClientID(updatedCLientID);

        logger.info('click save changes button')
        await productPage.clickSaveChangesButton();

        // Test step 4: Verify that the product was edited successfully
        logger.info('Verifying Product Details Update');
        await productPage.asscertainProductIsEditedSuccessfully(updatedProdName);
    })

    test('Filter Product Table using product name', async ({ page }) => {
        // Test step 2: Navigate to the Product Module
        logger.info('Step 2: Navigate to the Product Module');
        await productPage.clickonProductLink();

        // Test step 3: Enter the product name in the product name field
        logger.info('Step 3: Enter the product name in the product name field');

        // Read the updated product name 
        const prodData = JSON.parse(fs.readFileSync('./testData/productData.json', 'utf8'));
        const updatedProdName = prodData.updatedProdName


        logger.info('Filter using the product name')
        await productPage.filterByProductName(updatedProdName);

        // Test step 4: Verify the product name is displayed on the table
        logger.info('Step 4: Verify the product name is displayed on the table');
        await productPage.assertainValueIsVisibleInTable(updatedProdName);

    });

});