import logger from "../api/config/logger";
import { initBrowser, initPage, isAuthorized, loadChats } from "./browser";
import { createOrder } from "./interface";

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

        await createOrder("+94781940178", [
            { name: "Item 1", price: "100", quantity: "1" },
            { name: "Item 2", price: "200", quantity: "2" },
        ]);
    },
};
