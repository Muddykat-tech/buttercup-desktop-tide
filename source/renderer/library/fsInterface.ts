import {
    DropboxInterface,
    FileSystemInterface,
    GoogleDriveInterface,
    WebDAVInterface,
    DBInterface,
    Identifier
} from "@buttercup/file-interface";
import { GoogleDriveClient } from "@buttercup/googledrive-client";
import { DropboxClient } from "@buttercup/dropbox-client";
import { createClient as createWebdavClient } from "webdav";
import { SourceType } from "../types";
import { ButtercupServerClient } from "buttercup-server-client";
import { ipcRenderer } from "electron";

export interface FSInstanceSettings {
    endpoint?: string;
    password?: string;
    token?: string;
    username?: string;
}

export function getFSInstance(type: SourceType, settings: FSInstanceSettings): FileSystemInterface {
    switch (type) {
        case SourceType.Dropbox:
            return new DropboxInterface({
                dropboxClient: new DropboxClient(settings.token as string)
            });
        case SourceType.WebDAV:
            return new WebDAVInterface({
                webdavClient: createWebdavClient(settings.endpoint as string, {
                    username: settings.username,
                    password: settings.password
                })
            });
        case SourceType.GoogleDrive: {
            return new GoogleDriveInterface({
                googleDriveClient: new GoogleDriveClient(settings.token as string)
            });
        }
        case SourceType.DB:
            console.log(
                "Source Type WIP file 'fsInterface.ts' requires a new DatabaseClient file to be created in the Core Application."
            );
            console.log("Setting endpoint as :", settings.endpoint);

            return new DBInterface({
                dbURL: settings.endpoint as string,
                uuid: settings.token as string,
                buttercupServerClient: new ButtercupServerClient(
                    {
                        identifier: settings.endpoint as Identifier,
                        name: settings.endpoint as string
                    },
                    settings.token as string
                )
            });
        default:
            throw new Error(`Unsupported interface: ${type}`);
    }
}
