var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "utilities/Log"], function (require, exports, Log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.log = exports.logSourceName = exports.loggerUtilities = void 0;
    class LoggerUtilities {
        preConsoleCallback() {
            this.processQueuedMessages();
        }
        queueMessage(logOrType, args) {
            if (!this.queuedMessages) {
                this.queuedMessages = [];
            }
            this.queuedMessages.push({ logOrType, args });
        }
        discardQueuedMessages() {
            this.queuedMessages = undefined;
        }
        processQueuedMessages() {
            if (!this.queuedMessages) {
                return;
            }
            const messages = this.queuedMessages.slice();
            this.queuedMessages = undefined;
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
        createLog(...name) {
            const log = new Log_1.default();
            const sources = ["MOD", exports.logSourceName];
            if (name.length > 0) {
                sources.push(...name);
            }
            log.info = (...args) => {
                this.processQueuedMessages();
                Log_1.default.info(...sources)(...args);
            };
            log.warn = (...args) => {
                this.processQueuedMessages();
                Log_1.default.warn(...sources)(...args);
            };
            log.error = (...args) => {
                this.processQueuedMessages();
                Log_1.default.error(...sources)(...args);
            };
            log.trace = (...args) => {
                this.processQueuedMessages();
                Log_1.default.trace(...sources)(...args);
            };
            log.debug = (...args) => {
                this.processQueuedMessages();
                Log_1.default.debug(...sources)(...args);
            };
            return log;
        }
    }
    __decorate([
        Bound
    ], LoggerUtilities.prototype, "preConsoleCallback", null);
    exports.loggerUtilities = new LoggerUtilities();
    exports.logSourceName = "TARS";
    exports.log = exports.loggerUtilities.createLog();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9Mb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUVBLE1BQU0sZUFBZTtRQU9iLGtCQUFrQjtZQUN4QixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUM5QixDQUFDO1FBRU0sWUFBWSxDQUFDLFNBQTZCLEVBQUUsSUFBVztZQUM3RCxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDekIsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7YUFDekI7WUFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTSxxQkFBcUI7WUFDM0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUM7UUFDakMsQ0FBQztRQUVNLHFCQUFxQjtZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDekIsT0FBTzthQUNQO1lBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztZQUVoQyxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtnQkFDL0IsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtvQkFDNUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBRXhDO3FCQUFNO29CQUNOLE1BQU0sTUFBTSxHQUFHLGlCQUFXLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUM1RCxNQUFNLElBQUksR0FBSSxPQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ3RDLElBQUksSUFBSSxFQUFFO3dCQUNULElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDdEI7aUJBQ0Q7YUFDRDtRQUNGLENBQUM7UUFFTSxTQUFTLENBQUMsR0FBRyxJQUFjO1lBQ2pDLE1BQU0sR0FBRyxHQUFHLElBQUksYUFBRyxFQUFFLENBQUM7WUFFdEIsTUFBTSxPQUFPLEdBQThCLENBQUMsS0FBSyxFQUFFLHFCQUFhLENBQUMsQ0FBQztZQUVsRSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7YUFDdEI7WUFFRCxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQzdCLGFBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQy9CLENBQUMsQ0FBQztZQUVGLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO2dCQUM3QixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDN0IsYUFBRyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDO1lBRUYsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUM3QixhQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUM7WUFFRixHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQzdCLGFBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBQztZQUVGLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO2dCQUM5QixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDN0IsYUFBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDO1lBRUYsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDO0tBRUQ7SUEzRUE7UUFEQyxLQUFLOzZEQUdMO0lBMkVXLFFBQUEsZUFBZSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7SUFFeEMsUUFBQSxhQUFhLEdBQUcsTUFBTSxDQUFDO0lBRXZCLFFBQUEsR0FBRyxHQUFHLHVCQUFlLENBQUMsU0FBUyxFQUFFLENBQUMifQ==