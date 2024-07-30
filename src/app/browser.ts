import puppeteer, { Browser, Page } from "puppeteer";
import reusables, { closeBrowser } from "./utils";
import variables from "../api/config/vars";
import logger from "../api/config/logger";
import qr_terminal from "qrcode-terminal";
import authenticateEmitter from "../events/AuthenticateEmitter";

declare const window: any;

export var browser: Browser;

// initialize the browser window
export async function initBrowser(repeats: number = 0): Promise<boolean> {
    if (repeats >= 3) return false;
    try {
        browser = await puppeteer.launch({
            headless: variables.env === "production",
            userDataDir: "./web_cache",
            args: [
                "--no-sandbox",
                "--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36",
            ],
        });
        return true;
    } catch (error) {
        logger.error("Error occured during browser initialization");
        await closeBrowser();
        return initBrowser(repeats + 1);
    }
}

// initializing Whatsapp Web Page
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

// Reload the page if page isnt loaded
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

// check page load status
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
        emitOnline(true);
        return true;
    }
    emitOnline(false);
    return false;
}

// Check is QR scanned and authorized
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
        emitLogged(true);
        return true;
    }
    logger.info("User needs to authenticate using QR code");
    emitLogged(false);
    if (global.isOnline) await authenticateQR();
    return false;
}

// Get the QR code and emit the event to send QR code to the client
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

    authenticateEmitter.emit("change_qr", qrCodeValue);
}

// QR code listener for change of QR code and reflect it
export async function authenticateQR(): Promise<void> {
    logger.info("Initializing QR code listener...");
    const page: Page = (await browser.pages())[0];
    try {
        await page.waitForSelector(reusables.QRCODE_SELECTOR, {
            timeout: 5000,
        });
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
                                document.querySelector(
                                    selectors.QR_RETRY_BUTTON
                                );
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
    } catch {
        await page.screenshot({
            path: "./logs/screenshots/qr_error.png",
            type: "png",
        });
        logger.info("QR code not found");
        await authenticateQR();
    }

    await getAuthenticated();
}

// checking if authetication is happening
export async function getAuthenticated(): Promise<boolean> {
    const page: Page = (await browser.pages())[0];

    logger.info("Waiting for get authenticated");

    // await for selector div that has '_aly_' class
    try {
        await page.waitForSelector(reusables.AUTHENTICATED_SELECTOR, {
            timeout: 0,
        });
        logger.info("Authenticated loginning in");
        const logged = await isAuthorized();
        if (!logged) throw Error("Not logged in");
        return true;
    } catch {
        return await getAuthenticated();
    }
}

// Check if chats are loaded successfully
export async function loadChats(): Promise<boolean> {
    const page: Page = (await browser.pages())[0];

    try {
        await page.waitForSelector(reusables.INTRO_CHAT_SEARCH_SELECTOR, {
            timeout: 0,
        });

        logger.info("Authenticated and loaded the chat");

        await retryListener();

        return true;
    } catch {
        return await loadChats();
    }
}

// click on the retry connection button
export async function retryConnection(): Promise<void> {
    const page: Page = (await browser.pages())[0];
    try {
        const notificationContainer = await page.waitForSelector(
            reusables.NOTIFICATION_CONTAINER_SELECTOR,
            { timeout: 500 }
        );
        // check if notification controller has retry connection span
        if (!notificationContainer) throw Error("Is online");
        const reconnectSpan = await notificationContainer.waitForSelector(
            reusables.ALERT_ICON,
            { timeout: 500 }
        );
        if (reconnectSpan) emitOnline(false);
        else throw Error("Is online");
    } catch {
        emitOnline(true);
    }
}

// check if offline message is displayed on the page
export async function retryListener(): Promise<void> {
    logger.info("Initializing Retry Connection listener...");

    const page: Page = (await browser.pages())[0];

    page.exposeFunction("retryConnection", retryConnection);

    await page.evaluate(
        (selectors) => {
            const notificationContainer = document.querySelector(
                selectors.NOTIFICATION_CONTAINER_SELECTOR
            );

            const notificationController = (mutation: MutationRecord): void => {
                window.retryConnection();
                let reconnectSpan: HTMLElement | null;
                reconnectSpan = (mutation.target as HTMLElement).querySelector(
                    selectors.RECONNECT_SPAN_SELECTOR
                );
                if (!reconnectSpan) {
                    mutation.addedNodes.forEach((addedNode) => {
                        reconnectSpan = (
                            addedNode as HTMLElement
                        ).querySelector(selectors.RECONNECT_SPAN_SELECTOR);
                    });
                }
                const reconnectBtn = reconnectSpan?.querySelector("button");
                if (!reconnectBtn) return;
                reconnectBtn.click();
            };

            const notificationObserver = new MutationObserver((mutations) => {
                mutations.forEach(notificationController);
            });

            notificationObserver.observe(notificationContainer!, {
                subtree: true,
                childList: true,
            });
        },
        { ...reusables }
    );
}

// Emitters
function emitOnline(onlineStatus: boolean): void {
    logger.info("Emitting online status: " + onlineStatus);
    global.isOnline = onlineStatus;
    authenticateEmitter.emit("change_online");
}

function emitLogged(authenticatedStatus: boolean): void {
    logger.info("Emitting Logged status: " + authenticatedStatus);
    global.isLogged = authenticatedStatus;
    authenticateEmitter.emit("change_logged");
}
