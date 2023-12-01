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
define(["require", "exports", "@wayward/utilities/event/EventManager", "@wayward/game/language/Translation", "@wayward/game/language/dictionary/Message", "@wayward/game/ui/screen/screens/game/Dialogs", "@wayward/game/ui/screen/screens/game/component/TabDialog", "@wayward/utilities/collection/Tuple", "@wayward/game/utilities/math/Vector2", "../ITarsMod", "./panels/DataPanel", "./panels/GeneralPanel", "./panels/GlobalOptionsPanel", "./panels/ModeOptionsPanel", "./panels/MoveToPanel", "./panels/NPCsPanel", "./panels/TasksPanel", "./panels/ViewportPanel"], function (require, exports, EventManager_1, Translation_1, Message_1, Dialogs_1, TabDialog_1, Tuple_1, Vector2_1, ITarsMod_1, DataPanel_1, GeneralPanel_1, GlobalOptionsPanel_1, ModeOptionsPanel_1, MoveToPanel_1, NPCsPanel_1, TasksPanel_1, ViewportPanel_1) {
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
            return this.subpanelInformations.find(spi => spi[0] === this.tarsInstance.saveData.ui[ITarsMod_1.TarsUiSaveDataKey.ActivePanelId]) ?? super.getDefaultSubpanelInformation();
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
                if (panelClass === NPCsPanel_1.default && (this.subId.length !== 0 || !localPlayer.isHost)) {
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
    exports.default = TarsDialog;
    __decorate([
        (0, EventManager_1.OwnEventHandler)(TarsDialog, "changeSubpanel")
    ], TarsDialog.prototype, "onChangeSubpanel", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc0RpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91aS9UYXJzRGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7Ozs7OztJQTRCSCxNQUFNLGVBQWUsR0FBMEI7UUFDOUMsc0JBQVk7UUFDWixvQkFBVTtRQUNWLHFCQUFXO1FBQ1gsNEJBQWtCO1FBQ2xCLDBCQUFnQjtRQUNoQixtQkFBUztRQUNULHVCQUFhO1FBQ2IsbUJBQVM7S0FDVCxDQUFDO0lBRUYsTUFBcUIsVUFBVyxTQUFRLG1CQUFvQjtRQWMzRCxZQUFtQixFQUFZLEVBQUUsUUFBZ0IsRUFBRTtZQUNsRCxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBRWtCLDZCQUE2QjtZQUMvQyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLDRCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLDZCQUE2QixFQUFFLENBQUM7UUFDbkssQ0FBQztRQUdTLGdCQUFnQixDQUFDLGNBQW1DO1lBQzdELElBQUksQ0FBQyxZQUFhLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyw0QkFBaUIsQ0FBQyxhQUFhLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUVlLE9BQU87WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3pDLENBQUM7WUFFRCxPQUFPLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxlQUFlLENB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