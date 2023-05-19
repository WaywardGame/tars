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
define(["require", "exports", "mod/Mod", "ui/component/Text", "ui/screen/screens/game/component/IQuadrantComponent", "ui/screen/screens/game/component/QuadrantComponent", "utilities/Decorators", "../../ITarsMod"], function (require, exports, Mod_1, Text_1, IQuadrantComponent_1, QuadrantComponent_1, Decorators_1, ITarsMod_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TarsQuadrantComponent extends QuadrantComponent_1.default {
        get preferredQuadrant() {
            return TarsQuadrantComponent.preferredQuadrant;
        }
        constructor(id) {
            super(id);
            this.classes.add("tars-quadrant-component", "hide-in-screenshot-mode");
            this.statusText = new Text_1.default()
                .appendTo(this);
            this.TarsMod.event.until(this, "remove").subscribe("statusChange", this.refresh);
            this.refresh();
        }
        refresh() {
            const tarsInstance = this.TarsMod.tarsInstance;
            this.statusText.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogTitleMain)
                .addArgs(tarsInstance?.getName(), tarsInstance?.getStatus() ?? "Not running"));
        }
    }
    TarsQuadrantComponent.preferredQuadrant = IQuadrantComponent_1.Quadrant.None;
    exports.default = TarsQuadrantComponent;
    __decorate([
        Mod_1.default.instance(ITarsMod_1.TARS_ID)
    ], TarsQuadrantComponent.prototype, "TarsMod", void 0);
    __decorate([
        Decorators_1.Bound
    ], TarsQuadrantComponent.prototype, "refresh", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc1F1YWRyYW50Q29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL2NvbXBvbmVudHMvVGFyc1F1YWRyYW50Q29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7Ozs7OztJQVdILE1BQXFCLHFCQUFzQixTQUFRLDJCQUFpQjtRQU9oRSxJQUFvQixpQkFBaUI7WUFDakMsT0FBTyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQztRQUNuRCxDQUFDO1FBSUQsWUFBbUIsRUFBdUI7WUFDdEMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRVYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUseUJBQXlCLENBQUMsQ0FBQztZQUV2RSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksY0FBSSxFQUFFO2lCQUN2QixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVqRixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkIsQ0FBQztRQUdPLE9BQU87WUFDWCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztZQUMvQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMsZUFBZSxDQUFDO2lCQUN0RSxPQUFPLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7O0lBMUJhLHVDQUFpQixHQUFHLDZCQUFRLENBQUMsSUFBSSxDQUFDO3NCQUwvQixxQkFBcUI7SUFHdEI7UUFEZixhQUFHLENBQUMsUUFBUSxDQUFVLGtCQUFPLENBQUM7MERBQ0U7SUF3QnpCO1FBRFAsa0JBQUs7d0RBS0wifQ==