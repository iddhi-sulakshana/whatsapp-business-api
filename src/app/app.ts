import logger from "../api/config/logger";
import { initBrowser, initPage, isAuthorized, loadChats } from "./browser";

export default {
    init: async function (): Promise<void> {
        logger.info("App is being initialized...");
        const init = await initBrowser();
        if (!init) {
            logger.error("Error Initializing Browser: All retries failed");
            return;
        }
        logger.info("Browser initialized!!!");

        var mainPage = await initPage();

        if (mainPage === null) {
            logger.error("Error Loading WhatsaApp page");
            return;
        }

        logger.info("WhatsaApp Page Loaded ");

        await isAuthorized();

        await loadChats();
    },
};
