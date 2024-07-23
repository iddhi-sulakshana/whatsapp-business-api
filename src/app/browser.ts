import puppeteer, { Browser, Page } from "puppeteer";
import reusables from "./utils";
import variables from "../api/config/vars";
import logger from "../api/config/logger";

export var browser: Browser;

export async function initBrowser(): Promise<void> {
    browser = await puppeteer.launch({
        headless: variables.env === "production",
        userDataDir: "./web_cache",
    });
}

export async function initPage(): Promise<Page | null> {
    logger.info("Initializing Main Page...");
    const mainPage: Page = (await browser.pages())[0];

    try {
        await mainPage.goto(reusables.WHATSAPP_URL, { timeout: 0 });
        if (await isPageLoaded(mainPage)) return mainPage;
        return await reloadPage();
    } catch (error) {
        logger.error(
            "Error occured during initilaztion of main page trying to reload:"
        );
        return await reloadPage();
    }
}

export async function reloadPage(retries: number = 0): Promise<Page | null> {
    if (retries >= 3) return null;
    logger.info("Refreshing for " + (retries + 1) + " time...");
    await new Promise((r) => setTimeout(r, 1000));
    try {
        const page: Page = (await browser.pages())[0];
        await page.reload({ timeout: 0 });
        if (await isPageLoaded(page)) return page;
        return reloadPage(retries + 1);
    } catch (error) {
        logger.error(error);
        return null;
    }
}

export async function isPageLoaded(page: Page): Promise<Boolean> {
    const isLoaded = await Promise.race([
        new Promise((resolve) => {
            page.waitForSelector(reusables.INTRO_CHAT_SEARCH_SELECTOR)
                .then(() => resolve(true))
                .catch(() => resolve(false));
        }),
        new Promise((resolve) => {
            page.waitForSelector(reusables.INTRO_QR_LANDING_SELECTOR)
                .then(() => resolve(true))
                .catch(() => resolve(false));
        }),
    ]);

    if (isLoaded) {
        global.isOnline = true;
        return true;
    }
    global.isOnline = false;
    return false;
}

export async function isAuthorized(): Promise<Boolean> {
    const page: Page = (await browser.pages())[0];
    const isAuthorized = await Promise.race([
        new Promise((resolve) => {
            page.waitForSelector(reusables.INTRO_CHAT_SEARCH_SELECTOR)
                .then(() => resolve(true))
                .catch(() => resolve(false));
        }),
        new Promise((resolve) => {
            page.waitForSelector(reusables.INTRO_QR_LANDING_SELECTOR)
                .then(() => resolve(false))
                .catch(() => resolve(true));
        }),
    ]);

    if (isAuthorized) {
        logger.info("User is logged in");
        global.isLogged = true;
        return true;
    }
    logger.info("User needs to authenticate using QR code");
    global.isLogged = false;
    return false;
}
