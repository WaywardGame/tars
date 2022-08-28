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
