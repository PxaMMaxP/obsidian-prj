const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');

// Step 1: Create README.md in the coverage directory
const coverageReadmePath = path.join(__dirname, '..', 'coverage', 'README.md');
const readmeContent = `
![Statements](#statements#)
![Branches](#branches#)
![Functions](#functions#)
![Lines](#lines#)
`;

fs.writeFileSync(coverageReadmePath, readmeContent, 'utf8');

// Step 2: Execute the istanbul-badges-readme tool
exec('npx istanbul-badges-readme --coverageDir=./coverage --readmeDir=./coverage', (err, stdout, stderr) => {
    if (err) {
        console.error(`Error executing istanbul-badges-readme: ${stderr}`);
        return;
    }
    console.log('Badges generated successfully.');

    // Step 3: Extract the badge links from README.md
    const updatedReadmeContent = fs.readFileSync(coverageReadmePath, 'utf8');
    const badgeLines = updatedReadmeContent.split('\n').filter(line => line.includes('https://img.shields.io'));

    // Ensure the target directory exists
    const badgesDir = path.join(__dirname, '..', 'docs', 'badges');
    if (!fs.existsSync(badgesDir)) {
        fs.mkdirSync(badgesDir, { recursive: true });
    }

    // Badge types and their order
    const badgeTypes = ['statements', 'branches', 'functions', 'lines'];

    // Save the badge images
    badgeLines.forEach(async (line, index) => {
        const match = line.match(/\((https:\/\/img\.shields\.io\/badge\/[^)]+)\)/);
        if (match) {
            const url = match[1];
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            const fileName = `badge-${badgeTypes[index]}.svg`;
            const filePath = path.join(badgesDir, fileName);
            fs.writeFileSync(filePath, buffer);
            console.log(`Saved ${fileName}`);
        }
    });

    // Step 4: Delete the README.md file
    fs.unlinkSync(coverageReadmePath);
    console.log('README.md file deleted.');
});
