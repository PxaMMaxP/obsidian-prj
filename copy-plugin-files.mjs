import { copyFileSync, watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration for file paths and destinations
const filesToCopy = [
    { name: 'styles.css', sourceDir: join(__dirname, 'src'), destDir: '../' },
    { name: 'manifest.json', sourceDir: __dirname, destDir: '../' }
];
const releaseDir = './build'; // Directory for release mode
const mode = process.argv[2]; // 'watch', 'release', or 'dev'

// Function to copy specified files
function copyFiles(files) {
    files.forEach(file => {
        const sourcePath = join(file.sourceDir, file.name);
        const destinationPath = join(file.destDir, file.name);
        copyFileSync(sourcePath, destinationPath);
        console.log(`Copied ${file.name} to ${file.destDir}`);
    });
}

// Watch mode - Watches for changes and copies files
function watchMode() {
    console.log('Watching for changes...');

    filesToCopy.forEach(file => {
        watch(file.sourceDir, (eventType, filename) => {
            if (filename === file.name) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    console.log(`${filename} changed.`);
                    copyFiles([file]);
                }, 250);
            }
        });
    });

    process.on('SIGINT', () => {
        console.log('Stopping watch mode...');
        process.exit(0);
    });
}

// Release mode - Copies all files to the release directory
function releaseMode() {
    console.log('Copying files for release...');
    const releaseFiles = filesToCopy.map(file => ({ ...file, destDir: releaseDir }));
    copyFiles(releaseFiles);
}

// Dev mode - Copies files once without watching for changes
function devMode() {
    console.log('Copying files for development...');
    copyFiles(filesToCopy);
}

// Determine mode and execute corresponding function
let debounceTimer;
switch (mode) {
    case 'watch':
        watchMode();
        break;
    case 'release':
        releaseMode();
        break;
    case 'dev':
        devMode();
        break;
    default:
        console.error('Invalid mode. Please use "watch", "release", or "dev".');
        process.exit(1);
}

// Initial file copy for 'watch' and 'release' modes
if (mode === 'watch' || mode === 'release') {
    copyFiles(filesToCopy);
}
