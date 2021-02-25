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

function readUrls(urlFile, isXML) {
    let urls;
    if (isXML) {
        const sitemap = fs.readFileSync(urlFile, { encoding: "utf-8" });
        const sitemapJSON = parser.parse(sitemap);
        urls = sitemapJSON.urlset.url;
    } else {
        urls = fs.readFileSync(urlFile, { encoding: "utf-8" });
        urls = urls.replace(/\r\n?/g, '\n');
        urls = urls.split('\n');
    }
    return urls;
}

function runner(urlFile, options, writeStream) {
    return new Promise(async (resolve) => {
        const browser = await puppeteer.launch();
        const execConfig = mergeConfig(options);
        const device = await setupDevice(browser, execConfig);
        let logger;

        if (writeStream) {
            logger = new Console({ stdout: writeStream });
        }

        // アクセシビリティテスト開始
        AxeReports.createCsvReportHeaderRow(logger);

        const isXML = /\.xml$/.test(urlFile) ? true : false;
        const urls = readUrls(urlFile, isXML);
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
            page.on('response', response => {
                if (response.url() === url) {
                    if (response.status() === 401) {
                        console.error('HTTP 401 Unauthorized -', response.url());
                    } else if (response.status() === 404) {
                        console.error('HTTP 404 Not Found -', response.url());
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
            await page.goto(url);
            // await page.screenshot({ path: `page_${i + 1}.png`});

            // axeを注入して実行
            // See also: https://www.mitsue.co.jp/knowledge/blog/a11y/201903/07_1700.html
            await page.evaluate(`eval(${JSON.stringify(AXE_SOURCE)});`);
            const results = await page.evaluate(
                (config, context, options = {}) => {
                    const { axe } = window;
                    axe.configure(config);
                    return axe.run(context || document, options);
                },
                execConfig.config,
                execConfig.context,
                execConfig.options,
            );

            // 結果を確認
            if (results.violations || results.incomplete || results.inapplicable) {
                AxeReports.createCsvReportRow(results, logger);
            }

            await page.close();
        }

        await browser.close();
        resolve();
    });
}

module.exports = runner;
