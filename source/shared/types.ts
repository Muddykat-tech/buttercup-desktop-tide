import {
    SearchResult as CoreSearchResult,
    VaultFormatID,
    VaultSourceID,
    VaultSourceStatus
} from "buttercup";

export interface AddVaultPayload {
    createNew: boolean;
    datasourceConfig: DatasourceConfig;
    masterPassword: string;
    fileNameOverride?: string;
}

export interface AppEnvironmentFlags {
    portable: boolean;
}

export type DatasourceConfig = { [key: string]: string } & { type: SourceType };

export interface Language {
    name: string;
    slug: string | null;
}

export enum LogLevel {
    Error = "error",
    Info = "info",
    Warning = "warning"
}

export interface Preferences {
    autoClearClipboard: false | number;
    fileHostEnabled: boolean;
    language: null | string;
    lockVaultsAfterTime: false | number;
    lockVaultsOnWindowClose: boolean;
    startWithSession: boolean;
    startInBackground: boolean;
    uiTheme: ThemeSource;
}

export interface SearchResult {
    type: "entry";
    result: CoreSearchResult;
}

export enum SourceType {
    Dropbox = "dropbox",
    File = "file",
    GoogleDrive = "googledrive",
    WebDAV = "webdav",
    DB = "Online Database"
}

export enum ThemeSource {
    System = "system",
    Dark = "dark",
    Light = "light"
}

export interface UpdateProgressInfo {
    bytesPerSecond: number;
    percent: number;
    total: number;
    transferred: number;
}

export interface VaultSettingsLocal {
    biometricForcePasswordCount: string;
    biometricForcePasswordMaxInterval: string;
    biometricLastManualUnlock: number | null;
    biometricUnlockCount: number;
    localBackup: boolean;
    localBackupLocation: null | string;
}

export interface VaultSourceDescription {
    id: VaultSourceID;
    name: string;
    state: VaultSourceStatus;
    type: SourceType;
    order: number;
    format?: VaultFormatID;
}
