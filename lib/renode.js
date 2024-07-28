#!/usr/bin/env node


const { spawn } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');

let nodeProcess = null
let processClosed = true
let pathsTowatch = [
    path.join(process.cwd(), "/**/*.js")
]
let preload = null;



if (process.argv.length === 3) {
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
        if (data.includes('rs')) {
            await reload()
        }
    })



}


function startProcess() {
    let childProcess = spawn('node', [process.argv[2]],
        { stdio: [process.stdin, process.stdout, process.stderr] })

    processClosed = false
    childProcess.on('close', () => {
        processClosed = true
        console.log('Process restarting...😂😂😂')
    })

    childProcess.on('error', (err) => {
        processClosed = true
        console.log(err)
    })

    return childProcess
}

function watchFiles() {
    chokidar.watch(pathsTowatch, {
        ignored: "**/node_modules/*",
        ignoreInitial: true,
    }).on('all', async () => {
        let debounceTimer = setTimeout(async () => {
            clearTimeout(preload)
            await reload()
        }, 1000)
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
    process.exit()
}

function myLibraryFunction() {
    console.log('Hello from my library!');
}

module.exports = {
    myLibraryFunction
};