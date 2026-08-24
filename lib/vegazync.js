#!/usr/bin/env node

const { spawn } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

const pkgVersion = "v1.4.3";

let nodeProcess = null;
let processClosed = true;
let preload = null;
let WelcomeMessage = `\x1b[32m${"✇✇ Welcome to vegazync ✇✇"}\x1b[1m`;
let rebootingMessage = `\x1b[35m${"✇✇✇✇...Vegazync Rebooting...✇✇✇✇"}\x1b[0m`;
let ColoredVersion = `\x1b[34m${pkgVersion}\x1b[0m`;
let ColoredManualRestartMessage = `\x1b[33m${"Press 'r' to manually restart the server"}\x1b[0m`;
let ColoredManualStopMessage = `\x1b[33m${"Press 'c' to stop the server"}\x1b[0m`;
let ColoredDevDetailsMessage = `\x1b[33m${"Press 'dev' to know more about the developer"}\x1b[0m`;
let ColoredClosingMessage = `\x1b[31m${"✇✇✇✇ ... Vegazync Shutting Down... ✇✇✇✇"}\x1b[1m`;
let ColoredDeveloperDetails = `\x1b[32m${"Developer: Harsh Vardhan"}\x1b[0m`;
let ColoredEmail = `\x1b[32m${"Email: devharsh2k4@gmail.com"}\x1b[0m`;
let ColoredCurrently = `\x1b[32m${"Currently a student looking for opportunities"}\x1b[0m`;

function parseCLIArgs(args) {
    const options = {};
    const positional = [];
    const scriptArgs = [];
    let doubleDashSeen = false;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (doubleDashSeen) {
            scriptArgs.push(arg);
            continue;
        }

        if (arg === '--') {
            doubleDashSeen = true;
            continue;
        }

        if (arg === '-h' || arg === '--help') {
            options.help = true;
        } else if (arg === '-v' || arg === '--version') {
            options.version = true;
        } else if (arg === '-w' || arg === '--watch') {
            const val = args[++i];
            if (val && !val.startsWith('-')) options.watch = val;
        } else if (arg.startsWith('--watch=')) {
            options.watch = arg.split('=').slice(1).join('=');
        } else if (arg === '-i' || arg === '--ignore') {
            const val = args[++i];
            if (val && !val.startsWith('-')) options.ignore = val;
        } else if (arg.startsWith('--ignore=')) {
            options.ignore = arg.split('=').slice(1).join('=');
        } else if (arg === '-d' || arg === '--delay') {
            const val = args[++i];
            if (val && !val.startsWith('-')) options.delay = parseInt(val, 10);
        } else if (arg.startsWith('--delay=')) {
            options.delay = parseInt(arg.split('=')[1], 10);
        } else if (arg === '-c' || arg === '--config') {
            const val = args[++i];
            if (val && !val.startsWith('-')) options.config = val;
        } else if (arg.startsWith('--config=')) {
            options.config = arg.split('=').slice(1).join('=');
        } else if (arg === '-e' || arg === '--exec') {
            const val = args[++i];
            if (val && !val.startsWith('-')) options.exec = val;
        } else if (arg.startsWith('--exec=')) {
            options.exec = arg.split('=').slice(1).join('=');
        } else if (!arg.startsWith('-')) {
            positional.push(arg);
        }
    }

    if (positional.length > 0 && !options.exec) {
        options.exec = positional[0];
        if (positional.length > 1) {
            scriptArgs.push(...positional.slice(1));
        }
    }

    options.scriptArgs = scriptArgs;
    return options;
}

function loadConfigFile(customConfigPath) {
    let configPath = null;
    let source = null;

    if (customConfigPath) {
        configPath = path.resolve(process.cwd(), customConfigPath);
        if (!fs.existsSync(configPath)) {
            console.error(`\x1b[31mError: Specified config file not found at ${configPath}\x1b[0m`);
            process.exit(1);
        }
        source = customConfigPath;
    } else {
        const vegazyncJson = path.resolve(process.cwd(), 'vegazync.json');
        const vegazyncRc = path.resolve(process.cwd(), '.vegazyncrc');
        const pkgJson = path.resolve(process.cwd(), 'package.json');

        if (fs.existsSync(vegazyncJson)) {
            configPath = vegazyncJson;
            source = 'vegazync.json';
        } else if (fs.existsSync(vegazyncRc)) {
            configPath = vegazyncRc;
            source = '.vegazyncrc';
        } else if (fs.existsSync(pkgJson)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pkgJson, 'utf8'));
                if (pkg.vegazync) {
                    const cfg = pkg.vegazync;
                    cfg.__source = 'package.json ("vegazync" key)';
                    return cfg;
                }
            } catch (err) {
                // Ignore invalid package.json parsing errors
            }
        }
    }

    if (configPath) {
        try {
            const content = fs.readFileSync(configPath, 'utf8');
            const parsed = JSON.parse(content);
            parsed.__source = source;
            return parsed;
        } catch (err) {
            console.error(`\x1b[31mError reading config file ${configPath}: ${err.message}\x1b[0m`);
            process.exit(1);
        }
    }

    return { __source: 'defaults' };
}

function normalizeWatchPatterns(watchVal) {
    let list = [];
    if (Array.isArray(watchVal)) {
        list = watchVal;
    } else if (typeof watchVal === 'string') {
        list = watchVal.split(',').map(s => s.trim()).filter(Boolean);
    }

    return list.map(pattern => {
        if (/^\.?[a-zA-Z0-9_]+$/.test(pattern)) {
            const ext = pattern.startsWith('.') ? pattern.slice(1) : pattern;
            return path.join(process.cwd(), `/**/*.${ext}`);
        }
        if (path.isAbsolute(pattern)) {
            return pattern;
        }
        return path.join(process.cwd(), pattern);
    });
}

function normalizeIgnorePatterns(ignoreVal) {
    let list = [];
    if (Array.isArray(ignoreVal)) {
        list = ignoreVal;
    } else if (typeof ignoreVal === 'string') {
        list = ignoreVal.split(',').map(s => s.trim()).filter(Boolean);
    }

    return list.map(pattern => {
        if (!pattern.includes('/') && !pattern.includes('*')) {
            return `**/${pattern}/*`;
        }
        return pattern;
    });
}

function resolveConfig(cliArgs) {
    const cliOptions = parseCLIArgs(cliArgs);

    if (cliOptions.help || cliOptions.version) {
        return cliOptions;
    }

    const configFileOptions = loadConfigFile(cliOptions.config);

    const exec = cliOptions.exec || configFileOptions.exec || configFileOptions.script || null;
    const delay = (cliOptions.delay !== undefined && !isNaN(cliOptions.delay))
        ? cliOptions.delay
        : (configFileOptions.delay !== undefined ? parseInt(configFileOptions.delay, 10) : 1000);

    const rawWatch = cliOptions.watch ?? configFileOptions.watch ?? configFileOptions.ext ?? ["js", "json", "html"];
    const rawIgnore = cliOptions.ignore ?? configFileOptions.ignore ?? ["**/node_modules/*", "**/.env", "**/.gitignore", "**/.txt"];

    const pathsToWatch = normalizeWatchPatterns(rawWatch);
    const ignored = normalizeIgnorePatterns(rawIgnore);
    const scriptArgs = cliOptions.scriptArgs || [];

    return {
        help: false,
        version: false,
        exec,
        scriptArgs,
        delay,
        pathsToWatch,
        ignored,
        rawWatch,
        rawIgnore,
        configSource: cliOptions.config ? `file (${cliOptions.config})` : (configFileOptions.__source || "defaults")
    };
}

function showHelp() {
    console.log(`
vegazync ${pkgVersion} - File watcher and automatic process restarter

Usage:
  vegazync [options] <script> [script-args...]

Options:
  -w, --watch <ext/path>    Extensions or paths to watch (comma-separated or array)
  -i, --ignore <pattern>    Files or directories to ignore (comma-separated or array)
  -d, --delay <ms>          Debounce delay before restarting in ms (default: 1000)
  -c, --config <path>       Path to custom config file (JSON)
  -e, --exec <script>       Script file to execute
  -v, --version             Display version number
  -h, --help                Display help information

Configuration File:
  Supports vegazync.json, .vegazyncrc, or "vegazync" property in package.json.

Examples:
  $ vegazync server.js
  $ vegazync server.js --watch js,ts,html --delay 500
  $ vegazync --config vegazync.json
`);
}

let activeConfig = null;

function init(config) {
    activeConfig = config;

    console.log(WelcomeMessage, ColoredVersion);
    console.log(`\x1b[36mConfig source:\x1b[0m ${config.configSource}`);
    console.log(`\x1b[36mRunning script:\x1b[0m ${config.exec}`);
    console.log(`\x1b[36mWatching:\x1b[0m ${Array.isArray(config.rawWatch) ? config.rawWatch.join(', ') : config.rawWatch}`);
    console.log(`\x1b[36mIgnoring:\x1b[0m ${Array.isArray(config.rawIgnore) ? config.rawIgnore.join(', ') : config.rawIgnore}`);
    console.log(`\x1b[36mDelay:\x1b[0m ${config.delay}ms`);
    console.log(ColoredManualRestartMessage);
    console.log(ColoredManualStopMessage);
    console.log(ColoredDevDetailsMessage);

    nodeProcess = startProcess();
    watchFiles();

    process.on('SIGINT', async () => {
        await closeHandler();
    });
    process.on('SIGTERM', async () => {
        await closeHandler();
    });

    process.on('exit', async () => {
        await closeHandler();
    });

    process.stdin.on('data', async (chunk) => {
        const data = chunk.toString();
        if (data.includes('r')) {
            await reload();
        }

        if (data.includes('c')) {
            await closeHandler();
        }

        if (data.includes('dev')) {
            devDetails();
            await reload();
        }
    });
}

function startProcess() {
    if (!activeConfig || !activeConfig.exec) {
        console.error(`\x1b[31mError: No script specified to execute.\x1b[0m`);
        process.exit(1);
    }

    const args = [activeConfig.exec, ...(activeConfig.scriptArgs || [])];
    let childProcess = spawn('node', args, { stdio: [process.stdin, process.stdout, process.stderr] });

    processClosed = false;

    childProcess.on('close', () => {
        processClosed = true;
        console.log(rebootingMessage);
        console.log("Rebooting ➠➠➠:", activeConfig.exec);
    });

    childProcess.on('error', (err) => {
        processClosed = true;
        console.log(err);
    });

    return childProcess;
}

function watchFiles() {
    if (!activeConfig) return;

    chokidar.watch(activeConfig.pathsToWatch, {
        ignored: activeConfig.ignored,
        ignoreInitial: true,
    }).on('all', async () => {
        let debounceTimer = setTimeout(async () => {
            clearTimeout(preload);
            await reload();
        }, activeConfig.delay);
        preload = debounceTimer;
    });
}

async function reload() {
    await stopProcess();
    nodeProcess = startProcess();
}

async function stopProcess() {
    return new Promise((resolve, reject) => {
        if (nodeProcess) {
            nodeProcess.on('close', () => {
                resolve(true);
            });
            nodeProcess.on('error', (err) => {
                reject(err);
            });
            nodeProcess.kill();
        } else {
            resolve(true);
        }
    });
}

async function closeHandler() {
    await stopProcess();
    console.log(ColoredClosingMessage);
    process.exit();
}

function devDetails() {
    console.log(ColoredDeveloperDetails);
    console.log(ColoredCurrently);
    console.log(ColoredEmail);
}

function myLibraryFunction() {
    console.log('Hello from my library!');
}

if (require.main === module) {
    const rawCLIArgs = process.argv.slice(2);
    const resolvedConfig = resolveConfig(rawCLIArgs);

    if (resolvedConfig.help) {
        showHelp();
        process.exit(0);
    }

    if (resolvedConfig.version) {
        console.log(pkgVersion);
        process.exit(0);
    }

    if (!resolvedConfig.exec) {
        console.error(`\x1b[31mError: Please specify a file to run (e.g. vegazync server.js)\x1b[0m`);
        showHelp();
        process.exit(1);
    }

    init(resolvedConfig);
}

module.exports = {
    myLibraryFunction,
    parseCLIArgs,
    loadConfigFile,
    resolveConfig,
    normalizeWatchPatterns,
    normalizeIgnorePatterns
};
