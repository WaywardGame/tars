/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
import type { ILog } from "utilities/Log";
import Log, { LogLineType } from "utilities/Log";
export declare const logSourceName = "TARS";
export declare class LoggerUtilities {
    private readonly tarsInstanceName;
    private queuedMessages;
    logSources: string[];
    readonly log: Log;
    constructor(tarsInstanceName: () => string);
    reloadLogSources(): void;
    preConsoleCallback(): void;
    queueMessage(logOrType: ILog | LogLineType, args: any[]): void;
    discardQueuedMessages(): void;
    processQueuedMessages(): void;
    createLog(...name: string[]): Log;
}
