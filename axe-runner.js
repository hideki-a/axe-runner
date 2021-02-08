const fs = require('fs');
const parser = require('fast-xml-parser');
const puppeteer = require('puppeteer');
const AXE_SOURCE = require('axe-core').source;
const AXE_LOCALE_JA = require('axe-core/locales/ja.json');
const AxeReports = require('axe-reports');

(async () => {
    const promises = [];
    const browser = await puppeteer.launch();
    // const deviceMobile = puppeteer.devices['iPhone 8'];
    const userAgentString = await browser.userAgent();
    const devicePC = {
        'name': 'Chrome',
        'userAgent': userAgentString,
        'viewport': {
            'width': 1280,
            'height': 600,
            'deviceScaleFactor': 1,
            'isMobile': false,
            'hasTouch': false,
            'isLandscape': false
        }
    };

    AxeReports.createCsvReportHeaderRow();

    const file = process.argv[2] ? process.argv[2] : 'sitemap.xml';
    const isXML = /\.xml$/.test(file) ? true : false;
    let urls;
    if (isXML) {
        const sitemap = fs.readFileSync(file, { encoding: "utf-8" });
        const sitemapJSON = parser.parse(sitemap);
        urls = sitemapJSON.urlset.url;
    } else {
        urls = fs.readFileSync(file, { encoding: "utf-8" });
        urls = urls.replace(/\r\n?/g, '\n');
        urls = urls.split('\n');
    }

    for (let i = 0, nUrls = urls.length; i < nUrls; i += 1) {
        const url = isXML ? urls[i]['loc'] : urls[i];
        if (!url) {
            continue;
        }

        promises.push(browser.newPage().then(async page => {
            await page.setBypassCSP(true);

            // ページ読み込み
            await page.emulate(devicePC);
            await page.goto(`${url}`);

            // axeを注入して実行
            await page.evaluate(`eval(${JSON.stringify(AXE_SOURCE)});`);
            const results = await page.evaluate((config, context, options) => {
                const { axe } = window;
                axe.configure(config);
                return axe.run(context || document, options || {});
            }, { locale: AXE_LOCALE_JA }, null, { resultTypes: ['violations', 'incomplete', 'inapplicable'] });

            // 結果を確認
            if (results.violations || results.incomplete || results.inapplicable) {
                AxeReports.createCsvReportRow(results);
            }
        }));
    }

    await Promise.all(promises);
    await browser.close();
})();
