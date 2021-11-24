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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc1F1YWRyYW50Q29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL2NvbXBvbmVudHMvVGFyc1F1YWRyYW50Q29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7Ozs7OztJQVlILE1BQXFCLHFCQUFzQixTQUFRLDJCQUFpQjtRQWFoRSxZQUFtQixFQUF1QjtZQUN0QyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFHVixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO1lBRXZDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLElBQUksVUFBVSxDQUFDLG1CQUFtQixFQUFFLEVBQUU7Z0JBQzlELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7YUFDM0M7WUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksY0FBSSxFQUFFO2lCQUN2QixPQUFPLENBQUMsY0FBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsdUJBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztpQkFDdEUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFOUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLENBQUM7UUFyQkQsSUFBb0IsaUJBQWlCO1lBQ2pDLE9BQU8scUJBQXFCLENBQUMsaUJBQWlCLENBQUM7UUFDbkQsQ0FBQztRQXNCTyxPQUFPO1lBQ1gsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBQSwwQkFBa0IsRUFBQyx1QkFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDOUcsQ0FBQzs7SUE5QmEsdUNBQWlCLEdBQUcsNkJBQVEsQ0FBQyxXQUFXLENBQUM7SUFGdkQ7UUFEQyxhQUFHLENBQUMsUUFBUSxDQUFPLGVBQU8sQ0FBQzt1REFDRDtJQThCM0I7UUFEQyxrQkFBSzt3REFHTDtJQW5DTCx3Q0FxQ0MifQ==