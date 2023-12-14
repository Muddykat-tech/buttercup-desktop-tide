import { EventEmitter } from 'events';
import { openMainWindow } from './windows';
import { updateAppMenu } from '../actions/appMenu';
import { BrowserWindow } from 'electron';

const tokenEvents = new EventEmitter();
let tideJWT = "";

async function updateValue(newToken: string): Promise<void> {
    await validateAndUpdate(newToken);
    // Emit an event to notify the token update
    tokenEvents.emit('updateToken', newToken);
}

async function validateAndUpdate(newToken: string): Promise<boolean> {
    const isValid = await validateToken(newToken);
    
    if (!isValid) {
        tokenEvents.emit('invalidJWT', 'Invalid Token');
        return false;
    }

    updateAppMenu();

    tideJWT = newToken; // Update the tideJWT
    tokenEvents.emit('updateToken', tideJWT);

    return true;
}

async function validateToken(token: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        setTimeout(() => {
            resolve(jwtValid(token));
        }, 1000);
    });
}

tokenEvents.on('updateToken', (newToken) => {
    console.log(`Token updated: ${newToken}`);

    const window = BrowserWindow.getFocusedWindow();
    window.webContents.send("notify-success", "Tide JWT Valid");
});

tokenEvents.on('invalidJWT', (errorMessage) => {
    console.error(`Invalid token: ${errorMessage}`);
    tideJWT = "";

    const window = BrowserWindow.getFocusedWindow();
    window.webContents.send("notify-error", "Tide JWT Invalid");
});

function jwtValid(jwt: string) {
    const decoded = jwt.split(".")
        .map(a => a.replace(/-/g, '+').replace(/_/g, '/') + "==".slice(0, (3 - a.length % 4) % 3));

    const header = atob(decoded[0]) // header 
    const payload = atob(decoded[1]) // payload

    if (decoded.length != 3) return false;

    try {
        let test_data = JSON.parse(header)
        if (test_data.typ != "JWT" || test_data.alg != "EdDSA") return false;
        test_data = JSON.parse(payload)
        if (test_data.uid == null || test_data.exp == null) return false;
    } catch {
        tokenEvents.emit('invalidJWT', 'Invalid Token');
        return false;
    }
    tokenEvents.emit('updateToken', tideJWT);
    return true;
}

export { tokenEvents, validateAndUpdate, validateToken, tideJWT, updateValue }; // Export tideJWT and functions
