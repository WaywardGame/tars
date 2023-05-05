var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "game/meta/prompt/IPrompt", "game/meta/prompt/PromptDescriptionFactory", "game/meta/prompt/PromptDescriptions", "game/meta/prompt/Prompts", "mod/Mod", "ui/component/BlockRow", "ui/component/Button", "ui/component/Component", "ui/component/Divider", "ui/component/LabeledButtonRow", "utilities/Decorators", "utilities/Files", "../../ITarsMod", "../components/TarsPanel"], function (require, exports, IPrompt_1, PromptDescriptionFactory_1, PromptDescriptions_1, Prompts_1, Mod_1, BlockRow_1, Button_1, Component_1, Divider_1, LabeledButtonRow_1, Decorators_1, Files_1, ITarsMod_1, TarsPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DataPanel extends TarsPanel_1.default {
        constructor(tarsInstance) {
            super(tarsInstance);
            const importInputId = `#tars-import--${Math.random().toString().slice(2)}`;
            new BlockRow_1.BlockRow()
                .append(new Button_1.default()
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonSaveData))
                .setTooltip(tooltip => tooltip.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonSaveDataTooltip)))
                .event.subscribe("activate", async () => {
                this.TarsMod.addDataSlot(tarsInstance.getSaveDataContainer());
                return true;
            }))
                .append(new Button_1.default("label")
                .setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonImportData))
                .setTooltip(tooltip => tooltip.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonImportDataTooltip)))
                .attributes.set("for", importInputId)
                .append(new Component_1.default("input")
                .setId(importInputId)
                .attributes.set("type", "file")
                .attributes.set("accept", ".wayward")
                .event.subscribe("inputChange", async (input, inputEvent) => {
                const file = Files_1.default.getSingleFromEvent(inputEvent);
                if (!file) {
                    throw new Error("No file to upload");
                }
                const fileData = await Files_1.default.uploadSingle(file).then(result => result.data);
                this.TarsMod.importDataSlot(fileData);
                return true;
            }).hide()))
                .appendTo(this);
            new Divider_1.default().appendTo(this);
            this.rows = new Component_1.default()
                .setStyle("display", "grid")
                .setStyle("row-gap", "5px")
                .setStyle("column-count", "1")
                .appendTo(this);
        }
        getTranslation() {
            return ITarsMod_1.TarsTranslation.DialogPanelData;
        }
        onSwitchTo() {
            const events = this.TarsMod.event.until(this, "switchAway", "remove");
            events.subscribe("changedGlobalDataSlots", this.refresh);
        }
        async refresh() {
            this.rows.dump();
            for (const container of this.TarsMod.globalSaveData.dataSlots) {
                new LabeledButtonRow_1.LabeledButtonRow()
                    .setLabel(label => label.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogLabel).addArgs(container.name)))
                    .addButton(button => button
                    .classes.add("button-check")
                    .setTooltip(tooltip => tooltip.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonLoadTooltip)))
                    .event.subscribe("activate", () => {
                    this.tarsInstance.loadSaveData(container);
                }))
                    .addButton(button => button
                    .classes.add("button-edit")
                    .setTooltip(tooltip => tooltip.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonRenameTooltip)))
                    .event.subscribe("activate", () => {
                    const placeholder = container.name;
                    Prompts_1.default.queue(PromptDescriptions_1.promptGameRenameGeneric, placeholder, placeholder)
                        .then(newName => {
                        if (newName === undefined || newName.length === 0 || newName === placeholder) {
                            return;
                        }
                        this.TarsMod.renameDataSlot(container, newName);
                    });
                }))
                    .addButton(button => button
                    .classes.add("button-export")
                    .setTooltip(tooltip => tooltip.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonExportTooltip)))
                    .event.subscribe("activate", () => {
                    this.TarsMod.exportDataSlot(container);
                }))
                    .addButton(button => button
                    .classes.add("button-delete")
                    .setTooltip(tooltip => tooltip.setText((0, ITarsMod_1.getTarsTranslation)(ITarsMod_1.TarsTranslation.DialogButtonDeleteTooltip)))
                    .event.subscribe("activate", async () => {
                    if (!await Prompts_1.default.queue(PromptDescriptionFactory_1.promptDescriptionFactory
                        .priority(IPrompt_1.PromptPriority.Default)
                        .confirm(this.TarsMod.promptDeleteConfirmation), container.name)) {
                        return;
                    }
                    this.TarsMod.removeDataSlot(container);
                }))
                    .appendTo(this.rows);
            }
        }
    }
    __decorate([
        Mod_1.default.instance(ITarsMod_1.TARS_ID)
    ], DataPanel.prototype, "TarsMod", void 0);
    __decorate([
        Decorators_1.Bound
    ], DataPanel.prototype, "refresh", null);
    exports.default = DataPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YVBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9EYXRhUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0lBbUJBLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQU81QyxZQUFZLFlBQWtCO1lBQzFCLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVwQixNQUFNLGFBQWEsR0FBRyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRTNFLElBQUksbUJBQVEsRUFBRTtpQkFDVCxNQUFNLENBQUMsSUFBSSxnQkFBTSxFQUFFO2lCQUNmLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMsb0JBQW9CLENBQUMsQ0FBQztpQkFDakUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO2lCQUN2RyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxLQUFLLElBQUksRUFBRTtnQkFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQztnQkFDOUQsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7aUJBQ04sTUFBTSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxPQUFPLENBQUM7aUJBQ3RCLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMsc0JBQXNCLENBQUMsQ0FBQztpQkFDbkUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxD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