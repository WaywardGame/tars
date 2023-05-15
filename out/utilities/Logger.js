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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "utilities/Log", "utilities/Decorators"], function (require, exports, Log_1, Decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LoggerUtilities = exports.logSourceName = void 0;
    exports.logSourceName = "TARS";
    class LoggerUtilities {
        constructor(tarsInstanceName) {
            this.tarsInstanceName = tarsInstanceName;
            this.reloadLogSources();
            this.log = this.createLog();
        }
        reloadLogSources() {
            this.logSources = ["MOD", exports.logSourceName, this.tarsInstanceName()];
        }
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
            const sources = [...this.logSources, ...name];
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
        Decorators_1.Bound
    ], LoggerUtilities.prototype, "preConsoleCallback", null);
    exports.LoggerUtilities = LoggerUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9Mb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7Ozs7Ozs7OztJQU1VLFFBQUEsYUFBYSxHQUFHLE1BQU0sQ0FBQztJQUVwQyxNQUFhLGVBQWU7UUFTM0IsWUFBNkIsZ0JBQThCO1lBQTlCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBYztZQUMxRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRU0sZ0JBQWdCO1lBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUscUJBQWEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFHTSxrQkFBa0I7WUFDeEIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUVNLFlBQVksQ0FBQyxTQUE2QixFQUFFLElBQVc7WUFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO2FBQ3pCO1lBRUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0scUJBQXFCO1lBQzNCLElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO1FBQ2pDLENBQUM7UUFFTSxxQkFBcUI7WUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3pCLE9BQU87YUFDUDtZQUVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDN0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUM7WUFFaEMsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUU7Z0JBQy9CLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxRQUFRLEVBQUU7b0JBQzVDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUV4QztxQkFBTTtvQkFDTixNQUFNLE1BQU0sR0FBRyxpQkFBVyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDNUQsTUFBTSxJQUFJLEdBQUksT0FBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN0QyxJQUFJLElBQUksRUFBRTt3QkFDVCxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3RCO2lCQUNEO2FBQ0Q7UUFDRixDQUFDO1FBRU0sU0FBUyxDQUFDLEdBQUcsSUFBYztZQUNqQyxNQUFNLEdBQUcsR0FBRyxJQUFJLGFBQUcsRUFBRSxDQUFDO1lBRXRCLE1BQU0sT0FBTyxHQUE4QixDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBRXpFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO2dCQUM3QixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDN0IsYUFBRyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDL0IsQ0FBQyxDQUFDO1lBRUYsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUM3QixhQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQUM7WUFFRixHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQzdCLGFBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ2hDLENBQUMsQ0FBQztZQUVGLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFO2dCQUM5QixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDN0IsYUFBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDO1lBRUYsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBVyxFQUFFLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUM3QixhQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUM7WUFFRixPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7S0FFRDtJQXZFTztRQUROLGtCQUFLOzZEQUdMO0lBckJGLDBDQTBGQyJ9