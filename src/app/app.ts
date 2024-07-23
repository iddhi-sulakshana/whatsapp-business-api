import { Browser, Page } from "puppeteer";
import logger from "../api/config/logger";
import { initBrowser, initPage, isAuthorized } from "./browser";

var browser: Browser;
var mainPage: Page | null;

export default {
    init: async function (): Promise<void> {
        logger.info("App is being initialized...");
        await initBrowser();
        logger.info("Browser initialized!!!");

        await initPage();

        if (mainPage === null)
            return logger.error("Error Loading WhatsaApp page");

        logger.info("WhatsaApp Page Loaded ");

        await isAuthorized();
    },
};
