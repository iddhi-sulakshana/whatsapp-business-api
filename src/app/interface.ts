import { Page } from "puppeteer";
import { browser } from "./browser";
import reusables from "./utils";
import logger from "../api/config/logger";

export async function openChat(phoneNumber: string): Promise<boolean> {
    const page: Page = (await browser.pages())[0];
    // Press Ctrl + Alt + /
    // await page.keyboard.down("Control");
    // await page.keyboard.down("Alt");
    // await page.keyboard.press("/");
    // await page.keyboard.up("Alt");
    // await page.keyboard.up("Control");
    // // Type the phone number
    // await page.keyboard.type("(You)");
    // or

    try {
        // Click on escape button if chat was open
        await page.keyboard.down("Escape");
        // Select the search bar and type type the current user name
        // and press enter
        await page.type(reusables.SEARCH_BAR, "(You)");
        await page.keyboard.press("Enter");
        // Wait for the chat to open
        await page.waitForSelector(reusables.CHAT_WINDOW);
        // type the phone number link on the message bar and click enter
        await page.type(
            reusables.MESSAGE_BOX,
            reusables.CHAT_URL + phoneNumber
        );
        await page.keyboard.press("Enter");
        await page.evaluate(
            (number: string, CHAT_URL: string) => {
                const link: HTMLElement | null = document.querySelector(
                    "a[title='" + CHAT_URL + number + "']"
                );
                if (link === null) return;
                link.click();
            },
            phoneNumber,
            reusables.CHAT_URL
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const notFound = await page.evaluate(
            (PHONE_NOT_FOUND, PHONE_NOT_FOUND_BUTTON): boolean => {
                const notFound = document.querySelector(PHONE_NOT_FOUND);
                console.log(notFound);

                if (notFound !== null) {
                    const button: HTMLElement | null = document.querySelector(
                        PHONE_NOT_FOUND_BUTTON
                    );
                    button!.click();
                    return true;
                }
                return false;
            },
            reusables.PHONE_NOT_FOUND,
            reusables.PHONE_NOT_FOUND_BUTTON
        );

        if (notFound) {
            logger.info("Phone number not found!");
            return false;
        }

        await page.waitForSelector(reusables.CHAT_WINDOW);

        return true;
    } catch (error) {
        logger.error(error);
        return false;
    }
}
