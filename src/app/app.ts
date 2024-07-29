import { Page } from "puppeteer";
import logger from "../api/config/logger";
import { initBrowser, initPage, isAuthorized, loadChats } from "./browser";
import { openChat } from "./interface";

export default {
    init: async function (): Promise<void> {
        logger.info("App is being initialized...");
        await initBrowser();
        logger.info("Browser initialized!!!");

        var mainPage = await initPage();

        if (mainPage === null) {
            logger.error("Error Loading WhatsaApp page");
            return;
        }

        logger.info("WhatsaApp Page Loaded ");

        await isAuthorized();

        await loadChats();

        await openChat("+94716666681");
    },
};
