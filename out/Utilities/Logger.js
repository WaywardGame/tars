define(["require", "exports", "utilities/Log"], function (require, exports, Log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createLog = exports.processQueuedMessages = exports.discardQueuedMessages = exports.queueMessage = exports.preConsoleCallback = exports.log = void 0;
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
        const sources = ["MOD", "TARS"];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9Mb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUVXLFFBQUEsR0FBRyxHQUFHLFNBQVMsRUFBRSxDQUFDO0lBRTdCLElBQUksY0FHVSxDQUFDO0lBRWYsU0FBZ0Isa0JBQWtCO1FBQ2pDLHFCQUFxQixFQUFFLENBQUM7SUFDekIsQ0FBQztJQUZELGdEQUVDO0lBRUQsU0FBZ0IsWUFBWSxDQUFDLFNBQTZCLEVBQUUsSUFBVztRQUN0RSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3BCLGNBQWMsR0FBRyxFQUFFLENBQUM7U0FDcEI7UUFFRCxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQU5ELG9DQU1DO0lBRUQsU0FBZ0IscUJBQXFCO1FBQ3BDLGNBQWMsR0FBRyxTQUFTLENBQUM7SUFDNUIsQ0FBQztJQUZELHNEQUVDO0lBRUQsU0FBZ0IscUJBQXFCO1FBQ3BDLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDcEIsT0FBTztTQUNQO1FBRUQsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hDLGNBQWMsR0FBRyxTQUFTLENBQUM7UUFFM0IsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUU7WUFDL0IsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtnQkFDNUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFFeEM7aUJBQU07Z0JBQ04sTUFBTSxNQUFNLEdBQUcsaUJBQVcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzVELE1BQU0sSUFBSSxHQUFJLE9BQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxJQUFJLEVBQUU7b0JBQ1QsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN0QjthQUNEO1NBQ0Q7SUFDRixDQUFDO0lBcEJELHNEQW9CQztJQUVELFNBQWdCLFNBQVMsQ0FBQyxHQUFHLElBQWM7UUFDMUMsTUFBTSxHQUFHLEdBQUcsSUFBSSxhQUFHLEVBQUUsQ0FBQztRQUV0QixNQUFNLE9BQU8sR0FBOEIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFM0QsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDdEI7UUFFRCxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRTtZQUM3QixxQkFBcUIsRUFBRSxDQUFDO1lBQ3hCLGFBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUMsQ0FBQztRQUVGLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO1lBQzdCLHFCQUFxQixFQUFFLENBQUM7WUFDeEIsYUFBRyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDO1FBRUYsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUU7WUFDOUIscUJBQXFCLEVBQUUsQ0FBQztZQUN4QixhQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUM7UUFFRixHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRTtZQUM5QixxQkFBcUIsRUFBRSxDQUFDO1lBQ3hCLGFBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQztRQUVGLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO1lBQzlCLHFCQUFxQixFQUFFLENBQUM7WUFDeEIsYUFBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDO1FBRUYsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0lBbkNELDhCQW1DQyJ9