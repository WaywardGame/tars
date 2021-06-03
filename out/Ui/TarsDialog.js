var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventManager", "mod/Mod", "ui/screen/screens/game/component/TabDialog", "ui/screen/screens/game/Dialogs", "utilities/collection/Arrays", "utilities/math/Vector2", "../ITars", "./panels/GeneralPanel", "./panels/OptionsPanel", "./panels/TasksPanel"], function (require, exports, EventManager_1, Mod_1, TabDialog_1, Dialogs_1, Arrays_1, Vector2_1, ITars_1, GeneralPanel_1, OptionsPanel_1, TasksPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const subpanelClasses = [
        GeneralPanel_1.default,
        TasksPanel_1.default,
        OptionsPanel_1.default
    ];
    class TarsDialog extends TabDialog_1.default {
        constructor(id) {
            super(id);
            this.TARS.event.until(this, "remove").subscribe("statusChange", this.header.refresh);
        }
        getDefaultSubpanelInformation() {
            for (const subpanelInformation of this.subpanelInformations) {
                if (subpanelInformation[0] === this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.ActivePanelId]) {
                    return subpanelInformation;
                }
            }
            return super.getDefaultSubpanelInformation();
        }
        onChangeSubpanel(activeSubpanel) {
            this.TARS.saveData.ui[ITars_1.TarsUiSaveDataKey.ActivePanelId] = activeSubpanel[0];
        }
        getName() {
            return this.TARS.getTranslation(ITars_1.TarsTranslation.DialogTitleMain).addArgs(this.TARS.getStatus);
        }
        getSubpanels() {
            return subpanelClasses.map(cls => new cls());
        }
        getSubpanelInformation(subpanels) {
            return subpanels
                .map(subpanel => Arrays_1.Tuple(this.TARS.getTranslation(subpanel.getTranslation()).getString(), this.TARS.getTranslation(subpanel.getTranslation()), this.onShowSubpanel(subpanel)));
        }
    }
    TarsDialog.description = {
        minSize: new Vector2_1.default(30, 21),
        size: new Vector2_1.default(40, 70),
        maxSize: new Vector2_1.default(60, 70),
        edges: [
            [Dialogs_1.Edge.Left, 25],
            [Dialogs_1.Edge.Bottom, 33],
        ],
    };
    __decorate([
        Mod_1.default.instance(ITars_1.TARS_ID)
    ], TarsDialog.prototype, "TARS", void 0);
    __decorate([
        EventManager_1.OwnEventHandler(TarsDialog, "changeSubpanel")
    ], TarsDialog.prototype, "onChangeSubpanel", null);
    __decorate([
        Override
    ], TarsDialog.prototype, "getName", null);
    __decorate([
        Override
    ], TarsDialog.prototype, "getSubpanels", null);
    __decorate([
        Override
    ], TarsDialog.prototype, "getSubpanelInformation", null);
    exports.default = TarsDialog;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc0RpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91aS9UYXJzRGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQW9CQSxNQUFNLGVBQWUsR0FBMEI7UUFDOUMsc0JBQVk7UUFDWixvQkFBVTtRQUNWLHNCQUFZO0tBQ1osQ0FBQztJQUVGLE1BQXFCLFVBQVcsU0FBUSxtQkFBb0I7UUFlM0QsWUFBbUIsRUFBWTtZQUM5QixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRVMsNkJBQTZCO1lBQ3RDLEtBQUssTUFBTSxtQkFBbUIsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzVELElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHlCQUFpQixDQUFDLGFBQWEsQ0FBQyxFQUFFO29CQUN0RixPQUFPLG1CQUFtQixDQUFDO2lCQUMzQjthQUNEO1lBRUQsT0FBTyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztRQUM5QyxDQUFDO1FBR1MsZ0JBQWdCLENBQUMsY0FBbUM7WUFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHlCQUFpQixDQUFDLGFBQWEsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRWdCLE9BQU87WUFDdkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9GLENBQUM7UUFNbUIsWUFBWTtZQUMvQixPQUFPLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQVVtQixzQkFBc0IsQ0FBQyxTQUFzQjtZQUNoRSxPQUFPLFNBQVM7aUJBQ2QsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsY0FBSyxDQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFDL0QsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQ25ELElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQzdCLENBQUMsQ0FBQztRQUNMLENBQUM7O0lBNURhLHNCQUFXLEdBQXVCO1FBQy9DLE9BQU8sRUFBRSxJQUFJLGlCQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUM1QixJQUFJLEVBQUUsSUFBSSxpQkFBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDekIsT0FBTyxFQUFFLElBQUksaUJBQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQzVCLEtBQUssRUFBRTtZQUNOLENBQUMsY0FBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7WUFDZixDQUFDLGNBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1NBQ2pCO0tBQ0QsQ0FBQztJQUdGO1FBREMsYUFBRyxDQUFDLFFBQVEsQ0FBTyxlQUFPLENBQUM7NENBQ0Q7SUFrQjNCO1FBREMsOEJBQWUsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLENBQUM7c0RBRzdDO0lBRVM7UUFBVCxRQUFROzZDQUVSO0lBTVM7UUFBVCxRQUFRO2tEQUVSO0lBVVM7UUFBVCxRQUFROzREQU9SO0lBOURGLDZCQStEQyJ9