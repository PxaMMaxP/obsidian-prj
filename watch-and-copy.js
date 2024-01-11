/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

function copyFiles(sourceDir) {
    const destinationDir = path.join(__dirname, '..'); // Parent directory

    fs.copyFileSync(path.join(sourceDir, 'main.js'), path.join(destinationDir, 'main.js'));
    fs.copyFileSync(path.join(sourceDir, 'styles.css'), path.join(destinationDir, 'styles.css'));
    fs.copyFileSync(path.join(sourceDir, 'manifest.json'), path.join(destinationDir, 'manifest.json'));
}

const sourceDir = __dirname; // Current directory
let debounceTimer;

// Watch for changes in the current directory
fs.watch(sourceDir, (eventType, filename) => {
    if (filename &&
        (filename === 'main.js' || filename === 'styles.css' || filename === 'manifest.json')) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            console.log(`${filename} wurde geändert.`);
            copyFiles(sourceDir); // Call the function to copy the files
        }, 250);
    }
});

// Copy the files once at the beginning
copyFiles(sourceDir);
