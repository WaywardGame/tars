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
define(["require", "exports", "@wayward/utilities/Log", "@wayward/utilities/Decorators"], function (require, exports, Log_1, Decorators_1) {
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
    exports.LoggerUtilities = LoggerUtilities;
    __decorate([
        Decorators_1.Bound
    ], LoggerUtilities.prototype, "preConsoleCallback", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyVXRpbGl0aWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9Mb2dnZXJVdGlsaXRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7Ozs7Ozs7OztJQU1VLFFBQUEsYUFBYSxHQUFHLE1BQU0sQ0FBQztJQUVwQyxNQUFhLGVBQWU7UUFTM0IsWUFBNkIsZ0JBQThCO1lBQTlCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBYztZQUMxRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRU0sZ0JBQWdCO1lBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUscUJBQWEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFHTSxrQkFBa0I7WUFDeEIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUVNLFlBQVksQ0FBQyxTQUE2QixFQUFFLElBQVc7WUFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7WUFDMUIsQ0FBQztZQUVELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLHFCQUFxQjtZQUMzQixJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztRQUNqQyxDQUFDO1FBRU0scUJBQXFCO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQzFCLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUs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