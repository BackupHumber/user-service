"use strict";
const { exec } = require("child_process");

exec("npx md-seed run clients && npx md-seed run roles && npx md-seed run permissions", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        // return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        // return;
    }
    console.log(`stdout: ${stdout}`);
});