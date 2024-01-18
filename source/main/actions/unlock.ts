import { VaultSourceID } from "buttercup-heimdall";
import createPerfTimer from "execution-time";
import { unlockSource } from "../services/buttercup";
import { logInfo } from "../library/log";
import { ipcRenderer } from "electron";
import { validateToken, tideJWT } from "../services/tokenValidation";

export async function unlockSourceWithID(sourceID: VaultSourceID, password: string | Object) {
    const timer = createPerfTimer();
    timer.start();

    await unlockSource(sourceID, password);
    const results = timer.stop();
    logInfo(`Unlocked source: ${sourceID} (took: ${results.time} ms)`);
}
