#!/usr/bin/env node
const fs = require('fs');
const { Command } = require('commander');
const program = new Command();
const runner = require('../lib/runner');

const dateText = (() => {
    const dateObj = new Date();
    const year   = dateObj.getFullYear();
    const month  = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const date   = dateObj.getDate().toString().padStart(2, '0');
    const hour   = dateObj.getHours().toString().padStart(2, '0');
    const minute = dateObj.getMinutes().toString().padStart(2, '0');
    const second = dateObj.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${date}${hour}${minute}${second}`;
})();

program
    .arguments('<urlFile>')
    .option('-c, --config <value>', 'Path to configuration file.')
    .action((urlFile, options) => {
        urlFile = urlFile ? urlFile : 'sitemap.xml';

        if (!fs.existsSync(process.cwd() + '/report')) {
            fs.mkdirSync(process.cwd() + '/report');
        }

        const csvFilePath = process.cwd() + `/report/report_${dateText}.csv`;
        const csvFile = fs.createWriteStream(csvFilePath);
        const BOM = '\ufeff';
        csvFile.write(BOM);
        // process.stdout.write = csvFile.write.bind(csvFile);

        const runnerPromise = runner(urlFile, options, csvFile);
        runnerPromise.then(() => {
            process.exit(0);
        });
    });

program.parse();
