var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventManager", "language/dictionary/Message", "language/Translation", "ui/screen/screens/game/component/TabDialog", "ui/screen/screens/game/Dialogs", "utilities/collection/Tuple", "utilities/math/Vector2", "../ITarsMod", "./panels/DataPanel", "./panels/GeneralPanel", "./panels/GlobalOptionsPanel", "./panels/ModeOptionsPanel", "./panels/MoveToPanel", "./panels/NPCsPanel", "./panels/TasksPanel", "./panels/ViewportPanel"], function (require, exports, EventManager_1, Message_1, Translation_1, TabDialog_1, Dialogs_1, Tuple_1, Vector2_1, ITarsMod_1, DataPanel_1, GeneralPanel_1, GlobalOptionsPanel_1, ModeOptionsPanel_1, MoveToPanel_1, NPCsPanel_1, TasksPanel_1, ViewportPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const subpanelClasses = [
        GeneralPanel_1.default,
        TasksPanel_1.default,
        MoveToPanel_1.default,
        GlobalOptionsPanel_1.default,
        ModeOptionsPanel_1.default,
        NPCsPanel_1.default,
        ViewportPanel_1.default,
        DataPanel_1.default,
    ];
    class TarsDialog extends TabDialog_1.default {
        constructor(id, subId = "") {
            super(id, subId, false);
        }
        getDefaultSubpanelInformation() {
            for (const subpanelInformation of this.subpanelInformations) {
                if (subpanelInformation[0] === this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.ActivePanelId]) {
                    return subpanelInformation;
                }
            }
            return super.getDefaultSubpanelInformation();
        }
        onChangeSubpanel(activeSubpanel) {
            this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.ActivePanelId] = activeSubpanel[0];
        }
        getName() {
            if (!this.tarsInstance) {
                return Translation_1.default.message(Message_1.default.None);
            }
            return (0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogTitleMain)
                .addArgs(this.tarsInstance.getName(), this.tarsInstance.getStatus());
        }
        initialize(tarsInstance) {
            if (this.tarsInstance !== tarsInstance) {
                this.tarsInstance = tarsInstance;
                this.initializeSubpanels();
            }
            this.tarsInstance.event.until(this, "remove").subscribe("statusChange", () => this.refreshHeader());
            this.refreshHeader();
        }
        refreshHeader() {
            this.header.refresh();
        }
        getSubpanels() {
            if (!this.tarsInstance) {
                return [];
            }
            let panels = [];
            for (const panelClass of subpanelClasses) {
                if (panelClass === NPCsPanel_1.default && (this.subId.length !== 0 || !localPlayer.isHost())) {
                    continue;
                }
                if (panelClass === ViewportPanel_1.default && this.subId.length === 0) {
                    continue;
                }
                panels.push(new panelClass(this.tarsInstance));
            }
            return panels;
        }
        getSubpanelInformation(subpanels) {
            return subpanels
                .map(subpanel => (0, Tuple_1.Tuple)((0, ITarsMod_1.getTarsTranslation)(subpanel.getTranslation()).getString(), (0, ITarsMod_1.getTarsTranslation)(subpanel.getTranslation()), this.onShowSubpanel(subpanel)));
        }
    }
    TarsDialog.description = {
        minResolution: new Vector2_1.default(300, 200),
        size: new Vector2_1.default(40, 70),
        edges: [
            [Dialogs_1.Edge.Left, 25],
            [Dialogs_1.Edge.Bottom, 33],
        ],
        saveOpen: false,
    };
    __decorate([
        (0, EventManager_1.OwnEventHandler)(TarsDialog, "changeSubpanel")
    ], TarsDialog.prototype, "onChangeSubpanel", null);
    exports.default = TarsDialog;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc0RpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91aS9UYXJzRGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQTBCQSxNQUFNLGVBQWUsR0FBMEI7UUFDOUMsc0JBQVk7UUFDWixvQkFBVTtRQUNWLHFCQUFXO1FBQ1gsNEJBQWtCO1FBQ2xCLDBCQUFnQjtRQUNoQixtQkFBUztRQUNULHVCQUFhO1FBQ2IsbUJBQVM7S0FDVCxDQUFDO0lBRUYsTUFBcUIsVUFBVyxTQUFRLG1CQUFvQjtRQWMzRCxZQUFtQixFQUFZLEVBQUUsUUFBZ0IsRUFBRTtZQUNsRCxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBRWtCLDZCQUE2QjtZQUMvQyxLQUFLLE1BQU0sbUJBQW1CLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUM1RCxJQUFJLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxZQUFhLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyw0QkFBaUIsQ0FBQyxhQUFhLENBQUMsRUFBRTtvQkFDL0YsT0FBTyxtQkFBbUIsQ0FBQztpQkFDM0I7YUFDRDtZQUVELE9BQU8sS0FBSyxDQUFDLDZCQUE2QixFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUdTLGdCQUFnQixDQUFDLGNBQW1DO1lBQzdELElBQUksQ0FBQyxZQUFhLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyw0QkFBaUIsQ0FBQyxhQUFhLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUVlLE9BQU87WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3ZCLE9BQU8scUJBQVcsQ0FBQyxPQUFPLENBQUMsaUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTthQUN4QztZQUVELE9BQU8sSUFBQSw2QkFBa0IsRUFBQywwQkFB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