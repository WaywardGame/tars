var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "ui/screen/screens/game/component/TabDialogPanel", "mod/Mod", "event/EventManager", "../../ITarsMod"], function (require, exports, TabDialogPanel_1, Mod_1, EventManager_1, ITarsMod_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TarsPanel extends TabDialogPanel_1.default {
        _onSwitchTo() {
            this.onSwitchTo();
            this.refresh();
        }
    }
    __decorate([
        Mod_1.default.instance(ITarsMod_1.TARS_ID)
    ], TarsPanel.prototype, "TarsMod", void 0);
    __decorate([
        (0, EventManager_1.OwnEventHandler)(TarsPanel, "switchTo")
    ], TarsPanel.prototype, "_onSwitchTo", null);
    exports.default = TarsPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL2NvbXBvbmVudHMvVGFyc1BhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQVNBLE1BQThCLFNBQVUsU0FBUSx3QkFBYztRQVloRCxXQUFXO1lBQ2pCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkIsQ0FBQztLQUNKO0lBYkc7UUFEQyxhQUFHLENBQUMsUUFBUSxDQUFVLGtCQUFPLENBQUM7OENBQ0U7SUFTakM7UUFEQyxJQUFBLDhCQUFlLEVBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQztnREFJdEM7SUFmTCw0QkFnQkMifQ==