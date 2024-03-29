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
define(["require", "exports", "event/EventManager", "game/entity/action/actions/RemoveControllableNPC", "game/island/Island", "game/meta/prompt/Prompts", "ui/component/Button", "ui/component/Component", "ui/component/Divider", "ui/component/LabeledButtonRow", "utilities/Decorators", "mod/Mod", "../../ITarsMod", "../components/TarsPanel"], function (require, exports, EventManager_1, RemoveControllableNPC_1, Island_1, Prompts_1, Button_1, Component_1, Divider_1, LabeledButtonRow_1, Decorators_1, Mod_1, ITarsMod_1, TarsPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class NPCsPanel extends TarsPanel_1.default {
        constructor(tarsInstance) {
            super(tarsInstance);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonSpawnNPC))
                .setTooltip(tooltip => tooltip.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonSpawnNPCTooltip)))
                .event.subscribe("activate", async () => {
                this.TarsMod.spawnNpc();
                return true;
            })
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            this.rows = new Component_1.default()
                .setStyle("display", "grid")
                .setStyle("row-gap", "5px")
                .setStyle("column-count", "1")
                .appendTo(this);
        }
        getTranslation() {
            return ITarsMod_1.TarsTranslation.DialogPanelNPCs;
        }
        onSwitchTo() {
            for (const island of game.islands.active) {
                this.onIslandActivated(island);
            }
        }
        onIslandActivated(island) {
            const events = island.npcs.event.until(this, "switchAway", "remove");
            events.subscribe("spawn", this.refresh);
            events.subscribe("remove", this.refresh);
            this.refresh();
        }
        onIslandDeactivated(island) {
            island.npcs.event.unsubscribe("spawn", this.refresh);
            island.npcs.event.unsubscribe("remove", this.refresh);
            this.refresh();
        }
        async refresh() {
            await this.sleep(10);
            this.rows.dump();
            const nonPlayerHumans = game.getNonPlayerHumans();
            for (const human of nonPlayerHumans) {
                const npc = human.asNPC;
                if (!npc) {
                    continue;
                }
                const tarsInstance = npc.tarsInstance;
                if (tarsInstance === undefined) {
                    continue;
                }
                const blockRow = new LabeledButtonRow_1.LabeledButtonRow()
                    .setLabel(label => label.setText(human.getName()))
                    .addButton(button => button
                    .classes.add("button-gear")
                    .setTooltip(tooltip => tooltip.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonConfigurationTooltip)))
                    .event.subscribe("activate", () => {
                    gameScreen?.dialogs.open(this.TarsMod.dialogMain, undefined, tarsInstance.dialogSubId)?.initialize(tarsInstance);
                }))
                    .addButton(button => button
                    .classes.add("button-delete")
                    .setTooltip(tooltip => tooltip.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonDeleteTooltip)))
                    .event.subscribe("activate", async () => {
                    if (!await Prompts_1.default.queue(this.TarsMod.promptDeleteConfirmation, human.getName())) {
                        return;
                    }
                    RemoveControllableNPC_1.default.execute(localPlayer, npc);
                }))
                    .appendTo(this.rows);
                human.event.until(blockRow.label, "remove")
                    .subscribe("renamed", () => {
                    blockRow.label.setText(human.getName());
                });
            }
        }
    }
    exports.default = NPCsPanel;
    __decorate([
        Mod_1.default.instance(ITarsMod_1.TARS_ID)
    ], NPCsPanel.prototype, "TarsMod", void 0);
    __decorate([
        (0, EventManager_1.EventHandler)(Island_1.default, "activated")
    ], NPCsPanel.prototype, "onIslandActivated", null);
    __decorate([
        (0, EventManager_1.EventHandler)(Island_1.default, "deactivated")
    ], NPCsPanel.prototype, "onIslandDeactivated", null);
    __decorate([
        Decorators_1.Bound
    ], NPCsPanel.prototype, "refresh", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTlBDc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9OUENzUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7Ozs7Ozs7O0lBb0JILE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQU81QyxZQUFZLFlBQWtCO1lBQzFCLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVwQixJQUFJLGdCQUFNLEVBQUU7aUJBQ1AsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2lCQUNqRSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZHLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN4QixPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDLENBQUM7aUJBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBCLElBQUksaUJBQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksbUJBQVMsRUFBRTtpQkFDdEIsUUFBUSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7aUJBQzNCLFFBQVEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDO2lCQUMxQixRQUFRLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQztpQkFDN0IsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLENBQUM7UUFFTSxjQUFjO1lBQ2pCLE9BQU8sMEJBQWUsQ0FBQyxlQUFlLENBQUM7UUFDM0MsQ0FBQztRQUVTLFVBQVU7WUFDaEIsS0FB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