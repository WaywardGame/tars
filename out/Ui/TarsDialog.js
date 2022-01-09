var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventManager", "mod/Mod", "ui/screen/screens/game/component/TabDialog", "ui/screen/screens/game/Dialogs", "utilities/collection/Arrays", "utilities/math/Vector2", "../ITarsMod", "./panels/GeneralPanel", "./panels/MoveToPanel", "./panels/OptionsPanel", "./panels/TasksPanel"], function (require, exports, EventManager_1, Mod_1, TabDialog_1, Dialogs_1, Arrays_1, Vector2_1, ITarsMod_1, GeneralPanel_1, MoveToPanel_1, OptionsPanel_1, TasksPanel_1) {
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
            this.TarsMod.event.until(this, "remove").subscribe("statusChange", this.header.refresh);
        }
        getDefaultSubpanelInformation() {
            for (const subpanelInformation of this.subpanelInformations) {
                if (subpanelInformation[0] === this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.ActivePanelId]) {
                    return subpanelInformation;
                }
            }
            return super.getDefaultSubpanelInformation();
        }
        onChangeSubpanel(activeSubpanel) {
            this.TarsMod.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.ActivePanelId] = activeSubpanel[0];
        }
        getName() {
            return (0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogTitleMain).addArgs(this.TarsMod.getStatus());
        }
        getSubpanels() {
            return subpanelClasses.map(cls => new cls());
        }
        getSubpanelInformation(subpanels) {
            return subpanels
                .map(subpanel => (0, Arrays_1.Tuple)((0, ITarsMod_1.getTarsTranslation)(subpanel.getTranslation()).getString(), (0, ITarsMod_1.getTarsTranslation)(subpanel.getTranslation()), this.onShowSubpanel(subpanel)));
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
        Mod_1.default.instance(ITarsMod_1.TARS_ID)
    ], TarsDialog.prototype, "TarsMod", void 0);
    __decorate([
        (0, EventManager_1.OwnEventHandler)(TarsDialog, "changeSubpanel")
    ], TarsDialog.prototype, "onChangeSubpanel", null);
    exports.default = TarsDialog;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc0RpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91aS9UYXJzRGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQXNCQSxNQUFNLGVBQWUsR0FBMEI7UUFDOUMsc0JBQVk7UUFDWixvQkFBVTtRQUNWLHFCQUFXO1FBQ1gsc0JBQVk7S0FDWixDQUFDO0lBRUYsTUFBcUIsVUFBVyxTQUFRLG1CQUFvQjtRQWUzRCxZQUFtQixFQUFZO1lBQzlCLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNWLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFFa0IsNkJBQTZCO1lBQy9DLEtBQUssTUFBTSxtQkFBbUIsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzVELElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLDRCQUFpQixDQUFDLGFBQWEsQ0FBQyxFQUFFO29CQUN6RixPQUFPLG1CQUFtQixDQUFDO2lCQUMzQjthQUNEO1lBRUQsT0FBTyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztRQUM5QyxDQUFDO1FBR1MsZ0JBQWdCLENBQUMsY0FBbUM7WUFDN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLDRCQUFpQixDQUFDLGFBQWEsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRWUsT0FBTztZQUN0QixPQUFPLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFNa0IsWUFBWTtZQUM5QixPQUFPLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQVVrQixzQkFBc0IsQ0FBQyxTQUFzQjtZQUMvRCxPQUFPLFNBQVM7aUJBQ2QsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBQSxjQUFLLEVBQ3JCLElBQUEsNkJBQWtCLEVBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQ3pELElBQUEsNkJBQWtCLEVBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQzdDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQzdCLENBQUMsQ0FBQztRQUNMLENBQUM7O0lBNURhLHNCQUFXLEdBQXVCO1FBQy9DLE9BQU8sRUFBRSxJQUFJLGlCQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUM1QixJQUFJLEVBQUUsSUFBSSxpQkFBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDekIsT0FBTyxFQUFFLElBQUksaUJBQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQzVCLEtBQUssRUFBRTtZQUNOLENBQUMsY0FBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7WUFDZixDQUFDLGNBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1NBQ2pCO0tBQ0QsQ0FBQztJQUdGO1FBREMsYUFBRyxDQUFDLFFBQVEsQ0FBVSxrQkFBTyxDQUFDOytDQUNFO0lBa0JqQztRQURDLElBQUEsOEJBQWUsRUFBQyxVQUFVLEVBQUUsZ0JBQWdCLENBQUM7c0RBRzdDO0lBakNGLDZCQStEQyJ9