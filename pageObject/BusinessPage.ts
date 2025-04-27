import { Locator, Page, FrameLocator } from "playwright";
import { expect } from "playwright/test";
import { createLogger } from "../utils/logger/logger";
import helper from "../utils/helper";

// Create a logger specifically for this page object
const logger = createLogger('Business-spec', false);

class BusinessPage {

    public page: Page;
    public iframeLocator: FrameLocator;
    public businessLocator: Locator;
    public addBusinessLocator: Locator;
    public businessNameFieldLocator: Locator;
    public businessCodeFieldLocator: Locator;
    public createBusinessButtonLocator: Locator;
    public businessTableLocator: Locator;
    public businessNameColumnLocator: Locator;
    public tableRowsLocator: Locator;
    public tableButtonsLocator: Locator;
    public saveChangesLocator: Locator;
    public activeRadioLocator: Locator;


    // Constructor to initialize the page and element locators on the page
    constructor(page: Page) {
        this.page = page;
        this.iframeLocator = this.page.frameLocator("#portletIframe");
        this.businessLocator = this.iframeLocator.getByText('Business').first();
        this.addBusinessLocator = this.iframeLocator.getByText('Add Business')
        this.businessNameFieldLocator = this.iframeLocator.locator('#name');
        this.businessCodeFieldLocator = this.iframeLocator.locator('#code');
        this.createBusinessButtonLocator = this.iframeLocator.getByText('Create Business');
        this.businessTableLocator = this.iframeLocator.locator('div.mt-5');
        this.businessNameColumnLocator = this.iframeLocator.locator('div.flex.cursor-pointer.hover\\:bg-hoverColor > span:first-child')
        this.tableRowsLocator = this.iframeLocator.locator('div.flex.cursor-pointer.hover\\:bg-hoverColor');
        this.tableButtonsLocator = this.iframeLocator.locator('button.w-fit.shrink-0.text-black');
        this.activeRadioLocator = this.iframeLocator.locator("#active")
        this.saveChangesLocator = this.iframeLocator.getByText("Save Changes");

    }
    

    // Method to click the "Business" button to navigate to the Business page.
    async clickOnBusinessLink() {
        logger.info('Clicking on Business link');
        await this.businessLocator.click();
    }

    // Method to click on the Add Business Button to get started on creating a new business
    async clickAddBusinessButton() {
        logger.info('Clicking Add Business button');
        await this.addBusinessLocator.click();
    };

    /**
     * Method to enter business name
     * @param name - The business name to be created
     */
    async enterBusinessName(name: string) {
        logger.info(`Entering business name: ${name}`);
        await this.businessNameFieldLocator.fill(name);
    };

    /**
     * Method to enter business code
     * @param code - The business code to be created
     */
    async enterBusinessCode(code: string) {
        logger.info(`Entering business code: ${code}`);
        await this.businessCodeFieldLocator.fill(code);
    };

    // Method to click on the Create Business Button
    async clickCreateBusinessButton() {
        logger.info('Clicking Create Business button');
        await this.createBusinessButtonLocator.click();
    }

    /**
     * Method to waits for the business table to fully load and become visible
     * @param timeout -  (default: 90000)
     */
    async waitForBusinessTable() {
        logger.info('Waiting for business table to load');
        await this.page.waitForTimeout(9000);
        await this.tableRowsLocator.first().waitFor({ state: 'visible', timeout: 90000 });

    }

    // Method to get the table count
    async getBusinessTableRowCount(): Promise<number> {
        const count = await this.tableRowsLocator.count();
        logger.info(`Business table contains ${count} rows`);
        return count;
    }


    /**
     * Method to Verifies if a newly added business appears in the business table
     * @param bizName - The name of the business to look for
     */
    async assertainBusinessIsAddedSuccessfully(bizName: string) {
        logger.info(`Verifying business "${bizName}" was added successfully`);

        // Wait for the table to be fully loaded
        await this.waitForBusinessTable();

        // Get the count of rows
        const rowCount = await this.tableRowsLocator.count();
        logger.info(`Found ${rowCount} rows in the business table`);

        // Loop through the rows to match the business name
        let found = false;
        for (let i = 0; i < rowCount; i++) {
            const rowText = await this.tableRowsLocator.nth(i).textContent() || '';
            logger.info(rowText);

            // Try different matching strategies
            if (
                rowText.includes(bizName) ||                              // Exact match
                rowText.toLowerCase().includes(bizName.toLowerCase()) ||  // Case-insensitive match
                rowText.trim().includes(bizName.trim())                   // Trimmed match
            ) {
                found = true;
                logger.info(`Found matching business in row ${i}: "${rowText}"`);
                break;
            }
        }

        // Assert the business name was found 
        expect(found).toBeTruthy();
    }

    /**
     * Method to click the business edit button 
     * @param searchText - The name of the business to edit
     */
    async clickEditButton(searchText: string): Promise<boolean> {
        logger.info(`Looking for row containing text: "${searchText}"`);
        await this.waitForBusinessTable();

        const rowCount = await this.getBusinessTableRowCount();

        for (let i = 0; i < rowCount; i++) {
            const row = this.tableRowsLocator.nth(i);
            const rowText = await row.textContent();

            if (rowText && rowText.includes(searchText)) {
                logger.info(`Found matching row with text: "${searchText}"`);

                // Find the button within this specific row
                const button = row.locator('button:has([data-icon="ellipsis-vertical"])');
                await button.waitFor({ state: 'visible', timeout: 9000 })
                await button.click();

                logger.info(`Clicked button in row containing: "${searchText}"`);
                return true;
            }
        }

        logger.warn(`No row found containing text: "${searchText}"`);
        return false;
    }

    /**
     * Method to edit the business name 
     * @param name - The edited business name
     */
    async editBusinessName(name: string) {
        await helper.isFieldPopulated(this.businessNameFieldLocator);
        await this.businessNameFieldLocator.clear();
        logger.info("Clear the existing business name")
        await this.businessNameFieldLocator.fill(name);
        logger.info(`Change the existing business name to ${name}`)
    }

    /**
     * Method to edit the business code 
     * @param code - The edited business code
     */
    async editBusinessCode(code: string) {
        await helper.isFieldPopulated(this.businessCodeFieldLocator);
        await this.businessCodeFieldLocator.clear();
        logger.info("Clear the existing business code");
        await this.businessCodeFieldLocator.fill(code);
        logger.info(`Change the existing code to ${code}`)
    }

    // Method to select the active radio button
    async selectActiveButton() {
        logger.info("Selecting the Active radio button");
        
        // Click the active radio button directly
        await this.activeRadioLocator.click();
        logger.info("Clicked the Active radio button");
        
        // Verify the active button is now checked
        expect(await this.activeRadioLocator.isChecked());
        logger.info("Confirmed the Active radio button is checked");
        
    }

    // Method to click save changes button
    async clicksaveChangesButton() {
        await this.saveChangesLocator.click();
        logger.info("click save changes button")
        await this.page.waitForLoadState('networkidle'); // Wait for the page to finish network requests

    }

     /**
     * Method to Verifies if a newly edited business appears in the business table
     * @param newBizName - The edited business name
     */
    async assertainBusinessIsEditedSuccessfully(newBizName: string) {
        logger.info(`Verifying business "${newBizName}" was edited successfully`);

        // Wait for the table to be fully loaded
        await this.waitForBusinessTable();

        // Get the count of rows
        const rowCount = await this.tableRowsLocator.count();
        logger.info(`Found ${rowCount} rows in the business table`);

        // Loop through the rows to match the updated business name
        let found = false;
        for (let i = 0; i < rowCount; i++) {
            const rowText = await this.tableRowsLocator.nth(i).textContent() || '';

            // Try different matching strategies
            if (
                rowText.includes(newBizName) ||                              // Exact match
                rowText.toLowerCase().includes(newBizName.toLowerCase()) ||  // Case-insensitive match
                rowText.trim().includes(newBizName.trim())                   // Trimmed match
            ) {
                found = true;
                logger.info(`Found matching business in row ${i}: "${rowText}"`);
                break;
            }
        }

        // Assertion
        expect(found).toBeTruthy();
    }


}

export default BusinessPage