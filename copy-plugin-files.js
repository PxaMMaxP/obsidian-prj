/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

function copyFiles(sourceDir) {
    const destinationDir = path.join(__dirname, '..'); // Parent directory

    fs.copyFileSync(path.join(sourceDir, 'main.js'), path.join(destinationDir, 'main.js'));
    fs.copyFileSync(path.join(sourceDir, 'styles.css'), path.join(destinationDir, 'styles.css'));
    fs.copyFileSync(path.join(sourceDir, 'manifest.json'), path.join(destinationDir, 'manifest.json'));
}

const sourceDir = __dirname;

copyFiles(sourceDir);