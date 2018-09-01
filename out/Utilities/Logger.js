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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9Mb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBRUEsSUFBSSxXQUFtQixDQUFDO0lBRXhCLElBQUksTUFBVyxDQUFDO0lBRWhCLFNBQWdCLEdBQUcsQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQ2xELElBQUksV0FBVyxLQUFLLE9BQU8sRUFBRTtZQUM1QixXQUFXLEdBQUcsT0FBTyxDQUFDO1lBRXRCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ2hDO0lBQ0YsQ0FBQztJQVJELGtCQVFDO0lBRUQsU0FBZ0IsU0FBUyxDQUFDLE1BQVc7UUFDcEMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUNqQixDQUFDO0lBRkQsOEJBRUMifQ==