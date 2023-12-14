import { app, BrowserWindow } from "electron";
import { initialize as initialiseElectronRemote } from "@electron/remote/main";
import "./ipc";
import { initialise } from "./services/init";
import { openMainWindow } from "./services/windows";
import { handleProtocolCall } from "./services/protocol";
import { shouldShowMainWindow } from "./services/arguments";
import { logErr, logInfo } from "./library/log";
import { BUTTERCUP_PROTOCOL, PLATFORM_MACOS } from "./symbols";
import { getStartInBackground } from "./services/config";
const path = require("path");

let additionalWindow: BrowserWindow | null;

import { Heimdall, TidePromise, FieldData } from "heimdall-tide";
import path from "path";

const { ipcMain } = require("electron");

const IPC = require("@achrinza/node-ipc").default;

logInfo("Application starting");

const lock = app.requestSingleInstanceLock();
if (!lock) {
    app.quit();
}

// Create a function to handle the authentication window
function openAuthenticationWindow() {
    additionalWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            sandbox: false,
            preload: path.join(__dirname, "../../source/main/preload.js") // use a preload script
        }
    });

    logInfo("Launching Tide Authentication");

    // Load content into the authentication window
    additionalWindow.loadFile("./source/main/authwindow.html");

    // Handle window closed event
    additionalWindow.on("closed", (event) => {
        // Proceed with the main window after the authentication window is closed
        openMainWindow();
    });

    // Handle window ready-to-show event
    additionalWindow.once("ready-to-show", (event) => {
        // Show the window once it's ready
        additionalWindow.show();
    });
    additionalWindow.setOpacity(0);
}

// app.on("window-all-closed", () => {
//   if (process.platform !== PLATFORM_MACOS) {
//       app.quit();
//   }
// });

app.on("window-all-closed", (event: Event) => {
    event.preventDefault();
});

app.on("activate", () => {
    openMainWindow();
});

// **
// ** Encryption and Decryption using Tide
// **

IPC.config.id = "cryptoClient";
IPC.config.retry = 1500;
IPC.config.silent = true;
IPC.connectTo("cryptoServer", () => {
    IPC.of.cryptoServer.on("message", (data) => {
        console.log("Received data - frontend", data);
    });
    IPC.of.cryptoServer.on("encrypt", (data) => {
        console.log("Received data in frontend for encrypting", data);
        encryptWithTide(data);
    });
    IPC.of.cryptoServer.on("decrypt", (data) => {
        console.log("Received data in frontend for decrypting", data);
        decryptWithTide(data);
    });
});

function encryptWithTide(data) {
    openCryptoWindow(data);
    IPC.of.cryptoServer.emit("encrypt", data, " Encrypted!");
}

function decryptWithTide(data) {
    openCryptoWindow(data);
    IPC.of.cryptoServer.emit("decrypt", data, " Decrypted!");
}

let additionalWindow: BrowserWindow | null;

async function openCryptoWindow(data: any) {
    additionalWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: path.join(__dirname + "../../source/main/cryptoPreload.js")
        }
        // Add other window options as needed
    });

    // Load content into the authentication window
    await additionalWindow.loadFile("./source/main/crypto.html");
    additionalWindow.webContents.insertText(data);
    // additionalWindow.webContents.insertCSS('input {display:none;}');

    // // Handle window closed event
    // additionalWindow.on("closed", () => {
    //     additionalWindow = null;
    //     // Proceed with the main window after the authentication window is closed
    //     openMainWindow();
    // });

    // Handle window ready-to-show event
    additionalWindow.once("ready-to-show", () => {
        // Show the window once it's ready
        additionalWindow.show();
    });
}

// **
// ** App protocol handling
// **

app.on("second-instance", async (event, args) => {
    await openMainWindow();
    // Protocol URL for Linux/Windows
    const protocolURL = args.find((arg) => arg.startsWith(BUTTERCUP_PROTOCOL));
    if (protocolURL) {
        handleProtocolCall(protocolURL);
    }
});
app.on("open-url", (e, url) => {
    // Protocol URL for MacOS
    if (url.startsWith(BUTTERCUP_PROTOCOL)) {
        handleProtocolCall(url);
    }
});

// **
// ** Boot
// **

app.whenReady()
    .then(() => {
        logInfo("Application ready");
        initialiseElectronRemote();
    })
    .then(() => initialise())
    .then(() => {
        const protocol = BUTTERCUP_PROTOCOL.replace("://", "");
        if (!app.isDefaultProtocolClient(protocol)) {
            logInfo(`Registering protocol: ${protocol}`);
            const protoReg = app.setAsDefaultProtocolClient(protocol);
            if (!protoReg) {
                logErr(`Failed registering protocol: ${protocol}`);
            }
        } else {
            logInfo(`Protocol already registered: ${protocol}`);
        }
    })
    .then(async () => {
        const hideInTray = await getStartInBackground();
        if (!shouldShowMainWindow() || hideInTray) {
            logInfo("Opening initial window disabled by CL or preferences");
            return;
        }

        // Create and show the authentication window
        openAuthenticationWindow();
    })
    .catch((err) => {
        logErr(err);
        app.quit();
    });

// ...
