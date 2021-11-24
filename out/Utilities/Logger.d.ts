import Log, { ILog, LogLineType } from "utilities/Log";
declare class LoggerUtilities {
    private queuedMessages;
    preConsoleCallback(): void;
    queueMessage(logOrType: ILog | LogLineType, args: any[]): void;
    discardQueuedMessages(): void;
    processQueuedMessages(): void;
    createLog(...name: string[]): Log;
}
export declare const loggerUtilities: LoggerUtilities;
export declare const logSourceName = "TARS";
export declare const log: Log;
export {};
