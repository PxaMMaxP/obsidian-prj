const fs = require('fs');
const path = require('path');

const coverageDir = path.join(__dirname, 'coverage');
const typedocUrl = 'https://pxammaxp.github.io/obsidian-prj/'; // Ersetze dies durch die tatsächliche URL deiner TypeDoc-Dokumentation

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

        // Relative Pfade anpassen
        let fixedData = data.replace(/(src|href)="(?!\.)/g, '$1="./');

        // Link zur TypeDoc-Dokumentation hinzufügen
        const linkHtml = `<div style="position: fixed; bottom: 10px; right: 10px;"><a href="${typedocUrl}" target="_blank">Zur TypeDoc-Dokumentation</a></div>`;
        fixedData = fixedData.replace('</body>', `${linkHtml}</body>`);

        fs.writeFile(filePath, fixedData, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing file ${filePath}:`, err);
                return;
            }

            console.log(`Fixed paths and added link in ${filePath}`);
        });
    });
});
