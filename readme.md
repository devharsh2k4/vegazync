<p align="center">
  <a href="https://devharsh2k4.github.io/vegazync/">
    <img src="./logo-withoutBg.png" alt="Vegazync Logo" width="150" height="150">
  </a>
</p>


# Vegazync v1.4.2

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

## Ignoring

vegazync ignores ".env","node modules" ".txt" & ".gitignore" files 

Will add the feature of manually ignoring specific files and directories in future
                                                                                                                                                                               
## PREVIEW  
![preview.png ](https://github.com/devharsh2k4/vegazync/blob/main/preview.png)                                                                                                                                                                                                                                                                                                              
