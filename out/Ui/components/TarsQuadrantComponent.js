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
define(["require", "exports", "mod/Mod", "ui/component/Text", "ui/screen/screens/game/component/IQuadrantComponent", "ui/screen/screens/game/component/QuadrantComponent", "utilities/Decorators", "../../TarsMod", "../../ITarsMod"], function (require, exports, Mod_1, Text_1, IQuadrantComponent_1, QuadrantComponent_1, Decorators_1, TarsMod_1, ITarsMod_1) {
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
                .setText(TarsMod_1.default.INSTANCE.getTranslation(ITarsMod_1.TarsTranslation.DialogTitleMain))
                .appendTo(this);
            this.TARS.event.until(this, "remove").subscribe("statusChange", this.refresh);
            this.refresh();
        }
        get preferredQuadrant() {
            return TarsQuadrantComponent.preferredQuadrant;
        }
        refresh() {
            this.statusText.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogTitleMain).addArgs(this.TARS.getStatus));
        }
    }
    TarsQuadrantComponent.preferredQuadrant = IQuadrantComponent_1.Quadrant.BottomRight;
    __decorate([
        Mod_1.default.instance(ITarsMod_1.TARS_ID)
    ], TarsQuadrantComponent.prototype, "TARS", void 0);
    __decorate([
        Decorators_1.Bound
    ], TarsQuadrantComponent.prototype, "refresh", null);
    exports.default = TarsQuadrantComponent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc1F1YWRyYW50Q29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL2NvbXBvbmVudHMvVGFyc1F1YWRyYW50Q29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7Ozs7OztJQVdILE1BQXFCLHFCQUFzQixTQUFRLDJCQUFpQjtRQWFoRSxZQUFtQixFQUF1QjtZQUN0QyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFVixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBRzVDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUM7WUFFdkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxVQUFVLENBQUMsbUJBQW1CLEVBQUUsRUFBRTtnQkFDOUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQzthQUMzQztZQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxjQUFJLEVBQUU7aUJBQ3ZCLE9BQU8sQ0FBQyxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsMEJBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztpQkFDekUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFOUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLENBQUM7UUF2QkQsSUFBb0IsaUJBQWlCO1lBQ2pDLE9BQU8scUJBQXFCLENBQUMsaUJBQWlCLENBQUM7UUFDbkQsQ0FBQztRQXdCTyxPQUFPO1lBQ1gsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBQSw2QkFBa0IsRUFBQywwQkFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDOUcsQ0FBQzs7SUFoQ2EsdUNBQWlCLEdBQUcsNkJBQVEsQ0FBQyxXQUFXLENBQUM7SUFGdkQ7UUFEQyxhQUFHLENBQUMsUUFBUSxDQUFVLGtCQUFPLENBQUM7dURBQ0Q7SUFnQzlCO1FBREMsa0JBQUs7d0RBR0w7SUFyQ0wsd0NBdUNDIn0=