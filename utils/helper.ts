import { createLogger } from "../utils/logger/logger";
import { expect, Locator } from "playwright/test";

// Create a logger specifically for this page object
const logger = createLogger('Helpers');


class helper {

   /**
    * Checks if a field has a value
    */
    static async isFieldPopulated(locator: Locator): Promise<void> {
        logger.info('Asserting field is not empty');
        await expect(locator).toHaveValue(/./);
        logger.info('Confirmed field is not empty');
    }



}

export default helper