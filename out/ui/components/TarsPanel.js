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
define(["require", "exports", "ui/screen/screens/game/component/TabDialogPanel", "event/EventManager"], function (require, exports, TabDialogPanel_1, EventManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TarsPanel extends TabDialogPanel_1.default {
        constructor(tarsInstance) {
            super();
            this.tarsInstance = tarsInstance;
        }
        _onSwitchTo() {
            this.onSwitchTo();
            this.refresh();
        }
    }
    __decorate([
        (0, EventManager_1.OwnEventHandler)(TarsPanel, "switchTo")
    ], TarsPanel.prototype, "_onSwitchTo", null);
    exports.default = TarsPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL2NvbXBvbmVudHMvVGFyc1BhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7Ozs7OztJQVNILE1BQThCLFNBQVUsU0FBUSx3QkFBYztRQVExRCxZQUErQixZQUFrQjtZQUM3QyxLQUFLLEVBQUUsQ0FBQztZQURtQixpQkFBWSxHQUFaLFlBQVksQ0FBTTtRQUVqRCxDQUFDO1FBR1MsV0FBVztZQUNqQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLENBQUM7S0FDSjtJQUphO1FBRFQsSUFBQSw4QkFBZSxFQUFDLFNBQVMsRUFBRSxVQUFVLENBQUM7Z0RBSXRDO0lBaEJMLDRCQWlCQyJ9