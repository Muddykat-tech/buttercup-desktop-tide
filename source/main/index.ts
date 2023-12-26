import { app, BrowserWindow, ipcMain, ipcRenderer } from "electron";
import { initialize as initialiseElectronRemote } from "@electron/remote/main";
import "./ipc";
import { initialise } from "./services/init";
import { openMainWindow } from "./services/windows";
import { handleProtocolCall } from "./services/protocol";
import { shouldShowMainWindow } from "./services/arguments";
import { logErr, logInfo } from "./library/log";
import { BUTTERCUP_PROTOCOL, PLATFORM_MACOS } from "./symbols";
import { getStartInBackground } from "./services/config";
import { tideJWT } from "./services/tokenValidation";
import path from "path";

let authenticationWindow: BrowserWindow | null;
import ipc from "@achrinza/node-ipc";
import { isArray } from "util";

// IPC Heimdall Events for encryption/decryption
ipc.config.id = 'heimdallserver';
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.config.port = 8001;

// Create an IPC server
ipc.serve(() => {
    ipc.server.on('start', () => {
        console.log('Heimdall front-end server started');
        // Listen for messages from the main process
        ipc.server.on('decrypt', async (data, socket) => {
            try {
                // Perform encryption or any necessary processing
                console.log('Attempting to decrypt sent data', data);
                let jsonData = { id: 'decrypt', data: data };

                let response = await handleCoreDataParse(JSON.stringify(jsonData));

                // Ensure the response is in the expected format before emitting
                // Emitting the 'encrypt-response' event to the specific socket
                if (socket) {
                    console.log("Sending Decrypted Data to crypto.ts");
                    console.log("Sending response: ", response);
                    ipc.server.broadcast('decrypt-response', response);
                } else {
                    console.error('Socket is not available.');
                }
            } catch (error) {
                console.error('Error occurred during decryption:', error);
                // Handle or log the error appropriately
            }
        });

        ipc.server.on('encrypt', async (data, socket) => {
            try {
                // Perform encryption or any necessary processing
                console.log('Attempting to encrypt sent data', data);
                let jsonData = { id: 'encrypt', data: data };
                let response = await handleCoreDataParse(JSON.stringify(jsonData));

                // Ensure the response is in the expected format before emitting
                // Emitting the 'encrypt-response' event to the specific socket
                if (socket) {
                    console.log("Sending Encrypted Data to crypto.ts");
                    ipc.server.broadcast('encrypt-response', response);
                    
                } else {
                    console.error('Socket is not available.');
                }
            } catch (error) {
                console.error('Error occurred during encryption:', error);
                // Handle or log the error appropriately
            }
        });
    });
});
// Start listening on a specified path or default path
ipc.server.start();

logInfo("Application starting");

const lock = app.requestSingleInstanceLock();
if (!lock) {
    app.quit();
}

// Create a function to handle the authentication window
function openAuthenticationWindow() {
    authenticationWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: path.join(__dirname, "../../source/main/preload.js") // use a preload script
        }
    });

    logInfo("Launching Tide Authentication");

    // Load content into the authentication window
    authenticationWindow.loadFile("./source/main/authwindow.html");

    // Handle window closed event
    authenticationWindow.on("closed", (event) => {
        // Proceed with the main window after the authentication window is closed
        openMainWindow();
    });

    // Handle window ready-to-show event
    authenticationWindow.once("ready-to-show", (event) => {
        // Show the window once it's ready
        authenticationWindow.show();
    });
    authenticationWindow.setOpacity(0);
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

async function handleCoreDataParse(jsonData) {

    return new Promise((resolve, reject) => {
        try {
            let data = JSON.parse(jsonData);
            let identifier = data.id;

            switch (identifier) {
                case "encrypt":
                    encryptWithTide(data)
                        .then((encryptedData) => {
                            resolve(encryptedData);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                    break;

                case "decrypt":
                    decryptWithTide(data)
                        .then((decryptedData) => {
                            resolve(decryptedData);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                    break;

                default:
                    reject("Invalid identifier");
            }
        } catch (error) {
            reject(error);
        }
    });
}

interface DataItem {
    [key: string]: number;
}

function convertToAsciiString(data: unknown): string {
    if (Array.isArray(data)) {
        const dataArray = data as DataItem[];
        let asciiString = '';
        dataArray.forEach(item => {
            Object.values(item).forEach(value => {
                asciiString += String.fromCharCode(value);
            });
        });
        return asciiString;
    }
    return ''; // Handle other cases where data is not in the expected format
}

function convertToUint8Array(asciiString: string): Uint8Array {
    const numericArray: number[] = [];

    for (let i = 0; i < asciiString.length; i++) {
        const charCode = asciiString.charCodeAt(i);
        numericArray.push(charCode);
    }

    return new Uint8Array(numericArray);
}


async function encryptWithTide(data): Promise<String> {
    return new Promise((resolve, reject) => {
        openCryptoWindow(data)
            .then((encryptedData) => {
                console.log("Encrypted Data Got: ", encryptedData);
                let encryptionText = convertToAsciiString(encryptedData);
                console.log("Managed to acquire encrypted data: ", encryptionText);

                resolve(encryptionText); // Resolve with the encrypted data
            })
            .catch((error) => {
                reject(error); // Reject if there's an error in encryption
            });
    });
}
async function decryptWithTide(data): Promise<string> {
    
    let cipherText = data.data;
    console.log("Data to decrypt: ", cipherText);
    let uint8Array = convertToUint8Array(cipherText);
    let serializedData = JSON.stringify(Array.from(uint8Array));
    data.data = serializedData;
    console.log("Converted to format Heimdall needs: ", serializedData);

    return new Promise((resolve, reject) => {
        openCryptoWindow(data)
            .then((decryptedData) => {
                decryptedData = decryptedData;
                console.log("Recieved Resonse from decryption:", decryptedData);
                resolve(decryptedData); // Resolve with the decrypted data
            })
            .catch((error) => {
                reject(error); // Reject if there's an error in decryption
            });
    });
}

let cryptoWindow: BrowserWindow | null;

async function openCryptoWindow(jsonData: any): Promise<string> {
    cryptoWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            preload: path.join(__dirname, "../../source/main/cryptoPreload.js")
        }
    });

    // Load content into the crypto window
    await cryptoWindow.loadFile("./source/main/crypto.html");

    jsonData.token = tideJWT;

    await cryptoWindow.webContents.send("fromMain", JSON.stringify(jsonData));

    // Handle window ready-to-show event
    cryptoWindow.once("ready-to-show", () => {
        // Show the window once it's ready
        cryptoWindow.show();
    });

    //cryptoWindow.setOpacity(0); 
    return new Promise(async (resolve, reject) => { 
        
        console.log('Waiting for response')
        let response = 'waiting';

        ipcMain.once("toMain", async (event, jsonData) => {
            let data = JSON.parse(jsonData);
            console.log("Got Data from CryptoPage sending to core!", data);
            switch (data.id) {
                case "encrypt":
                    response = JSON.parse(data.data);
                    break;
                case "decrypt":
                    response = JSON.parse(data.data);
                    console.log("Pass Check 3")
                    break;
            }
            resolve(response);
        });
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
