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
define(["require", "exports", "@wayward/game/event/EventManager", "@wayward/game/game/entity/action/actions/RemoveControllableNPC", "@wayward/game/game/island/Island", "@wayward/game/game/meta/prompt/Prompts", "@wayward/game/ui/component/Button", "@wayward/game/ui/component/Component", "@wayward/game/ui/component/Divider", "@wayward/game/ui/component/LabeledButtonRow", "@wayward/utilities/Decorators", "@wayward/game/mod/Mod", "../../ITarsMod", "../components/TarsPanel"], function (require, exports, EventManager_1, RemoveControllableNPC_1, Island_1, Prompts_1, Button_1, Component_1, Divider_1, LabeledButtonRow_1, Decorators_1, Mod_1, ITarsMod_1, TarsPanel_1) {
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
            events.subscribe("create", this.refresh);
            events.subscribe("remove", this.refresh);
            this.refresh();
        }
        onIslandDeactivated(island) {
            island.npcs.event.unsubscribe("create", this.refresh);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTlBDc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9OUENzUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7Ozs7Ozs7O0lBb0JILE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQU8vQyxZQUFZLFlBQWtCO1lBQzdCLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVwQixJQUFJLGdCQUFNLEVBQUU7aUJBQ1YsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2lCQUNqRSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZHLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN4QixPQUFPLElBQUksQ0FBQztZQUNiLENBQUMsQ0FBQztpQkFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFakIsSUFBSSxpQkFBTyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTdCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxtQkFBUyxFQUFFO2lCQUN6QixRQUFRLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQztpQkFDM0IsUUFBUSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUM7aUJBQzFCLFFBQVEsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDO2lCQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsQ0FBQztRQUVNLGNBQWM7WUFDcEIsT0FBTywwQkFBZSxDQUFDLGVBQWUsQ0FBQztRQUN4QyxDQUFDO1FBRVMsVUFBVTtZQUNuQixLQUFL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