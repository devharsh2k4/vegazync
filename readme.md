# Vegazync v1.3.4

vegazync is used to watch and monitor all of your project files so you dont need to restart manually and let vegazync handle it for you. It can monitor any type of changes in  ".js",".html",".json",".css","image files(png,jpg,jpeg,gif,svg)"&".md" files which will make your development smooth and easy.

[![NPM version](https://badge.fury.io/js/vegazync.svg)](https://npmjs.org/package/vegazync)

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
    "dev": "vegazync server.js",
  },
}
```
## Manual Restart

You can manually restart vegazync via typing 'r' and hit Enter in the terminal

## Stop

To stop and exit the process you can type 'c' and hit Enter in the terminal

## Ignoring

vegazync ignores ".env","node modules" & ".gitignore" files 

Will add the feature of manually ignoring specific files and directories in future

## Contributing

Contributions are welcome! Please follow the guidelines
                                                                                                                                                                               
## PREVIEW  
![preview.png ](https://github.com/devharsh2k4/vegazync/blob/main/preview.png)                                                                                                                                                                                                                                                                                                              
