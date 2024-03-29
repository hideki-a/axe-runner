require('dotenv').config()
const fs = require('fs');
const deepExtend = require('deep-extend');
const parser = require('fast-xml-parser');
const puppeteer = require('puppeteer');
const AXE_SOURCE = require('axe-core').source;
const AXE_LOCALE_JA = require('axe-core/locales/ja.json');
const AxeReports = require('@hideki_a/axe-reports');
const { Console } = require('console');

// https://www.npmjs.com/package/sleep
function msleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

function sleep(n) {
    msleep(n*1000);
}

function mergeConfig(options) {
    const defaultUserConfigPath = process.cwd() + '/axe-runner.config.js';
    const defaltConfig = {
        config: {
            locale: AXE_LOCALE_JA,
        },
        context: null,
        options: {
            resultTypes: ['violations', 'incomplete', 'inapplicable'],
        },
        interval: 3,
        navigateOptions: {
            waitUntil: ['load', 'networkidle0'],
        },
    };
    let userConfig;
    if (options.config) {
        const userConfigPath = process.cwd() + '/' + options.config;
        if (fs.existsSync(userConfigPath)) {
            userConfig = require(userConfigPath);
        }
    } else if (fs.existsSync(defaultUserConfigPath)) {
        userConfig = require(defaultUserConfigPath);
    }
    const execConfig = deepExtend(defaltConfig, userConfig);
    return execConfig;
}

async function setupDevice(browser, execConfig) {
    let device;
    if (execConfig.device) {
        if (typeof execConfig.device === 'string') {
            device = puppeteer.devices[execConfig.device];
        } else if (typeof execConfig.device === 'object') {
            device = execConfig.device;
        }
    }

    if (!device) {
        const userAgentString = await browser.userAgent();
        device = {
            name: 'Chrome',
            userAgent: userAgentString,
            viewport: {
                width: 1280,
                height: 800,
                deviceScaleFactor: 1,
                isMobile: false,
                hasTouch: false,
                isLandscape: false
            }
        };
    }

    return device;
}

function loadLocale(locale) {
    let json = null;

    if (!/^[a-zA-Z_]{2,4}$/.test(locale)) {
        console.log('An error in the locale specification.');
        return json;
    }

    if (locale !== 'en') {
        try {
            json = require(`axe-core/locales/${locale}.json`);
        } catch {
            console.log('Failed to read the locale file.');
        }
    }

    return json;
}

function readUrls(urlFile, isXML, reject) {
    let urls;
    if (isXML) {
        try {
            const sitemap = fs.readFileSync(urlFile, { encoding: "utf-8" });
            const sitemapJSON = parser.parse(sitemap);
            urls = sitemapJSON.urlset.url;
        } catch {
            console.log('Failed to read the URL file.')
            reject();
        }
    } else {
        try {
            urls = fs.readFileSync(urlFile, { encoding: "utf-8" });
            urls = urls.replace(/\r\n?/g, '\n');
            urls = urls.split('\n');
        } catch {
            console.log('Failed to read the URL file.')
            reject();
        }
    }
    return urls;
}

function runner(urlFile, options, writeStream) {
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch();
        const execConfig = mergeConfig(options);
        const device = await setupDevice(browser, execConfig);
        let logger;

        if (writeStream) {
            logger = new Console({ stdout: writeStream });
        }

        if (typeof execConfig.config.locale === 'string') {
            execConfig.config.locale = loadLocale(execConfig.config.locale);
        }

        // アクセシビリティテスト開始
        AxeReports.createCsvReportHeaderRow(execConfig.config.locale.lang, logger);

        const isXML = /\.xml$/.test(urlFile) ? true : false;
        const urls = readUrls(urlFile, isXML, reject);
        for (let i = 0, nUrls = urls.length; i < nUrls; i += 1) {
            const url = isXML ? urls[i]['loc'] : urls[i];
            if (!url) {
                continue;
            }

            // リクエスト間で少し間を取ってURLの処理開始
            if (i !== 0) {
                sleep(execConfig.interval);
            }
            console.log(`Accessibility Testing: URL No.${i + 1}`);

            const page = await browser.newPage();
            await page.setBypassCSP(true);
            if (typeof execConfig.device !== 'object') {
                device.viewport.isMobile = false;
            }
            await page.emulate(device);

            // イベント設定
            let redirectUrl = null;
            await page.setRequestInterception(true);
            page.on('request', async request => {
                if (
                    request.isNavigationRequest() &&
                    (request.url() === redirectUrl || request.redirectChain().length)
                ) {
                    await request.abort();
                } else {
                    await request.continue();
                }
            });

            page.on('response', async response => {
                if (response.url() === url) {
                    if (response.status() === 401) {
                        console.error('HTTP 401 Unauthorized -', response.url());
                    } else if (response.status() === 404) {
                        console.error('HTTP 404 Not Found -', response.url());
                    } else if (response.status() !== 301 && response.status() !== 302) {
                        const refreshRegex = /http-equiv="refresh"\s+content="(\d+);\s*URL=([^"]+)"/;
                        const body = await response.text();
                        const found = body.match(refreshRegex);
                        if (found) {
                            redirectUrl = found[2];
                            if (found[1] * 1 > 0) {
                                await page.evaluate(_ => window.stop());
                            }
                        }
                    }
                }
            });

            // ページ読み込み
            if (process.env.BASIC_AUTH_USERNAME && process.env.BASIC_AUTH_PASSWORD) {
                await page.authenticate({
                    username: process.env.BASIC_AUTH_USERNAME,
                    password: process.env.BASIC_AUTH_PASSWORD
                });
            }
            const response = await page.goto(url, execConfig.navigateOptions)
                .catch(() => {
                    console.log('Connection failed. - ' + url);
                });
            if (!response) {
                continue;
            }
            // await page.screenshot({ path: `page_${i + 1}.png`});

            // axeを注入して実行
            // See also: https://www.mitsue.co.jp/knowledge/blog/a11y/201903/07_1700.html
            let failInject = false;
            await page.evaluate(`eval(${JSON.stringify(AXE_SOURCE)});`).catch(async () => {
                console.log('Error occurred while running axe. - ' + url);
                failInject = true;
            });

            if (!failInject) {
                await page.evaluate(
                    (config, context, options = {}) => {
                        const { axe } = window;
                        axe.configure(config);
                        return axe.run(context || document, options);
                    },
                    execConfig.config,
                    execConfig.context,
                    execConfig.options,
                ).then(results => {
                    // 結果を確認
                    if (results && (results.violations || results.incomplete || results.inapplicable)) {
                        AxeReports.createCsvReportRow(results, execConfig.config.locale.lang, logger);
                    }
                }).catch(() => {
                    console.log('Error occurred while running axe. - ' + url);
                });
            }

            await page.close();
        }

        await browser.close();
        resolve();
    });
}

module.exports = runner;
