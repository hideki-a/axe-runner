#!/usr/bin/env node
const fs = require('fs');
const { spawn } = require('child_process');
const { Command } = require('commander');
const program = new Command();

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
        const config = options.config ? options.config : '';

        if (!fs.existsSync(process.cwd() + '/report')) {
            fs.mkdirSync(process.cwd() + '/report');
        }

        const csvFilePath = process.cwd() + `/report/report_${dateText}.csv`;
        const csvFile = fs.createWriteStream(csvFilePath);
        const BOM = '\ufeff';
        csvFile.write(BOM);
        const runner = spawn(
            'node',
            [
                __dirname + '/../index.js',
                urlFile,
                config,
            ]
        );
        runner.stdout.on('data', data => {
            csvFile.write(data);
        });
        runner.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        runner.on('close', (code) => {
            if (code !== 0) {
                console.log(`child process exited with code ${code}`);
            }
        });
    });

program.parse();
