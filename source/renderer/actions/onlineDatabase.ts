import { Layerr } from "layerr";
import { logInfo } from "../library/log";
import { checkConnectiontoDB } from "../../main/services/onlineDB";

export async function testOnlineDB(url: string, token?: string): Promise<void> {
    if (await checkConnectiontoDB(url)){
        logInfo("Connection to Online DB Successful");
    } else {
        throw new Layerr("Failed connecting to Online Database");
    }
}
