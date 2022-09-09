var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "ui/component/Button", "ui/component/Divider", "utilities/Decorators", "ui/component/LabeledButtonRow", "ui/component/Component", "game/meta/prompt/Prompts", "game/meta/prompt/PromptDescriptionFactory", "game/meta/prompt/IPrompt", "event/EventManager", "game/island/Island", "../components/TarsPanel", "../../ITarsMod", "mod/Mod", "../../npc/TarsNPC"], function (require, exports, Button_1, Divider_1, Decorators_1, LabeledButtonRow_1, Component_1, Prompts_1, PromptDescriptionFactory_1, IPrompt_1, EventManager_1, Island_1, TarsPanel_1, ITarsMod_1, Mod_1, TarsNPC_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class NPCsPanel extends TarsPanel_1.default {
        constructor(tarsInstance) {
            super(tarsInstance);
            new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonSpawnNPC))
                .setTooltip(tooltip => tooltip.addText(text => text.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonSpawnNPCTooltip))))
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
                if (!(human instanceof TarsNPC_1.default)) {
                    continue;
                }
                const tarsInstance = human.tarsInstance;
                if (tarsInstance === undefined) {
                    continue;
                }
                const blockRow = new LabeledButtonRow_1.LabeledButtonRow()
                    .setLabel(label => label.setText(human.getName()))
                    .addButton(button => button
                    .classes.add("button-gear")
                    .setTooltip(tooltip => tooltip
                    .addHeading(heading => heading
                    .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonConfigurationTooltip))))
                    .event.subscribe("activate", () => {
                    gameScreen?.dialogs.open(this.TarsMod.dialogMain, tarsInstance.getDialogSubId())?.initialize(tarsInstance);
                }))
                    .addButton(button => button
                    .classes.add("button-delete")
                    .setTooltip(tooltip => tooltip
                    .addHeading(heading => heading
                    .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonDeleteTooltip))))
                    .event.subscribe("activate", async () => {
                    if (!await Prompts_1.default.queue(PromptDescriptionFactory_1.promptDescriptionFactory
                        .priority(IPrompt_1.PromptPriority.Default)
                        .confirm(this.TarsMod.promptDeleteConfirmation), human.getName())) {
                        return;
                    }
                    human.island.npcs.remove(human);
                }))
                    .appendTo(this.rows);
                human.event.until(blockRow.label, "remove")
                    .subscribe("renamed", () => {
                    blockRow.label.setText(human.getName());
                });
            }
        }
    }
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
    exports.default = NPCsPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTlBDc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9OUENzUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBb0JBLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQU81QyxZQUFZLFlBQWtCO1lBQzFCLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVwQixJQUFJLGdCQUFNLEVBQUU7aUJBQ1AsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2lCQUNqRSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzdILEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN4QixPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDLENBQUM7aUJBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBCLElBQUksaUJBQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksbUJBQVMsRUFBRTtpQkFDdEIsUUFBUSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7aUJBQzNCLFFBQVEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDO2lCQUMxQixRQUFRLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQztpQkFDN0IsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLENBQUM7UUFFTSxjQUFjO1lBQ2pCLE9BQU8sMEJBQWUsQ0FBQyxlQUFlLENBQUM7UUFD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