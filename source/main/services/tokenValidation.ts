import { EventEmitter } from 'events';

const tokenEvents = new EventEmitter();
let tideJWT = "";

async function updateValue(newToken: string): Promise<void> {
    await validateAndUpdate(newToken);
    // Emit an event to notify the token update
    tokenEvents.emit('updateToken', newToken);
}

async function validateAndUpdate(newToken: string): Promise<void> {
    const isValid = await validateToken(newToken);
    
    if (!isValid) {
        tokenEvents.emit('invalidJWT', 'Invalid Token');
        return;
    }

    tideJWT = newToken; // Update the tideJWT
    tokenEvents.emit('updateToken', tideJWT);
}

async function validateToken(token: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        setTimeout(() => {
            resolve(jwtValid(token)); //TODO impement actual validation logic
        }, 1000);
    });
}

tokenEvents.on('updateToken', (newToken) => {
    console.log(`Token updated: ${newToken}`);
});

tokenEvents.on('invalidJWT', (errorMessage) => {
    console.error(`Invalid token: ${errorMessage}`);
    tideJWT = "";
});

function jwtValid(jwt) {
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
        return false;
    }
    return true;
}

export { tokenEvents, validateAndUpdate, validateToken, tideJWT, updateValue }; // Export tideJWT and functions
