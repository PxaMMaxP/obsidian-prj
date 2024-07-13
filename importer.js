const fs = require('fs');
const path = require('path');

const COMMENT_MARKER = '@Lifecycle';

// Funktion, um alle Dateien im Verzeichnis rekursiv zu durchsuchen
function getAllFiles(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });

    return arrayOfFiles;
}

// Funktion, um Dateien mit dem Kommentar zu finden
function findFilesWithComment(files) {
    return files.filter((file) => {
        const content = fs.readFileSync(file, 'utf8');
        return content.includes(COMMENT_MARKER);
    });
}

// Funktion, um den Import-Code zu generieren
function generateImports(files) {
    return (files.map((file) => `import '${file.replace(/\\/g, '/')}';`).join('\n')).concat('\n');
}

// Hauptfunktion
function main() {
    const srcDir = path.join(__dirname, 'src');
    const allFiles = getAllFiles(srcDir);
    const filesWithComment = findFilesWithComment(allFiles);

    const importContent = generateImports(filesWithComment);

    fs.writeFileSync(path.join(srcDir, 'auto-imports.ts'), importContent);

    console.log('Imports generated successfully');
}

main();
