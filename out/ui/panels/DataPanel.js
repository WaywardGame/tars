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
define(["require", "exports", "@wayward/game/game/meta/prompt/PromptDescriptions", "@wayward/game/game/meta/prompt/Prompts", "@wayward/game/mod/Mod", "@wayward/game/ui/component/BlockRow", "@wayward/game/ui/component/Button", "@wayward/game/ui/component/Component", "@wayward/game/ui/component/Divider", "@wayward/game/ui/component/LabeledButtonRow", "@wayward/game/utilities/Files", "@wayward/utilities/Decorators", "../../ITarsMod", "../components/TarsPanel"], function (require, exports, PromptDescriptions_1, Prompts_1, Mod_1, BlockRow_1, Button_1, Component_1, Divider_1, LabeledButtonRow_1, Files_1, Decorators_1, ITarsMod_1, TarsPanel_1) {
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
                .style.set("display", "grid")
                .style.set("row-gap", "5px")
                .style.set("column-count", "1")
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
                    if (!await Prompts_1.default.queue(this.TarsMod.promptDeleteConfirmation, container.name)) {
                        return;
                    }
                    this.TarsMod.removeDataSlot(container);
                }))
                    .appendTo(this.rows);
            }
        }
    }
    exports.default = DataPanel;
    __decorate([
        Mod_1.default.instance(ITarsMod_1.TARS_ID)
    ], DataPanel.prototype, "TarsMod", void 0);
    __decorate([
        Decorators_1.Bound
    ], DataPanel.prototype, "refresh", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0YVBhbmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3VpL3BhbmVscy9EYXRhUGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7Ozs7Ozs7O0lBbUJILE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQU8vQyxZQUFZLFlBQWtCO1lBQzdCLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVwQixNQUFNLGFBQWEsR0FBRyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRTNFLElBQUksbUJBQVEsRUFBRTtpQkFDWixNQUFNLENBQUMsSUFBSSxnQkFBTSxFQUFFO2lCQUNsQixPQUFPLENBQUMsSUFBQSw2QkFBa0IsRUFBQywwQkFBZSxDQUFDLG9CQUFvQixDQUFDLENBQUM7aUJBQ2pFLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBQSw2QkFBa0IsRUFBQywwQkFBZSxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztpQkFDdkcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7Z0JBQzlELE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUM7aUJBQ0gsTUFBTSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxPQUFPLENBQUM7aUJBQ3pCLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMsc0JBQXNCLENBQUMsQ0FBQztpQkFDbkUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFBLDZCQUFrQixFQUFDLDBCQUFlLENBQUMs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