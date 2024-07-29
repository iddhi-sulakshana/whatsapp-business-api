const puppeteer = require("puppeteer");
const moduleRaid = require("@pedroslopez/moduleraid/moduleraid");

async function main() {
    // Load with the authenticated QR cached data
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: "./web_cache",
    });

    const mainPage = (await browser.pages())[0];

    await mainPage.goto("https://web.whatsapp.com", { timeout: 0 });

    await mainPage.waitForSelector("[data-icon='search']");

    // Replace this phone number with the desired number
    const phoneNumber = "+94716666681";
    const message = "Hello, this is an automated message!";
    const success = await openChat(mainPage, phoneNumber);
    if (!success) return;

    await cancelOrder(mainPage, "ORDER #4PKU0JPYK8M");
}

main();

async function cancelOrder(mainPage, orderId) {
    const isFound = await openOrder(mainPage, orderId);
    if (!isFound) return;

    await mainPage.evaluate(() => {
        const buttonList = document.querySelectorAll(
            "button.xexx8yu.x4uap5.x18d9i69.xkhd6sd.xjb2p0i.xk390pu.x1heor9g.x1ypdohk.xjbqb8w.x972fbf.xcfux6l.x1qhh985.xm0m39n"
        );
        buttonList[buttonList.length - 2].click();
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    await mainPage.click(
        "button.x889kno.x1a8lsjc.xbbxn1n.xxbr6pl.x1n2onr6.x1rg5ohu.xk50ysn.x1f6kntn.xyesn5m.x1z11no5.xjy5m1g.x1mnwbp6.x4pb5v6.x178xt8z.xm81vs4.xso031l.xy80clv.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x1v8p93f.xogb00i.x16stqrj.x1ftr3km.x1hl8ikr.xfagghw.x9dyr19.x9lcvmn.xbtce8p.x14v0smp.xo8ufso.xcjl5na.x1k3x3db.xuxw1ft.xv52azi"
    );
}

async function changePaidOrder(mainPage, orderId) {
    const isFound = await openOrder(mainPage, orderId);
    if (!isFound) return;

    const paidStatus = await mainPage.$(
        "div.x3nfvp2.xl56j7k.x6s0dn4.x1td3qas.x1qx5ct2.x7r5mf7.xeyog9w.xahult9.x1w4ip6v.x1n2onr6.x1ypdohk"
    );
    // check if paidstatus div aria-clicked attribute is false
    const isPaid = await paidStatus.evaluate((element) => {
        return element.getAttribute("aria-checked") === "true";
    }, paidStatus);

    if (isPaid) {
        console.log("Order is already paid");
        return;
    }

    await mainPage.waitForSelector(
        "input.x10l6tqk.x1i1rx1s.xjm9jq1.x6ikm8r.x10wlt62.xeh89do.x1hyvwdk.xuxw1ft"
    );

    await mainPage.evaluate(() => {
        document
            .querySelector(
                "input.x10l6tqk.x1i1rx1s.xjm9jq1.x6ikm8r.x10wlt62.xeh89do.x1hyvwdk.xuxw1ft"
            )
            .click();
    });

    await mainPage.click(
        "button.x889kno.x1a8lsjc.xbbxn1n.xxbr6pl.x1n2onr6.x1rg5ohu.xk50ysn.x1f6kntn.xyesn5m.x1z11no5.xjy5m1g.x1mnwbp6.x4pb5v6.x178xt8z.xm81vs4.xso031l.xy80clv.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x1v8p93f.xogb00i.x16stqrj.x1ftr3km.x1hl8ikr.xfagghw.x9dyr19.x9lcvmn.xbtce8p.x14v0smp.xo8ufso.xcjl5na.x1k3x3db.xuxw1ft.xv52azi"
    );
}

async function openOrder(mainPage, orderID) {
    const notFound = await mainPage.evaluate((orderNo) => {
        const ordersList = document.querySelectorAll(
            "div.x190qgfh.xk50ysn.x40yjcy.xtvhhri.xkffqfj.x1dbl2gt"
        );
        let orderTitle;

        ordersList.forEach((order) => {
            if (order.innerText.includes(orderNo)) {
                orderTitle = order;
            }
        });

        if (!orderTitle) return;

        const parentOrder = orderTitle.closest(
            "div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.x78zum5.xozqiw3.x1oa3qoh.x12fk4p8.xeuugli.x2lwn1j.x1nhvcw1.xdt5ytf.x1qjc9v5.x1o095ql.x193iq5w"
        );

        const orderButton = parentOrder.querySelector(
            "button[title='Update status']"
        );
        if (!orderButton) return true;

        orderButton.click();
    }, orderID);

    if (notFound) return false;

    try {
        await mainPage.waitForFunction(() => {
            const element = document.querySelector(
                "h1.x1qlqyl8.x1pd3egz.xcgk4ki"
            );
            return (
                element && element.textContent.includes("Update order status")
            );
        });
    } catch {
        return false;
    }

    return true;
}

async function openChat(mainPage, phoneNumber) {
    try {
        // Press Ctrl + Alt + /
        // await mainPage.keyboard.down("Control");
        // await mainPage.keyboard.down("Alt");
        // await mainPage.keyboard.press("/");
        // await mainPage.keyboard.up("Alt");
        // await mainPage.keyboard.up("Control");
        // // Type the phone number
        // await mainPage.keyboard.type("(You)");

        // or

        await mainPage.type(
            "div[aria-label='Search input textbox'].x1hx0egp.x6ikm8r.x1odjw0f.x1k6rcq7.x6prxxf",
            "(You)"
        );

        // // press enter
        await mainPage.keyboard.press("Enter");

        // // Wait for the chat to open
        // // wait for div that has Type a message text
        await mainPage.waitForSelector(
            "div.x10l6tqk.x13vifvy.x1ey2m1c.x1r1tlb4.xhtitgo.x1grh1yo.x47corl.x87ps6o.xh9ts4v.x1k6rcq7.x6prxxf"
        );

        await mainPage.type(
            "div[aria-label='Type a message'].x1hx0egp.x6ikm8r.x1odjw0f.x1k6rcq7.x6prxxf",
            "https://web.whatsapp.com/send?phone=" + phoneNumber
        );

        // press enter
        await mainPage.keyboard.press("Enter");

        await mainPage.evaluate((number) => {
            document
                .querySelector(
                    "a[title='https://web.whatsapp.com/send?phone=" +
                        number +
                        "']"
                )
                .click();
        }, phoneNumber);

        // // wait for 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function createOrder(mainPage) {
    await mainPage.click(
        "div[title='Attach']._ajv6.x1y1aw1k.x1sxyh0.xwib8y2.xurb0ha"
    );

    await mainPage.evaluate(() => {
        const spans = document.querySelectorAll(
            "span.xdod15v.xzwifym.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft"
        );
        spans.forEach((span) => {
            if (span.innerText.trim() === "Order") {
                span.click();
            }
        });
    });

    await mainPage.waitForSelector("h1.x1qlqyl8.x1pd3egz.xcgk4ki");
    await mainPage.waitForFunction(() => {
        const element = document.querySelector("h1.x1qlqyl8.x1pd3egz.xcgk4ki");
        return element && element.textContent.includes("Create order");
    });

    for (let i = 0; i < orderList.length; i++) {
        const orderItem = orderList[i];
        await addOrderItem(mainPage, orderItem);
    }

    await mainPage.click(
        "button.x889kno.x1a8lsjc.xbbxn1n.xxbr6pl.x1n2onr6.x1rg5ohu.xk50ysn.x1f6kntn.xyesn5m.x1z11no5.xjy5m1g.x1mnwbp6.x4pb5v6.x178xt8z.xm81vs4.xso031l.xy80clv.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x1v8p93f.xogb00i.x16stqrj.x1ftr3km.x1hl8ikr.xfagghw.x9dyr19.x9lcvmn.xbtce8p.x14v0smp.xo8ufso.xcjl5na.x1k3x3db.xuxw1ft.xv52azi"
    );

    // get order id

    const messagesContainer = await mainPage.$(
        "div.x3psx0u.xwib8y2.xkhd6sd.xrmvbpv"
    );

    const orderID = await messagesContainer.evaluate(() => {
        const ordersList = document.querySelectorAll(
            "div.x190qgfh.xk50ysn.x40yjcy.xtvhhri.xkffqfj.x1dbl2gt"
        );
        const lastOrder = ordersList[ordersList.length - 1];

        return lastOrder.innerText;
    });

    return orderID;
}

async function addOrderItem(mainPage, orderItem) {
    await mainPage.click("div._ak72._ak73._ak7k");
    await mainPage.waitForFunction(() => {
        const element = document.querySelector("h1.x1qlqyl8.x1pd3egz.xcgk4ki");
        return element && element.textContent.includes("Create new item");
    });

    const elements = await mainPage.$$(
        "div.x1hx0egp.x6ikm8r.x1odjw0f.x1k6rcq7.x1nxh6w3"
    );
    await elements[0].type(orderItem.itemName.toString());
    await elements[1].type(orderItem.itemPrice.toString());
    await elements[2].type(orderItem.itemQuantity.toString());

    await new Promise((resolve) => setTimeout(resolve, 500));

    await mainPage.click(
        "button.x889kno.x1a8lsjc.xbbxn1n.xxbr6pl.x1n2onr6.x1rg5ohu.xk50ysn.x1f6kntn.xyesn5m.x1z11no5.xjy5m1g.x1mnwbp6.x4pb5v6.x178xt8z.xm81vs4.xso031l.xy80clv.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x1v8p93f.xogb00i.x16stqrj.x1ftr3km.x1hl8ikr.xfagghw.x9dyr19.x9lcvmn.xbtce8p.x14v0smp.xo8ufso.xcjl5na.x1k3x3db.xuxw1ft.xv52azi"
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
}

const orderList = [
    {
        itemName: "Item 1",
        itemPrice: 100,
        itemQuantity: 1,
    },
    {
        itemName: "Item 2",
        itemPrice: 200,
        itemQuantity: 2,
    },
    {
        itemName: "Item 3",
        itemPrice: 300,
        itemQuantity: 3,
    },
];
