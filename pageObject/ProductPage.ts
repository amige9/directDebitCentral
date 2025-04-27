import { Locator, Page, FrameLocator } from "playwright";
import { createLogger } from "../utils/logger/logger";
import { expect } from "playwright/test";
import helper from "../utils/helper";

// Create a logger specifically for this page object
const logger = createLogger('Product-spec', false);


class ProductPage {

    public page: Page;
    public iframeLocator: FrameLocator;
    public productLocator: Locator;
    public addProductLocator: Locator;
    public selectBusinessdropdownLocator: Locator
    public searchOptionSelector: Locator;
    public productNameLocator: Locator;
    public productCodeLocator: Locator;
    public clientIdLocator: Locator;
    public setupProductLocator: Locator;
    public tableRowsLocator: Locator;
    public saveChangesLocator: Locator;
    public productNameSearchLocator: Locator;

    // Constructor to initialize the page and element locators on the page
    constructor(page: Page){
        this.page = page;
        this.iframeLocator = this.page.frameLocator("#portletIframe");
        this.productLocator = this.iframeLocator.getByText('Products').first();
        this.addProductLocator = this.iframeLocator.getByText('Setup Product');
        this.selectBusinessdropdownLocator = this.iframeLocator.getByText('-Please Select-');
        this.searchOptionSelector = this.iframeLocator.locator("input[placeholder='Search']");
        this.productNameLocator = this.iframeLocator.locator("#name");
        this.productCodeLocator = this.iframeLocator.locator('#code');
        this.clientIdLocator = this.iframeLocator.locator("#clientId");
        this.setupProductLocator = this.iframeLocator.getByText('Setup Product').last();
        this.tableRowsLocator = this.iframeLocator.locator('div.flex.cursor-pointer.hover\\:bg-hoverColor');
        this.saveChangesLocator = this.iframeLocator.getByText('Save Changes');
        this.productNameSearchLocator = this.iframeLocator.locator('#client-name');
    }

    /**
     *  Method to click the product link to navigate to the product page
     */
    async clickonProductLink(){
        logger.info('Clicking on the product link')
        await this.productLocator.click();
    }

    /**
     * Method to click on the setup product button to get started on creating a new product
     */
    async clickSetupProductButton(){
        logger.info('Clicking on the setup product button')
        await this.addProductLocator.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Method to select a business from the business dropdown
     * @param bizName - The name of the business to be selected
     */
    async selectBusiness(bizName:string){
        await this.selectBusinessdropdownLocator.click();
        await this.searchOptionSelector.pressSequentially(bizName, {delay:500});
        logger.info(`searching for the business name: ${bizName}`);
        await this.page.keyboard.press('Enter');
    }

    /**
     * Method to enter a product name
     * @param productName - The name of the product to be created
     */
    async enterProductName(prodName:string){
        await this.productNameLocator.fill(prodName);
    }

    /**
     * Method to enter a product name
     * @param productCode - The code of the product/Client to be created
     */
    async enterProductCode(prodCode:string){
        await this.productCodeLocator.fill(prodCode);
    }

    /**
     * Method to enter a product name
     * @param clientId - The ID of the product/CLient
     */
    async enterClientID(ID:string){
        await this.clientIdLocator.fill(ID);
    }

    /**
     * Click Setup productbutton to save the product
     */
    async clickSetupProduct(){
        await this.setupProductLocator.click();
    }

    /**
     *  Method to waits for the business table to fully load and become visible
     * @param timeout -  (default: 90000)
     */
    async waitForProductTable(){
        logger.info('wait for product table to load');
        await this.page.waitForTimeout(9000);
        await this.tableRowsLocator.first().waitFor({state:'visible', timeout:90000});
    }

    // Method to get the table count
    async getProductTableRowCount(): Promise<number> {
        const count = await this.tableRowsLocator.count();
        logger.info(`Product table contains ${count} rows`);
        return count;
    }

    /**
     * Method to Verifies if a newly added product appears in the product table
     * @param productName - The name of the business to look for
     */
    async assertainProductIsAddedSuccessfully(productName:string){
        logger.info(`Verifying ${productName} is added successful`)

        // Wait for the Table to load
        await this.waitForProductTable();

        // Get the rows count
        const rowCount = await this.tableRowsLocator.count();
        logger.info(`Found ${rowCount} rows in the product table`)

        // Loop through the rows to match the product name
        let found = false;
        for(let i=0; i < rowCount; i++){
            const rowText = await this.tableRowsLocator.nth(i).textContent() || '';
            logger.info(rowText);

            if (
                rowText.includes(productName) ||                                // Exact match
                rowText.toLowerCase().includes(productName.toLowerCase()) ||    // Case-insensitive match
                rowText.trim().includes(productName.trim())                    // Trimmed match
            ){
                found = true;
                logger.info(`found matching product in ${i}: ${rowText}`);
                break;
            }
        }

        // Assert the product name was found
        expect(found).toBeTruthy();
    }

    /**
     * Method to click the product edit button 
     * @param searchText - The name of the product to edit
     */
    async clickEditButton(searchText:string): Promise<boolean> {
        logger.info(`looking for row containing text : "${searchText}"`)
        await this.waitForProductTable();

        const rowCount = await this.getProductTableRowCount();

        for(let i=0; i< rowCount; i++){
            const row = this.tableRowsLocator.nth(i);
            const rowText = await row.textContent();

            if(rowText && rowText.includes(searchText)){
                logger.info(`found matching row with text: "${searchText}"`)

                // Find the edit button within the specified row
                const editButton = row.getByText('Edit')
                await editButton.waitFor({state:'visible', timeout:9000});
                await editButton.click();

                logger.info(`Clicked edit button in row containing: "${searchText}"`);
                return true;
            }
        }

        logger.warn(`no row found containing text: "${searchText}"`);
        return false;

    }

    /**
     * Method to edit the product name
     * @param newProductName - The edited product name
     */
    async editProductName(name:string){
        await helper.isFieldPopulated(this.productNameLocator);
        await this.productNameLocator.clear();
        logger.info('Clear the exisiting product name');
        await this.productNameLocator.pressSequentially(name);
        logger.info(`change the existing product name to "${name}"`)
    }


    /**
     * Method to edit the product name
     * @param newProductCode - The edited product code
     */
        async editProductCode(code:string){
            await helper.isFieldPopulated(this.productCodeLocator);
            await this.productCodeLocator.clear();
            logger.info('Clear the exisiting product code');
            await this.productCodeLocator.fill(code);
            logger.info(`change the existing product code to "${code}"`)
        }

    /**
     * Method to edit the client ID
     * @param newClientID - The edited client ID
     */
    async editClientID(ID:string){
        await helper.isFieldPopulated(this.clientIdLocator);
        await this.clientIdLocator.clear();
        logger.info('Clear the exisiting product co');
        await this.clientIdLocator.fill(ID);
        logger.info(`change the existing client ID to "${ID}"`)
    }

    // Click Save Changes Button
    async clickSaveChangesButton(){
        await this.saveChangesLocator.click();
        logger.info('Click Save Changes Button')
    }

    /**
     * Method to verify that the newly edited appears in the product table
     * @param newProductName - The edited Product name
     */
    async asscertainProductIsEditedSuccessfully(newProductName:string){
        logger.info(`Verifying ${newProductName} is added successful`)

        // Wait for the Table to load
        await this.waitForProductTable();

        // Get the rows count
        const rowCount = await this.tableRowsLocator.count();
        logger.info(`Found ${rowCount} rows in the product table`)

        // Loop through the rows to match the product name
        let found = false;
        for(let i=0; i < rowCount; i++){
            const rowText = await this.tableRowsLocator.nth(i).textContent() || '';
            logger.info(rowText);

            if (
                rowText.includes(newProductName) ||                                // Exact match
                rowText.toLowerCase().includes(newProductName.toLowerCase()) ||    // Case-insensitive match
                rowText.trim().includes(newProductName.trim())                    // Trimmed match
            ){
                found = true;
                logger.info(`found matching product in ${i}: ${rowText}`);
                break;
            }
        }

        // Assert the product name was found
        expect(found).toBeTruthy();
    }

    /**
     *  Method to enter the prouct name in the product name filter field
     * @param productName - Product Name to filter with
     */
    async filterByProductName(prodName:string){
        logger.info(`Filter by Product Name: ${prodName}`);
        await this.productNameSearchLocator.fill(prodName);
        // await this.productNameSearchLocator.pressSequentially(prodName, {delay:500})
    }

        /**
     * Method to Verifies if a newly added product appears in the product table
     * @param value - value filtering for
     */
        async assertainValueIsVisibleInTable(value:string){
            logger.info(`Verifying ${value} is visible on the table`)
    
            // Wait for the Table to load
            await this.waitForProductTable();
    
            // Get the rows count
            const rowCount = await this.tableRowsLocator.count();
            logger.info(`Found ${rowCount} rows in the product table`)
    
            // Loop through the rows to match the product name
            let found = false;
            for(let i=0; i < rowCount; i++){
                const rowText = await this.tableRowsLocator.nth(i).textContent() || '';
                logger.info(rowText);
    
                if (
                    rowText.includes(value) ||                                // Exact match
                    rowText.toLowerCase().includes(value.toLowerCase()) ||    // Case-insensitive match
                    rowText.trim().includes(value.trim())                    // Trimmed match
                ){
                    found = true;
                    logger.info(`found matching product in ${i}: ${rowText}`);
                    break;
                }
            }
    
            // Assert the product name was found
            expect(found).toBeTruthy();
        }
}   

export default ProductPage