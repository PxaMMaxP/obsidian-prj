/* eslint-disable @typescript-eslint/no-var-requires */
//bump-version.js
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = require(packageJsonPath);

// Bestimmen des Versionsteils, der erhöht werden soll
const versionPart = process.argv[2]; // 'major', 'minor', 'patch'

let versionParts = packageJson.version.split('.').map(part => parseInt(part));

switch (versionPart) {
    case 'major':
        versionParts[0]++;
        versionParts[1] = 0;
        versionParts[2] = 0;
        break;
    case 'minor':
        versionParts[1]++;
        versionParts[2] = 0;
        break;
    case 'patch':
    default:
        versionParts[2]++;
        break;
}

packageJson.version = versionParts.join('.');

// Zurückschreiben der package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log(`Version updated to ${packageJson.version}`);