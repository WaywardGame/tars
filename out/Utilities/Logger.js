define(["require", "exports", "utilities/Log"], function (require, exports, Log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createLog = exports.processNextMessage = exports.discardNextMessage = exports.queueNextMessage = exports.log = void 0;
    exports.log = createLog();
    let nextMessage;
    function queueNextMessage(log, ...args) {
        nextMessage = { log, args };
    }
    exports.queueNextMessage = queueNextMessage;
    function discardNextMessage() {
        nextMessage = undefined;
    }
    exports.discardNextMessage = discardNextMessage;
    function processNextMessage() {
        if (nextMessage) {
            const message = nextMessage;
            nextMessage = undefined;
            message.log.info(...message.args);
        }
    }
    exports.processNextMessage = processNextMessage;
    function createLog(...name) {
        const log = new Log_1.default();
        const sources = ["MOD", "TARS"];
        if (name.length > 0) {
            sources.push(...name);
        }
        log.info = (...args) => {
            processNextMessage();
            Log_1.default.info(...sources)(...args);
        };
        log.warn = (...args) => {
            processNextMessage();
            Log_1.default.warn(...sources)(...args);
        };
        log.error = (...args) => {
            processNextMessage();
            Log_1.default.error(...sources)(...args);
        };
        log.trace = (...args) => {
            processNextMessage();
            Log_1.default.trace(...sources)(...args);
        };
        log.debug = (...args) => {
            processNextMessage();
            Log_1.default.debug(...sources)(...args);
        };
        return log;
    }
    exports.createLog = createLog;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9Mb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUVXLFFBQUEsR0FBRyxHQUFHLFNBQVMsRUFBRSxDQUFDO0lBRTdCLElBQUksV0FBbUQsQ0FBQztJQUV4RCxTQUFnQixnQkFBZ0IsQ0FBQyxHQUFTLEVBQUUsR0FBRyxJQUFXO1FBQ3pELFdBQVcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRkQsNENBRUM7SUFFRCxTQUFnQixrQkFBa0I7UUFDakMsV0FBVyxHQUFHLFNBQVMsQ0FBQztJQUN6QixDQUFDO0lBRkQsZ0RBRUM7SUFFRCxTQUFnQixrQkFBa0I7UUFDakMsSUFBSSxXQUFXLEVBQUU7WUFDaEIsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDO1lBQzVCLFdBQVcsR0FBRyxTQUFTLENBQUM7WUFFeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbEM7SUFDRixDQUFDO0lBUEQsZ0RBT0M7SUFFRCxTQUFnQixTQUFTLENBQUMsR0FBRyxJQUFjO1FBQzFDLE1BQU0sR0FBRyxHQUFHLElBQUksYUFBRyxFQUFFLENBQUM7UUFFdEIsTUFBTSxPQUFPLEdBQThCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTNELElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ3RCO1FBRUQsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUU7WUFDN0Isa0JBQWtCLEVBQUUsQ0FBQztZQUNyQixhQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUM7UUFFRixHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRTtZQUM3QixrQkFBa0IsRUFBRSxDQUFDO1lBQ3JCLGFBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUMsQ0FBQztRQUVGLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO1lBQzlCLGtCQUFrQixFQUFFLENBQUM7WUFDckIsYUFBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDO1FBRUYsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUU7WUFDOUIsa0JBQWtCLEVBQUUsQ0FBQztZQUNyQixhQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUM7UUFFRixHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRTtZQUM5QixrQkFBa0IsRUFBRSxDQUFDO1lBQ3JCLGFBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQztRQUVGLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztJQW5DRCw4QkFtQ0MifQ==