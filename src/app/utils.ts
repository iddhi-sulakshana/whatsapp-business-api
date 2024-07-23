import fs from "fs";

const reusables = {
    WHATSAPP_URL: "https://web.whatsapp.com",
    INTRO_QR_LANDING_SELECTOR: "div.landing-wrapper",
    INTRO_CHAT_SEARCH_SELECTOR: "[data-icon='search']",
    QRCODE_SELECTOR: "div[data-ref]",
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
