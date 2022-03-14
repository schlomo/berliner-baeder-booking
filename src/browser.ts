import puppeteer from 'puppeteer';

import { config } from './config'

export const PUPPETEER_LAUNCH_CONFIG = {
    headless: config.HEADLESS,
    devtools: !config.HEADLESS,
    slowMo: 0,
    // avoid https://github.com/puppeteer/puppeteer/issues/4752 by using installed Chrome and hope it works
    //args: process.platform == "darwin" ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
    //executablePath: process.platform == "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : null
}

export class Browser {
    private static browser: puppeteer.Browser = null;
    private constructor() { }

    static async getBrowser(): Promise<puppeteer.Browser> {
        if (Browser.browser === null) {
            return puppeteer.launch(PUPPETEER_LAUNCH_CONFIG).then((browser) => {
                Browser.browser = browser;
                //process.on('beforeExit', this.closeBrowser);
                return browser;
            });
        }
        return Browser.browser;
    }

    static async closeBrowser() {
        if (Browser.browser !== null) {
            try {
                await Browser.browser.close()
            } catch {
                // ignore
            }
            Browser.browser = null
        }
    }
}
