define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let lastMessage;
    let modLog;
    function log(message, ...args) {
        if (lastMessage !== message) {
            lastMessage = message;
            args.unshift(message);
            modLog.info.apply(modLog, args);
        }
    }
    exports.log = log;
    function setLogger(logger) {
        modLog = logger;
    }
    exports.setLogger = setLogger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9Mb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBRUEsSUFBSSxXQUFtQixDQUFDO0lBRXhCLElBQUksTUFBVyxDQUFDO0lBRWhCLGFBQW9CLE9BQWUsRUFBRSxHQUFHLElBQVc7UUFDbEQsSUFBSSxXQUFXLEtBQUssT0FBTyxFQUFFO1lBQzVCLFdBQVcsR0FBRyxPQUFPLENBQUM7WUFFdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV0QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDaEM7SUFDRixDQUFDO0lBUkQsa0JBUUM7SUFFRCxtQkFBMEIsTUFBVztRQUNwQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ2pCLENBQUM7SUFGRCw4QkFFQyJ9