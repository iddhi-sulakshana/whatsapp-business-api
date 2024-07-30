import { ElementHandle, Page } from "puppeteer";
import { browser } from "./browser";
import reusables from "./utils";
import logger from "../api/config/logger";
import { OrderItem } from "./types";

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
        await page.type(reusables.SEARCH_BAR, "(You)");
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
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const notFound = await page.evaluate(
            (PHONE_NOT_FOUND, PHONE_NOT_FOUND_BUTTON): boolean => {
                const notFound = document.querySelector(PHONE_NOT_FOUND);

                if (notFound !== null) {
                    const button: HTMLElement | null = document.querySelector(
                        PHONE_NOT_FOUND_BUTTON
                    );

                    if (button === null) return false;

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

export async function openOrder(orderId: string): Promise<boolean> {
    const page: Page = (await browser.pages())[0];

    try {
        const notFound = await page.evaluate(
            (
                orderNo: string,
                ORDER_TITLE: string,
                ORDER_CONTAINER: string
            ): boolean => {
                const ordersList: NodeListOf<HTMLElement> | null =
                    document.querySelectorAll(ORDER_TITLE);

                let orderTitle: HTMLElement | null = null;
                console.log(ordersList);
                ordersList.forEach((order) => {
                    if (order.innerText.includes("ORDER #" + orderNo)) {
                        orderTitle = order;
                    }
                });

                if (orderTitle === null) return true;

                const parentOrder: HTMLElement | null = (
                    orderTitle as HTMLElement
                ).closest(ORDER_CONTAINER);

                if (parentOrder === null) return true;

                const orderButton: HTMLElement | null =
                    parentOrder.querySelector("button[title='Update status']");

                if (orderButton === null) return true;

                orderButton.click();

                return false;
            },
            orderId,
            reusables.ORDER_TITLE,
            reusables.ORDER_CONTAINER
        );

        if (notFound) {
            return false;
        }
        await page.waitForSelector(reusables.ORDER_PAGE_TITLE);
        await page.waitForFunction(
            (ORDER_PAGE_TITLE: string): boolean | null => {
                const element = document.querySelector(ORDER_PAGE_TITLE);
                return (
                    element &&
                    element.textContent!.includes("Update order status")
                );
            },
            {},
            reusables.ORDER_PAGE_TITLE
        );
    } catch {
        return false;
    }

    return true;
}

/**
 *
 * @param phoneNumber phone number should be in the format +94xxxxxxxxx
 * @param orderId order id should be the something like this without the #, 4PL8FREUWVK
 * @returns returns the updated status of the order
 */

export async function updateOrderPaid(
    phoneNumber: string,
    orderId: string
): Promise<boolean> {
    const page: Page = (await browser.pages())[0];
    try {
        const isChatOpened: boolean = await openChat(phoneNumber);
        if (!isChatOpened) return false;

        const isFound: boolean = await openOrder(orderId);
        console.log(isFound);
        if (!isFound) return false;

        const paidStatus = await page.$(reusables.ORDER_STATUS);

        if (paidStatus === null) return false;

        // check if paidstatus div aria-clicked attribute is false
        const isPaid = await paidStatus.evaluate((element): boolean => {
            return element.getAttribute("aria-checked") === "true";
        }, paidStatus);

        if (isPaid) {
            logger.info("Order is already paid");
            return false;
        }

        // Click on the paid switch
        await page.waitForSelector(reusables.ORDER_PAID_BUTTON);
        await page.evaluate((ORDER_PAID_BUTTON: string) => {
            const paidButton: HTMLElement | null =
                document.querySelector(ORDER_PAID_BUTTON);
            if (paidButton === null) return;
            paidButton.click();
        }, reusables.ORDER_PAID_BUTTON);

        await page.click(reusables.ORDER_SAVE_BUTTON);

        return true;
    } catch (error) {
        logger.error(error);
        return false;
    }
}

export async function createOrder(
    phoneNumber: string,
    orderList: OrderItem[]
): Promise<string | null> {
    const page: Page = (await browser.pages())[0];
    try {
        const isChatOpened: boolean = await openChat(phoneNumber);
        if (!isChatOpened) return null;

        // Click on the attatch button
        await page.click(reusables.ATTATCH_BUTTON);

        // Click on the order button
        await page.evaluate((CREATE_ORDER_BUTTON) => {
            const spans: NodeListOf<HTMLElement> | null =
                document.querySelectorAll(CREATE_ORDER_BUTTON);
            spans.forEach((span) => {
                if (span.innerText.trim() === "Order") {
                    span.click();
                }
            });
        }, reusables.CREATE_ORDER_BUTTON);

        // check if the correct window is opened
        await page.waitForSelector(reusables.ORDER_PAGE_TITLE);
        await page.waitForFunction(
            (ORDER_PAGE_TITLE: string) => {
                const element: HTMLElement | null =
                    document.querySelector(ORDER_PAGE_TITLE);
                return element && element.textContent!.includes("Create order");
            },
            {},
            reusables.ORDER_PAGE_TITLE
        );

        for (let i = 0; i < orderList.length; i++) {
            const orderItem = orderList[i];
            await addOrderItem(orderItem);
        }

        // Click on the save button
        await page.click(reusables.ORDER_SAVE_BUTTON);
    } catch (error) {
        logger.error(error);
        return null;
    }
    try {
        // get order id
        const messagesContainer: ElementHandle<Element> | null = await page.$(
            reusables.MESSAGE_CONTAINER
        );

        if (messagesContainer === null) return null;

        const orderID = await messagesContainer.evaluate(
            (element, ORDER_TITLE: string) => {
                const ordersList: NodeListOf<HTMLElement> | null =
                    document.querySelectorAll(ORDER_TITLE);
                if (ordersList === null) return null;
                if (ordersList.length === 0) return null;
                const lastOrder = ordersList[ordersList.length - 1];
                return lastOrder.innerText;
            },
            reusables.ORDER_TITLE
        );

        return orderID;
    } catch (error) {
        logger.error(error);
        return null;
    }
}

export async function addOrderItem(orderItem: OrderItem): Promise<void> {
    const page: Page = (await browser.pages())[0];
    try {
        // Click on the add item button
        await page.click(reusables.ADD_NEW_ITEM_BUTTON);
        // Wait for the item window to open
        await page.waitForSelector(reusables.ORDER_PAGE_TITLE);
        await page.waitForFunction(
            (ORDER_PAGE_TITLE) => {
                const element: HTMLElement | null =
                    document.querySelector(ORDER_PAGE_TITLE);
                return (
                    element && element.textContent!.includes("Create new item")
                );
            },
            {},
            reusables.ORDER_PAGE_TITLE
        );

        // input fields
        const inputs: ElementHandle<Element>[] | null = await page.$$(
            reusables.ADD_ITEM_INPUTS
        );
        if (inputs === null) return;
        if (inputs.length < 3) return;

        // type the order item details
        await inputs[0].type(orderItem.name);
        await inputs[1].type(orderItem.price);
        await inputs[2].type(orderItem.quantity);

        // Click on the save button
        await new Promise((resolve) => setTimeout(resolve, 500));
        await page.click(reusables.ORDER_SAVE_BUTTON);
        await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
        logger.error(error);
    }
}
