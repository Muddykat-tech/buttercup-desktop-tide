import { EventEmitter } from "events";
import { updateAppMenu } from "../actions/appMenu";
import { BrowserWindow, ipcMain } from "electron";

const tokenEvents = new EventEmitter();
let tideJWT = "";

async function updateValue(newToken: string): Promise<void> {
    await validateAndUpdate(newToken);
    // Emit an event to notify the token update
    tokenEvents.emit("updateToken", newToken);
}

async function validateAndUpdate(newToken: string): Promise<boolean> {
    const isValid = await validateToken(newToken);

    if (!isValid) {
        tokenEvents.emit("invalidJWT", "Invalid UUID");
        return false;
    }

    updateAppMenu();

    tideJWT = newToken; // Update the tideJWT
    tokenEvents.emit("updateToken", tideJWT);

    return true;
}

async function validateToken(token: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        setTimeout(() => {
            resolve(jwtValid(token));
        }, 1000);
    });
}

tokenEvents.on("updateToken", (newToken) => {
    //const window = BrowserWindow.getFocusedWindow();
    //window.webContents.send("notify-success", "Tide JWT Valid");
    ipcMain.emit("jwt-update", newToken);
});

tokenEvents.on("invalidJWT", (errorMessage) => {
    console.error(`Invalid UUID: ${errorMessage}`);
    tideJWT = "";

    const window = BrowserWindow.getFocusedWindow();
    window.webContents.send("notify-error", "Tide UUID Invalid");
});

function jwtValid(uid: string) {
    const isUUID = uid.match("^[0-9a-fA-F]{64}$");

    if (isUUID) {
        tokenEvents.emit("updateToken", tideJWT);
        return true;
    }

    if (uid.length > 0) tokenEvents.emit("invalidJWT", "UUID Failed to Authenticate: " + uid);

    return false;
}

export { tokenEvents, validateAndUpdate, validateToken, tideJWT, updateValue }; // Export tideJWT and functions
