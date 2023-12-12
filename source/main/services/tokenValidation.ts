import { EventEmitter } from 'events';
import { Heimdall } from 'heimdall-tide';

const tokenEvents = new EventEmitter();

let tideJWT: string = ''; // Initialize the tideJWT as an empty string

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
            resolve(token === "Test Token"); //TODO impement actual validation logic
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



export { tokenEvents, validateAndUpdate, validateToken, tideJWT, updateValue }; // Export tideJWT and functions
