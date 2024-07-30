import fs from "fs";
import shell from "shelljs";
import logger from "../api/config/logger";

const reusables = {
    WHATSAPP_URL: "https://web.whatsapp.com",
    CHAT_URL: "https://web.whatsapp.com/send?phone=",
    INTRO_QR_LANDING_SELECTOR: "div.landing-wrapper",
    INTRO_CHAT_SEARCH_SELECTOR: "[data-icon='search']",
    QRCODE_SELECTOR: "div[data-ref]",
    QR_RETRY_BUTTON: "div[data-ref] > span > button",
    AUTHENTICATED_SELECTOR: "div._aly_",
    NOTIFICATION_CONTAINER_SELECTOR:
        "span.x78zum5.x1c4vz4f.x2lah0s.xdl72j9.xdt5ytf",
    RECONNECT_SPAN_SELECTOR: "span.x1lliihq",
    ALERT_ICON: "span[data-icon='alert-computer']",
    SEARCH_BAR:
        "div[aria-label='Search input textbox'].x1hx0egp.x6ikm8r.x1odjw0f.x1k6rcq7.x6prxxf",
    CHAT_WINDOW:
        "div.x10l6tqk.x13vifvy.x17qophe.xh8yej3.x5yr21d.x182nak8.x1wwuglj.x1vs56c6",
    MESSAGE_BOX:
        "div[aria-label='Type a message'].x1hx0egp.x6ikm8r.x1odjw0f.x1k6rcq7.x6prxxf",
    PHONE_NOT_FOUND: "div.x12lqup9.x1o1kx08",
    PHONE_NOT_FOUND_BUTTON:
        "button.x889kno.x1a8lsjc.xbbxn1n.xxbr6pl.x1n2onr6.x1rg5ohu.xk50ysn.x1f6kntn.xyesn5m.x1z11no5.xjy5m1g.x1mnwbp6.x4pb5v6.x178xt8z.xm81vs4.xso031l.xy80clv.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x1v8p93f.xogb00i.x16stqrj.x1ftr3km.x1hl8ikr.xfagghw.x9dyr19.x9lcvmn.xbtce8p.x14v0smp.xo8ufso.xcjl5na.x1k3x3db.xuxw1ft.xv52azi",
    ORDER_STATUS:
        "div.x3nfvp2.xl56j7k.x6s0dn4.x1td3qas.x1qx5ct2.x7r5mf7.xeyog9w.xahult9.x1w4ip6v.x1n2onr6.x1ypdohk",
    ORDER_PAID_BUTTON:
        "input.x10l6tqk.x1i1rx1s.xjm9jq1.x6ikm8r.x10wlt62.xeh89do.x1hyvwdk.xuxw1ft",
    ORDER_SAVE_BUTTON:
        "button.x889kno.x1a8lsjc.xbbxn1n.xxbr6pl.x1n2onr6.x1rg5ohu.xk50ysn.x1f6kntn.xyesn5m.x1z11no5.xjy5m1g.x1mnwbp6.x4pb5v6.x178xt8z.xm81vs4.xso031l.xy80clv.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x1v8p93f.xogb00i.x16stqrj.x1ftr3km.x1hl8ikr.xfagghw.x9dyr19.x9lcvmn.xbtce8p.x14v0smp.xo8ufso.xcjl5na.x1k3x3db.xuxw1ft.xv52azi",
    ATTATCH_BUTTON:
        "div[title='Attach']._ajv6.x1y1aw1k.x1sxyh0.xwib8y2.xurb0ha",
    CREATE_ORDER_BUTTON:
        "span.xdod15v.xzwifym.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft",
    ORDER_PAGE_TITLE: "h1.x1qlqyl8.x1pd3egz.xcgk4ki",
    MESSAGE_CONTAINER: "div.x3psx0u.xwib8y2.xkhd6sd.xrmvbpv",
    ORDER_TITLE: "div.x190qgfh.xk50ysn.x40yjcy.xtvhhri.xkffqfj.x1dbl2gt",
    ORDER_CONTAINER:
        "div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.x78zum5.xozqiw3.x1oa3qoh.x12fk4p8.xeuugli.x2lwn1j.x1nhvcw1.xdt5ytf.x1qjc9v5.x1o095ql.x193iq5w",
    ADD_NEW_ITEM_BUTTON: "div._ak72._ak73._ak7k",
    ADD_ITEM_INPUTS: "div.x1hx0egp.x6ikm8r.x1odjw0f.x1k6rcq7.x1nxh6w3",
};

export async function clearCache() {
    // remove webcache folder if exists
    if (fs.existsSync("./web_cache")) {
        fs.rmSync("./web_cache", { recursive: true });
        logger.info("Cache cleared");
    } else {
        logger.info("No cache found");
    }
}

export async function closeBrowser() {
    shell.exec("pkill chrome");
    logger.info("Browser closed");
    await new Promise((resolve) => setTimeout(resolve, 1000));
}

export default reusables;
