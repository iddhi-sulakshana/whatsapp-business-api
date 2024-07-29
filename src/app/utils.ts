import fs from "fs";

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
