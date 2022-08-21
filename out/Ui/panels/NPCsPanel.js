var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "ui/component/Button", "ui/component/Divider", "utilities/Decorators", "ui/component/LabeledButtonRow", "ui/component/Component", "game/meta/prompt/Prompts", "game/meta/prompt/PromptDescriptionFactory", "game/meta/prompt/IPrompt", "../components/TarsPanel", "../../ITarsMod", "mod/Mod", "../../npc/TarsNPC"], function (require, exports, Button_1, Divider_1, Decorators_1, LabeledButtonRow_1, Component_1, Prompts_1, PromptDescriptionFactory_1, IPrompt_1, TarsPanel_1, ITarsMod_1, Mod_1, TarsNPC_1) {
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
                const events = island.npcs.event.until(this, "switchAway", "remove");
                events.subscribe("spawn", this.refresh);
                events.subscribe("remove", this.refresh);
            }
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
                    localIsland.npcs.remove(human);
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
        Decorators_1.Bound
    ], NPCsPanel.prototype, "refresh", null);
    exports.default = NPCsPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTlBDc1BhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9OUENzUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBa0JBLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQU81QyxZQUFZLFlBQWtCO1lBQzFCLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVwQixJQUFJLGdCQUFNLEVBQUU7aUJBQ1AsT0FBTyxDQUFDLElBQUEsNkJBQWtCLEVBQUMsMEJBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2lCQUNqRSxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzdILEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN4QixPQUFPLElBQUksQ0FBQztZQUNoQixDQUFDLENBQUM7aUJBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBCLElBQUksaUJBQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksbUJBQVMsRUFBRTtpQkFDdEIsUUFBUSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7aUJBQzNCLFFBQVEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDO2lCQUMxQixRQUFRLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQztpQkFDN0IsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLENBQUM7UUFFTSxjQUFjO1lBQ2pCLE9BQU8sMEJBQWUsQ0FBQyxlQUFlLENBQUM7UUFD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