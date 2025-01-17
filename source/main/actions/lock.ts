import { VaultSourceID } from "buttercup-heimdall";
import { lockSource } from "../services/buttercup";
import { logInfo } from "../library/log";

export async function lockSourceWithID(sourceID: VaultSourceID) {
    await lockSource(sourceID);
    logInfo(`Locked source: ${sourceID}`);
}
