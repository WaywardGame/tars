define(["require", "exports", "utilities/Log"], function (require, exports, Log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9Mb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBRVcsUUFBQSxHQUFHLEdBQUcsU0FBUyxFQUFFLENBQUM7SUFFN0IsSUFBSSxXQUFtRCxDQUFDO0lBRXhELFNBQWdCLGdCQUFnQixDQUFDLEdBQVMsRUFBRSxHQUFHLElBQVc7UUFDekQsV0FBVyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFGRCw0Q0FFQztJQUVELFNBQWdCLGtCQUFrQjtRQUNqQyxXQUFXLEdBQUcsU0FBUyxDQUFDO0lBQ3pCLENBQUM7SUFGRCxnREFFQztJQUVELFNBQWdCLGtCQUFrQjtRQUNqQyxJQUFJLFdBQVcsRUFBRTtZQUNoQixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUM7WUFDNUIsV0FBVyxHQUFHLFNBQVMsQ0FBQztZQUV4QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNsQztJQUNGLENBQUM7SUFQRCxnREFPQztJQUVELFNBQWdCLFNBQVMsQ0FBQyxHQUFHLElBQWM7UUFDMUMsTUFBTSxHQUFHLEdBQUcsSUFBSSxhQUFHLEVBQUUsQ0FBQztRQUV0QixNQUFNLE9BQU8sR0FBOEIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFM0QsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDdEI7UUFFRCxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRTtZQUM3QixrQkFBa0IsRUFBRSxDQUFDO1lBQ3JCLGFBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUMsQ0FBQztRQUVGLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO1lBQzdCLGtCQUFrQixFQUFFLENBQUM7WUFDckIsYUFBRyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDO1FBRUYsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUU7WUFDOUIsa0JBQWtCLEVBQUUsQ0FBQztZQUNyQixhQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUM7UUFFRixHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRTtZQUM5QixrQkFBa0IsRUFBRSxDQUFDO1lBQ3JCLGFBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQztRQUVGLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO1lBQzlCLGtCQUFrQixFQUFFLENBQUM7WUFDckIsYUFBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDO1FBRUYsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0lBbkNELDhCQW1DQyJ9