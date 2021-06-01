var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "mod/Mod", "ui/screen/screens/game/component/TabDialog", "ui/screen/screens/game/Dialogs", "utilities/math/Vector2", "utilities/collection/Arrays", "event/EventManager", "../ITars", "./panels/GeneralPanel", "./panels/TasksPanel", "./panels/OptionsPanel"], function (require, exports, Mod_1, TabDialog_1, Dialogs_1, Vector2_1, Arrays_1, EventManager_1, ITars_1, GeneralPanel_1, TasksPanel_1, OptionsPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const subpanelClasses = [
        GeneralPanel_1.default,
        TasksPanel_1.default,
        OptionsPanel_1.default
    ];
    class TarsDialog extends TabDialog_1.default {
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
            return this.TARS.getTranslation(ITars_1.TarsTranslation.DialogTitleMain);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc0RpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91aS9UYXJzRGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQW9CQSxNQUFNLGVBQWUsR0FBMEI7UUFDOUMsc0JBQVk7UUFDWixvQkFBVTtRQUNWLHNCQUFZO0tBQ1osQ0FBQztJQUVGLE1BQXFCLFVBQVcsU0FBUSxtQkFBb0I7UUFtQmpELDZCQUE2QjtZQUN0QyxLQUFLLE1BQU0sbUJBQW1CLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUM1RCxJQUFJLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyx5QkFBaUIsQ0FBQyxhQUFhLENBQUMsRUFBRTtvQkFDdEYsT0FBTyxtQkFBbUIsQ0FBQztpQkFDM0I7YUFDRDtZQUVELE9BQU8sS0FBSyxDQUFDLDZCQUE2QixFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUdTLGdCQUFnQixDQUFDLGNBQW1DO1lBQzdELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyx5QkFBaUIsQ0FBQyxhQUFhLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUVnQixPQUFPO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBTW1CLFlBQVk7WUFDL0IsT0FBTyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFVbUIsc0JBQXNCLENBQUMsU0FBc0I7WUFDaEUsT0FBTyxTQUFTO2lCQUNkLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGNBQUssQ0FDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQy9ELElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUNuRCxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUM3QixDQUFDLENBQUM7UUFDTCxDQUFDOztJQTNEYSxzQkFBVyxHQUF1QjtRQUMvQyxPQUFPLEVBQUUsSUFBSSxpQkFBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDNUIsSUFBSSxFQUFFLElBQUksaUJBQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sRUFBRSxJQUFJLGlCQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUM1QixLQUFLLEVBQUU7WUFDTixDQUFDLGNBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQ2YsQ0FBQyxjQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztTQUNqQjtLQUNELENBQUM7SUFHRjtRQURDLGFBQUcsQ0FBQyxRQUFRLENBQU8sZUFBTyxDQUFDOzRDQUNEO0lBaUIzQjtRQURDLDhCQUFlLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDO3NEQUc3QztJQUVTO1FBQVQsUUFBUTs2Q0FFUjtJQU1TO1FBQVQsUUFBUTtrREFFUjtJQVVTO1FBQVQsUUFBUTs0REFPUjtJQTdERiw2QkE4REMifQ==