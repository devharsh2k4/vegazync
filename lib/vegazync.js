#!/usr/bin/env node

const { spawn } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');

let nodeProcess = null
let processClosed = true
let pathsTowatch = [
    path.join(process.cwd(), "/**/*.js"),      // JavaScript files
    path.join(process.cwd(), "/**/*.json"),    // JSON files
    path.join(process.cwd(), "/**/*.html"),    // HTML files
    path.join(process.cwd(), "/**/*.css"),     // CSS files
    path.join(process.cwd(), "/**/*.{png,jpg,jpeg,gif,svg}"), // Image files
    path.join(process.cwd(), "/**/*.md"),      // Markdown files
    path.join(process.cwd(), "/**/*")          // All files in the current directory and subdirectories
];
let preload = null;
let WelcomeMessage = `\x1b[32m${"✇✇ Welcome to vegazync ✇✇"}\x1b[1m`;
let rebootingMessage = `\x1b[35m${"✇✇✇✇...Vegazync Rebooting...✇✇✇✇"}\x1b[0m`;
let ColoredVersion = `\x1b[34m${"v1.3.7"}\x1b[0m`;
let ColoredManualRestartMessage = `\x1b[33m${"Press 'r' to manually restart the server"}\x1b[0m`;
let ColoredManualStopMessage = `\x1b[33m${"Press 'c' to stop the server"}\x1b[0m`;
let ColoredCompatibleExtensionsMessage = `\x1b[35m${"Compatible extensions: .js, .json"}\x1b[0m`;
let ColoredClosingMessage = `\x1b[31m${"✇✇✇✇ ... Vegazync Shutting Down... ✇✇✇✇"}\x1b[1m`;

let delayAmount = 1000;

if (process.argv.length === 3) {
    console.log(WelcomeMessage,ColoredVersion);
    console.log(ColoredManualRestartMessage);
    console.log(ColoredManualStopMessage);
    console.log(ColoredCompatibleExtensionsMessage);
    
    init()
}

function init() {
    nodeProcess = startProcess()
    watchFiles()
    process.on('SIGINT', async () => {
        await closeHandler()
    })
    process.on('SIGTERM', async () => {
        await closeHandler()
    })

    process.stdin.on('data', async (chunk) => {
        const data = chunk.toString()
        if (data.includes('r')) {
            await reload()
        }

        if(data.includes('c')){
            await closeHandler()
        }

    })



}




function startProcess() {
    let childProcess = spawn('node', [process.argv[2]],
        { stdio: [process.stdin, process.stdout, process.stderr,] })

    processClosed = false


    childProcess.on('close', () => {
        processClosed = true
        console.log(rebootingMessage) ;  
        console.log("Rebooting ➠➠➠:",process.argv[2]);
    })

    childProcess.on('error', (err) => {
        processClosed = true
        console.log(err)
    })

    return childProcess
}



function watchFiles() {
    chokidar.watch(pathsTowatch, {
        ignored: ["**/node_modules/*", "**/.env", "**/.gitignore"],
        ignoreInitial: true,
    }).on('all', async () => {
        let debounceTimer = setTimeout(async () => {
            clearTimeout(preload)
            await reload()
        }, delayAmount)
        preload = debounceTimer

    })
}

async function reload() {

    await stopProcess();
    nodeProcess = startProcess();

}


async function stopProcess() {

    return new Promise((resolve, reject) => {
        nodeProcess.kill()
        const key = setInterval(() => {
            if (processClosed) {}
                clearInterval(key)
                resolve(true)
            
        }, 500)
    })
}

async function closeHandler() {
    await stopProcess()
    console.log(ColoredClosingMessage)
    process.exit()
}

function myLibraryFunction() {
    console.log('Hello from my library!');
}

module.exports = {
    myLibraryFunction
};