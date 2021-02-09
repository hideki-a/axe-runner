#!/usr/bin/env node
const fs = require('fs');
const { exec } = require('child_process');
const iconv = require('iconv-lite');

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

const urlFile = process.argv[2] ? process.argv[2] : null;
const command = urlFile ?
    `node ${__dirname}/../index.js ${urlFile}` : `node ${__dirname}/../index.js`;
exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
    }

    if (!error) {
        if (!fs.existsSync(process.cwd() + '/report')) {
            fs.mkdirSync(process.cwd() + '/report');
        }
        fs.writeFileSync(
            process.cwd() + `/report/report_${dateText}.csv`,
            iconv.encode(stdout, 'Shift_JIS')
        );
    }
});
