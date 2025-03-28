import { Locator, Page } from "playwright";
import { expect } from "playwright/test";
import { createLogger } from "../utils/logger/logger";

// Create a logger specifically for this page object
const logger = createLogger('login-spec', false);

class LoginPage {
    public page: Page;
    public emailField: Locator;
    public pwdField: Locator;
    public signInButton: Locator;
    public errorMessage: Locator;
    public passwordErrorMessage: Locator;
    public emailErrorMessage: Locator;
    public notifcationButton: Locator;
    public acceptNotifcationButton: Locator;

    // Constructor to initialize the page and element locators on the page
    constructor(page: Page) {
        this.page = page;
        this.emailField = this.page.locator("#username");
        this.pwdField = this.page.locator('#password');
        this.signInButton = this.page.locator("button[type='submit']");
        this.errorMessage = this.page.locator(".MuiAlert-message.css-1pxa9xg-MuiAlert-message");
        this.passwordErrorMessage = this.page.locator("#password-helper-text");
        this.emailErrorMessage = this.page.locator("#email-helper-text");
        this.notifcationButton = this.page.locator('button:has-text("Yes, allow notifications")');
        this.acceptNotifcationButton = this.page.locator('button:has-text("Okay, got it!")');
    }

    /**
     * Method to navigates to the login page using the base URL from environment variables
     * @throws Error if BASEURL environment variable is not defined
     */
    async goTo() {
        logger.info("Navigating to the login page ")
        const loginUrl = process.env.BASEURL; // Get the base URL from environment variables

        if (!loginUrl) {
            logger.error("BASEURL is not defined in environment variables.")
            throw new Error("BASEURL is not defined in environment variables.");
        }
        await this.page.goto(loginUrl);
        await this.page.waitForLoadState('networkidle');
        logger.info(`Login page loaded successfully: ${loginUrl}`);
    }

    /**
     * Method to perform login using the provided credentials
     * @param email - The email/username to use for login
     * @param pwd - The password to use for login
     */
    async login(email: string, pwd: string) {
        await this.emailField.fill(email);    // Fill email field
        await this.pwdField.fill(pwd);  // Fill password field
        await this.signInButton.click(); // Click on sign-in button
        await this.page.waitForLoadState('networkidle'); // Wait for the page to finish network requests
    }

    /**
     * Verifies successful login by checking page title and URL
     * @param expectedTitle - The expected page title after login
     * @param expectedUrl - The expected URL after login
     */
    async assertLoggedInSuccessfully(expectedTitle: string, expectedUrl: string) {
        await expect(this.page).toHaveTitle(expectedTitle); // Check if the page title matches the expected title
        await expect(this.page).toHaveURL(expectedUrl); // Check if the URL matches the expected URL
    }

    /**
     * Combined method to perform login flow from start to finish
     * @param email - The email/username to use for login
     * @param password - The password to use for login
     * @param expectedTitle - The expected page title after login
     * @param expectedUrl - The expected URL after login
     */
    async loginAsUser(email: string, password: string, expectedTitle: string, expectedUrl: string) {
        await this.goTo();
        await this.login(email, password);
        await this.assertLoggedInSuccessfully(expectedTitle, expectedUrl);
    }


}


export default LoginPage