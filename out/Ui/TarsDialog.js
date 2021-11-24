var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventManager", "mod/Mod", "ui/screen/screens/game/component/TabDialog", "ui/screen/screens/game/Dialogs", "utilities/collection/Arrays", "utilities/math/Vector2", "../ITars", "./panels/GeneralPanel", "./panels/MoveToPanel", "./panels/OptionsPanel", "./panels/TasksPanel"], function (require, exports, EventManager_1, Mod_1, TabDialog_1, Dialogs_1, Arrays_1, Vector2_1, ITars_1, GeneralPanel_1, MoveToPanel_1, OptionsPanel_1, TasksPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const subpanelClasses = [
        GeneralPanel_1.default,
        TasksPanel_1.default,
        MoveToPanel_1.default,
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
            return (0, ITars_1.getTarsTranslation)(ITars_1.TarsTranslation.DialogTitleMain).addArgs(this.TARS.getStatus);
        }
        getSubpanels() {
            return subpanelClasses.map(cls => new cls());
        }
        getSubpanelInformation(subpanels) {
            return subpanels
                .map(subpanel => (0, Arrays_1.Tuple)((0, ITars_1.getTarsTranslation)(subpanel.getTranslation()).getString(), (0, ITars_1.getTarsTranslation)(subpanel.getTranslation()), this.onShowSubpanel(subpanel)));
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
        (0, EventManager_1.OwnEventHandler)(TarsDialog, "changeSubpanel")
    ], TarsDialog.prototype, "onChangeSubpanel", null);
    exports.default = TarsDialog;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc0RpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91aS9UYXJzRGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQW9CQSxNQUFNLGVBQWUsR0FBMEI7UUFDOUMsc0JBQVk7UUFDWixvQkFBVTtRQUNWLHFCQUFXO1FBQ1gsc0JBQVk7S0FDWixDQUFDO0lBRUYsTUFBcUIsVUFBVyxTQUFRLG1CQUFvQjtRQWUzRCxZQUFtQixFQUFZO1lBQzlCLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNWLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RGLENBQUM7UUFFa0IsNkJBQTZCO1lBQy9DLEtBQUssTUFBTSxtQkFBbUIsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzVELElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHlCQUFpQixDQUFDLGFBQWEsQ0FBQyxFQUFFO29CQUN0RixPQUFPLG1CQUFtQixDQUFDO2lCQUMzQjthQUNEO1lBRUQsT0FBTyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztRQUM5QyxDQUFDO1FBR1MsZ0JBQWdCLENBQUMsY0FBbUM7WUFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHlCQUFpQixDQUFDLGFBQWEsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRWUsT0FBTztZQUN0QixPQUFPLElBQUEsMEJBQWtCLEVBQUMsdUJBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6RixDQUFDO1FBTWtCLFlBQVk7WUFDOUIsT0FBTyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFVa0Isc0JBQXNCLENBQUMsU0FBc0I7WUFDL0QsT0FBTyxTQUFTO2lCQUNkLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUEsY0FBSyxFQUNyQixJQUFBLDBCQUFrQixFQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUN6RCxJQUFBLDBCQUFrQixFQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUM3QyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUM3QixDQUFDLENBQUM7UUFDTCxDQUFDOztJQTVEYSxzQkFBVyxHQUF1QjtRQUMvQyxPQUFPLEVBQUUsSUFBSSxpQkFBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDNUIsSUFBSSxFQUFFLElBQUksaUJBQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sRUFBRSxJQUFJLGlCQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUM1QixLQUFLLEVBQUU7WUFDTixDQUFDLGNBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQ2YsQ0FBQyxjQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztTQUNqQjtLQUNELENBQUM7SUFHRjtRQURDLGFBQUcsQ0FBQyxRQUFRLENBQU8sZUFBTyxDQUFDOzRDQUNEO0lBa0IzQjtRQURDLElBQUEsOEJBQWUsRUFBQyxVQUFVLEVBQUUsZ0JBQWdCLENBQUM7c0RBRzdDO0lBakNGLDZCQStEQyJ9