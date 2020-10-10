define(["require", "exports", "utilities/Log"], function (require, exports, Log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createLog = exports.processQueuedMessages = exports.discardQueuedMessages = exports.queueMessage = exports.preConsoleCallback = exports.log = exports.logSourceName = void 0;
    exports.logSourceName = "TARS";
    exports.log = createLog();
    let queuedMessages;
    function preConsoleCallback() {
        processQueuedMessages();
    }
    exports.preConsoleCallback = preConsoleCallback;
    function queueMessage(logOrType, args) {
        if (!queuedMessages) {
            queuedMessages = [];
        }
        queuedMessages.push({ logOrType, args });
    }
    exports.queueMessage = queueMessage;
    function discardQueuedMessages() {
        queuedMessages = undefined;
    }
    exports.discardQueuedMessages = discardQueuedMessages;
    function processQueuedMessages() {
        if (!queuedMessages) {
            return;
        }
        const messages = queuedMessages.slice();
        queuedMessages = undefined;
        for (const message of messages) {
            if (typeof (message.logOrType) === "object") {
                message.logOrType.info(...message.args);
            }
            else {
                const method = Log_1.LogLineType[message.logOrType].toLowerCase();
                const func = console[method];
                if (func) {
                    func(...message.args);
                }
            }
        }
    }
    exports.processQueuedMessages = processQueuedMessages;
    function createLog(...name) {
        const log = new Log_1.default();
        const sources = ["MOD", exports.logSourceName];
        if (name.length > 0) {
            sources.push(...name);
        }
        log.info = (...args) => {
            processQueuedMessages();
            Log_1.default.info(...sources)(...args);
        };
        log.warn = (...args) => {
            processQueuedMessages();
            Log_1.default.warn(...sources)(...args);
        };
        log.error = (...args) => {
            processQueuedMessages();
            Log_1.default.error(...sources)(...args);
        };
        log.trace = (...args) => {
            processQueuedMessages();
            Log_1.default.trace(...sources)(...args);
        };
        log.debug = (...args) => {
            processQueuedMessages();
            Log_1.default.debug(...sources)(...args);
        };
        return log;
    }
    exports.createLog = createLog;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9Mb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUVhLFFBQUEsYUFBYSxHQUFHLE1BQU0sQ0FBQztJQUV6QixRQUFBLEdBQUcsR0FBRyxTQUFTLEVBQUUsQ0FBQztJQUU3QixJQUFJLGNBR1UsQ0FBQztJQUVmLFNBQWdCLGtCQUFrQjtRQUNqQyxxQkFBcUIsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFGRCxnREFFQztJQUVELFNBQWdCLFlBQVksQ0FBQyxTQUE2QixFQUFFLElBQVc7UUFDdEUsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNwQixjQUFjLEdBQUcsRUFBRSxDQUFDO1NBQ3BCO1FBRUQsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFORCxvQ0FNQztJQUVELFNBQWdCLHFCQUFxQjtRQUNwQyxjQUFjLEdBQUcsU0FBUyxDQUFDO0lBQzVCLENBQUM7SUFGRCxzREFFQztJQUVELFNBQWdCLHFCQUFxQjtRQUNwQyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3BCLE9BQU87U0FDUDtRQUVELE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QyxjQUFjLEdBQUcsU0FBUyxDQUFDO1FBRTNCLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFO1lBQy9CLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxRQUFRLEVBQUU7Z0JBQzVDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBRXhDO2lCQUFNO2dCQUNOLE1BQU0sTUFBTSxHQUFHLGlCQUFXLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM1RCxNQUFNLElBQUksR0FBSSxPQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3RDLElBQUksSUFBSSxFQUFFO29CQUNULElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDdEI7YUFDRDtTQUNEO0lBQ0YsQ0FBQztJQXBCRCxzREFvQkM7SUFFRCxTQUFnQixTQUFTLENBQUMsR0FBRyxJQUFjO1FBQzFDLE1BQU0sR0FBRyxHQUFHLElBQUksYUFBRyxFQUFFLENBQUM7UUFFdEIsTUFBTSxPQUFPLEdBQThCLENBQUMsS0FBSyxFQUFFLHFCQUFhLENBQUMsQ0FBQztRQUVsRSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUN0QjtRQUVELEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO1lBQzdCLHFCQUFxQixFQUFFLENBQUM7WUFDeEIsYUFBRyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDO1FBRUYsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUU7WUFDN0IscUJBQXFCLEVBQUUsQ0FBQztZQUN4QixhQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUM7UUFFRixHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRTtZQUM5QixxQkFBcUIsRUFBRSxDQUFDO1lBQ3hCLGFBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQztRQUVGLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO1lBQzlCLHFCQUFxQixFQUFFLENBQUM7WUFDeEIsYUFBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDO1FBRUYsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUU7WUFDOUIscUJBQXFCLEVBQUUsQ0FBQztZQUN4QixhQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUM7UUFFRixPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFuQ0QsOEJBbUNDIn0=