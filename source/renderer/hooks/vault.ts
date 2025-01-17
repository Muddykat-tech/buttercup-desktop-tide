import { VaultSourceID } from "buttercup-heimdall";
import { useCallback, useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import { logErr } from "../library/log";
import { showError } from "../services/notifications";
import { VaultSourceDescription } from "../types";

export function useSourceDetails(sourceID: VaultSourceID): [VaultSourceDescription, () => void] {
    const [details, setDetails] = useState<VaultSourceDescription>(null);
    const updateDescription = useCallback(() => {
        ipcRenderer
            .invoke("get-vault-description", sourceID)
            .then((desc: VaultSourceDescription) => {
                setDetails(desc);
            })
            .catch((err) => {
                logErr(err);
                showError(`Failed fetching vault details: ${err.message}`);
            });
    }, [sourceID]);
    useEffect(() => {
        if (!sourceID) {
            setDetails(null);
            return;
        }
        updateDescription();
    }, [sourceID]);
    return [details, updateDescription];
}
