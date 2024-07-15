import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to update the version number based on the specified part ('major', 'minor', 'patch')
function bumpVersion(version, part) {
    let versionParts = version.split('.').map(part => parseInt(part, 10));
    switch (part) {
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
    return versionParts.join('.');
}

function main() {
    // Determine the version part to be incremented ('major', 'minor', 'patch')
    const versionPart = process.argv[2];

    // Update package.json
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = bumpVersion(packageJson.version, versionPart);
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`package.json version updated to ${packageJson.version}`);

    // Update manifest.json
    const manifestPath = join(__dirname, '..', 'manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.version = packageJson.version;
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`manifest.json version updated to ${manifest.version}`);

    // Update versions.json
    const versionsPath = join(__dirname, '..', 'versions.json');
    const versions = JSON.parse(readFileSync(versionsPath, 'utf8'));
    versions[packageJson.version] = manifest.minAppVersion;
    writeFileSync(versionsPath, JSON.stringify(versions, null, 2));
    console.log(`versions.json updated with version ${packageJson.version}`);

    // Display commit message suggestion
    console.info('Commit message:');
    console.info('"Version bump to V' + packageJson.version + '"');
}

main();

process.exit(0);