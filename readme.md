<p align="center">
  <a href="https://devharsh2k4.github.io/vegazync/">
    <img src="./logo-withoutBg.png" alt="Vegazync Logo" width="150" height="150">
  </a>
</p>


# Vegazync v1.4.3

vegazync is used to watch and monitor all of your project files so you dont need to restart manually and let vegazync handle it for you. It can monitor any type of changes in  files which will make your development smooth and easy.



## Installation
Step 1.

To Install globally
```bash
npm install -g vegazync
```

To install locally in your project
```bash
npm i vegazync
```

Step 2.
Inside package.json file add a script

```json
{
  "name": "vegazync",
  "scripts": {
    "start": "vegazync server.js",
  },
}
```

Step 3.
To Start the server with vegazync
```bash
npm start
```

## Manual Restart

You can manually restart vegazync via typing 'r' and hit Enter in the terminal

## Stop

To stop and exit the process you can type 'c' and hit Enter in the terminal

## Configuration

vegazync can be configured either via CLI flags or configuration files (`vegazync.json`, `.vegazyncrc`, or `"vegazync"` section in `package.json`).

### CLI Options

| Flag | Description | Example |
| --- | --- | --- |
| `-w, --watch` | Extensions or paths to watch (comma-separated or array) | `vegazync server.js -w js,ts,json` |
| `-i, --ignore` | Files or directories to ignore (comma-separated or array) | `vegazync server.js -i node_modules,dist,.git` |
| `-d, --delay` | Debounce delay before restarting in ms (default: `1000`) | `vegazync server.js -d 500` |
| `-c, --config` | Path to custom JSON config file | `vegazync --config my-config.json` |
| `-e, --exec` | Script file to execute | `vegazync --exec server.js` |
| `-h, --help` | Display help information | `vegazync --help` |
| `-v, --version` | Display version number | `vegazync --version` |

### Configuration Files

You can create a `vegazync.json` or `.vegazyncrc` file in your project root, or add a `"vegazync"` section to your `package.json`.

#### Example `vegazync.json`:
```json
{
  "exec": "server.js",
  "watch": ["js", "ts", "json", "html"],
  "ignore": ["node_modules", "dist", ".env"],
  "delay": 500
}
```

#### Example `package.json`:
```json
{
  "name": "my-app",
  "scripts": {
    "start": "vegazync"
  },
  "vegazync": {
    "exec": "server.js",
    "watch": ["js", "ts"],
    "ignore": ["node_modules", "build"],
    "delay": 500
  }
}
```

## PREVIEW  
![preview.png ](https://github.com/devharsh2k4/vegazync/blob/main/preview.png)
                                                                                                                                                                                                                                                                                                              
