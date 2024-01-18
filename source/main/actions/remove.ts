import { VaultSourceID } from "buttercup-heimdall";
import { lockSource, removeSource } from "../services/buttercup";
import { logInfo } from "../library/log";
import { removeVaultSettings } from "../services/config";

export async function removeSourceWithID(sourceID: VaultSourceID) {
    await lockSource(sourceID);
    await removeSource(sourceID);
    await removeVaultSettings(sourceID);
    logInfo(`Removed source: ${sourceID}`);
}
