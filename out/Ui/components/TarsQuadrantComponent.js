/*!
 * Copyright 2011-2021 Unlok
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
define(["require", "exports", "mod/Mod", "ui/component/Text", "ui/screen/screens/game/component/IQuadrantComponent", "ui/screen/screens/game/component/QuadrantComponent", "utilities/Decorators", "../../ITars", "../../Tars"], function (require, exports, Mod_1, Text_1, IQuadrantComponent_1, QuadrantComponent_1, Decorators_1, ITars_1, Tars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TarsQuadrantComponent extends QuadrantComponent_1.default {
        constructor(id) {
            super(id);
            this.classes.add("hide-in-screenshot-mode");
            this.element.style.textAlign = "right";
            if (!steamworks.isElectron() || steamworks.isDevelopmentBranch()) {
                this.element.style.marginBottom = "7px";
            }
            this.statusText = new Text_1.default()
                .setText(Tars_1.default.INSTANCE.getTranslation(ITars_1.TarsTranslation.DialogTitleMain))
                .appendTo(this);
            this.TARS.event.until(this, "remove").subscribe("statusChange", this.refresh);
            this.refresh();
        }
        get preferredQuadrant() {
            return TarsQuadrantComponent.preferredQuadrant;
        }
        refresh() {
            this.statusText.setText((0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogTitleMain).addArgs(this.TARS.getStatus));
        }
    }
    TarsQuadrantComponent.preferredQuadrant = IQuadrantComponent_1.Quadrant.BottomRight;
    __decorate([
        Mod_1.default.instance(ITars_1.TARS_ID)
    ], TarsQuadrantComponent.prototype, "TARS", void 0);
    __decorate([
        Decorators_1.Bound
    ], TarsQuadrantComponent.prototype, "refresh", null);
    exports.default = TarsQuadrantComponent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc1F1YWRyYW50Q29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL2NvbXBvbmVudHMvVGFyc1F1YWRyYW50Q29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7Ozs7OztJQVlILE1BQXFCLHFCQUFzQixTQUFRLDJCQUFpQjtRQWFoRSxZQUFtQixFQUF1QjtZQUN0QyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFVixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBRzVDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUM7WUFFdkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxVQUFVLENBQUMsbUJBQW1CLEVBQUUsRUFBRTtnQkFDOUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQzthQUMzQztZQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxjQUFJLEVBQUU7aUJBQ3ZCLE9BQU8sQ0FBQyxjQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyx1QkFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2lCQUN0RSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUU5RSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkIsQ0FBQztRQXZCRCxJQUFvQixpQkFBaUI7WUFDakMsT0FBTyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQztRQUNuRCxDQUFDO1FBd0JPLE9BQU87WUFDWCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFBLDBCQUFrQixFQUFDLHVCQUFlLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUM5RyxDQUFDOztJQWhDYSx1Q0FBaUIsR0FBRyw2QkFBUSxDQUFDLFdBQVcsQ0FBQztJQUZ2RDtRQURDLGFBQUcsQ0FBQyxRQUFRLENBQU8sZUFBTyxDQUFDO3VEQUNEO0lBZ0MzQjtRQURDLGtCQUFLO3dEQUdMO0lBckNMLHdDQXVDQyJ9