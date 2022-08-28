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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL2NvbXBvbmVudHMvVGFyc1BhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQU9BLE1BQThCLFNBQVUsU0FBUSx3QkFBYztRQVExRCxZQUErQixZQUFrQjtZQUM3QyxLQUFLLEVBQUUsQ0FBQztZQURtQixpQkFBWSxHQUFaLFlBQVksQ0FBTTtRQUVqRCxDQUFDO1FBR1MsV0FBVztZQUNqQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLENBQUM7S0FDSjtJQUpHO1FBREMsSUFBQSw4QkFBZSxFQUFDLFNBQVMsRUFBRSxVQUFVLENBQUM7Z0RBSXRDO0lBaEJMLDRCQWlCQyJ9