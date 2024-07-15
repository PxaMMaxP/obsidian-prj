const fs = require('fs');
const path = require('path');

const coverageDir = path.join(__dirname, 'coverage');

// Funktion, um alle Dateien in einem Verzeichnis rekursiv zu durchsuchen
const getAllFiles = (dir, files = []) => {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, files);
        } else {
            files.push(fullPath);
        }
    });
    return files;
};

// Alle HTML-Dateien im coverage-Ordner finden
const htmlFiles = getAllFiles(coverageDir).filter(file => file.endsWith('.html'));

// Alle HTML-Dateien bearbeiten
htmlFiles.forEach(filePath => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return;
        }

        const fixedData = data.replace(/(src|href)="(?!\.)/g, '$1="./');

        fs.writeFile(filePath, fixedData, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing file ${filePath}:`, err);
                return;
            }

            console.log(`Fixed paths in ${filePath}`);
        });
    });
});
