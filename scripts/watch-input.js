const { exec, spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Starting development environment...');
console.log('Press Enter to trigger a build...');

const processes = [
    spawn('node', ['esbuild.config.mjs'], { stdio: 'inherit', shell: true }),
    spawn('npm', ['run', 'watch:sass'], { stdio: 'inherit', shell: true }),
    spawn('node', ['scripts/copy-plugin-files.mjs', 'watch'], { stdio: 'inherit', shell: true })
];

rl.on('line', () => {
    console.log('Triggering build...');
    const buildProcess = exec('npm run build:dev', { shell: true }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error during build: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Build stderr: ${stderr}`);
            return;
        }
        console.log(`Build stdout: ${stdout}`);
        console.log('');
        console.log('--- Build complete ---');
        console.log('');
        console.log('Press Enter to trigger a new build...');
    });

    buildProcess.stdout.pipe(process.stdout);
    buildProcess.stderr.pipe(process.stderr);
});

process.on('exit', () => {
    processes.forEach(p => p.kill());
});
