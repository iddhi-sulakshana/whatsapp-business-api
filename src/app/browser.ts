import puppeteer, { Browser, Page } from "puppeteer";
import reusables from "./utils";
import variables from "../api/config/vars";
import logger from "../api/config/logger";
import qr_terminal from "qrcode-terminal";
import authenticateEmitter from "../events/AuthenticateEmitter";

declare const window: any;

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
        authenticateEmitter.emit("change_online");
        return true;
    }
    authenticateEmitter.emit("change_online");
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
    if (global.isOnline) await authenticateQR();
    return false;
}

export async function emitQR(): Promise<void> {
    const page: Page = (await browser.pages())[0];
    await page.waitForSelector(reusables.QRCODE_SELECTOR);
    const qrCodeValue: string | null = await page.evaluate(
        (selector) => {
            const dataRef = document.querySelector(selector.QRCODE_SELECTOR);
            const dataAttr = dataRef?.getAttribute("data-ref");
            if (dataAttr) return dataAttr;
            return null;
        },
        { ...reusables }
    );

    if (qrCodeValue === null) return;

    logger.info(
        ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
    );
    qr_terminal.generate(qrCodeValue, { small: true });
    logger.info(
        "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
    );

    authenticateEmitter.emit("new_qr", qrCodeValue);
}

export async function authenticateQR(): Promise<void> {
    logger.info("Initializing QR code listener...");
    const page: Page = (await browser.pages())[0];
    await page.waitForSelector(reusables.QRCODE_SELECTOR);

    page.exposeFunction("emitQR", emitQR);

    await page.evaluate(
        (selectors) => {
            const qr_container: HTMLElement | null = document.querySelector(
                selectors.QRCODE_SELECTOR
            );

            emitQR();

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    // listens to changes in the qr token
                    if (
                        mutation.type === "attributes" &&
                        mutation.attributeName === "data-ref"
                    ) {
                        window.emitQR();
                    } else if (mutation.type === "childList") {
                        const retry_button: HTMLElement | null =
                            document.querySelector(selectors.QR_RETRY_BUTTON);
                        if (retry_button) retry_button.click();
                        window.emitQR();
                    }
                });
            });

            if (qr_container === null) return;

            observer.observe(qr_container.parentElement!, {
                subtree: true,
                childList: true,
                attributes: true,
                attributeFilter: ["data-ref"],
            });
        },
        { ...reusables }
    );

    await getAuthenticated();
}

export async function getAuthenticated(): Promise<boolean> {
    const page: Page = (await browser.pages())[0];

    logger.info("Waiting for get authenticated");

    // await for selector div that has '_aly_' class
    try {
        await page.waitForSelector(reusables.AUTHENTICATED_SELECTOR, {
            timeout: 0,
        });
        logger.info("Authenticated loginning in");
        return true;
    } catch {
        return await getAuthenticated();
    }
}

export async function loadChats(): Promise<boolean> {
    const page: Page = (await browser.pages())[0];

    try {
        await page.waitForSelector(reusables.INTRO_CHAT_SEARCH_SELECTOR, {
            timeout: 0,
        });

        logger.info("Authenticated and loaded the chat");

        return true;
    } catch {
        return await loadChats();
    }
}
