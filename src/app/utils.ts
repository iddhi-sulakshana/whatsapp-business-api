import fs from "fs";

const reusables = {
    WHATSAPP_URL: "https://web.whatsapp.com",
    INTRO_QR_LANDING_SELECTOR: "div.landing-wrapper",
    INTRO_CHAT_SEARCH_SELECTOR: "[data-icon='search']",
    QRCODE_SELECTOR: "div[data-ref]",
    QR_RETRY_BUTTON: "div[data-ref] > span > button",
    AUTHENTICATED_SELECTOR: "div._aly_",
    NOTIFICATION_CONTAINER_SELECTOR:
        "span.x78zum5.x1c4vz4f.x2lah0s.xdl72j9.xdt5ytf",
    RECONNECT_SPAN_SELECTOR: "span.x1lliihq",
    ALERT_ICON: 'span[data-icon="alert-computer"]',
};

export async function clearCache() {
    // remove webcache folder if exists
    if (fs.existsSync("./web_cache")) {
        fs.rmSync("./web_cache", { recursive: true });
        console.log("Cache cleared.");
    } else {
        console.log("No cache found.");
    }
}

export default reusables;
