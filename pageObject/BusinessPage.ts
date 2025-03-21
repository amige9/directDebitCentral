import { Locator, Page, FrameLocator} from "playwright";
import { expect } from "playwright/test";
import { createLogger } from "../utils/logger/logger";

// Create a logger specifically for this page object
const logger = createLogger('Business');

class BusinessPage{

    public page: Page;
    public iframe: FrameLocator;
    public businessLocator: Locator;
    public addBusinessLocator: Locator;
    public businessNameFieldLocator: Locator;
    public businessCodeFieldLocator: Locator;
    public createBusinessButtonLocator: Locator;
    public businessTableLocator: Locator;

    // Constructor to initialize the page and element locators on the page
    constructor(page:Page){
        this.page = page;
        this.iframe = this.page.frameLocator("#portletIframe");
        this.businessLocator = this.iframe.getByText('Business').first();
        this.addBusinessLocator = this.iframe.getByText('Add Business')
        this.businessNameFieldLocator = this.iframe.locator('#name');
        this.businessCodeFieldLocator = this.iframe.locator('#code');
        this.createBusinessButtonLocator = this.iframe.getByText('Create Business');
        this.businessTableLocator = this.iframe.locator('div.mt-5')
    }

    // Method to click the "Business" button to navigate to the Business page.
    async clickOnBusinessLink() {
        await this.businessLocator.click();
    }

    // Method to click on the Add Business Button to get started on creating a new business
    async clickAddBusinessButton(){
        await this.addBusinessLocator.click();
    };

    // Method to enter business name
    async enterBusinessName(name:string){
        await this.businessNameFieldLocator.fill(name);
    };

    // Method to enter business code
    async enterBusinessCode(code:string){
        await this.businessCodeFieldLocator.fill(code);
    };

    // Method to click on the Create Business Button
    async clickCreateBusinessButton(){
        await this.createBusinessButtonLocator.click();
    }

    // Assertain the Business is addedd successfully
    async assertainBusinessIsAddedSuccessfully(bizName:string){
        const expectedText = bizName;
        await expect(this.businessTableLocator).toContainText(expectedText);
    }
}

export default BusinessPage