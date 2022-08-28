import type Translation from "language/Translation";
import Button from "ui/component/Button";
import Divider from "ui/component/Divider";
import { Bound } from "utilities/Decorators";
import { BlockRow } from "ui/component/BlockRow";
import Component from "ui/component/Component";
import { PromptPriority } from "game/meta/prompt/IPrompt";
import { promptDescriptionFactory } from "game/meta/prompt/PromptDescriptionFactory";
import Prompts from "game/meta/prompt/Prompts";
import { LabeledButtonRow } from "ui/component/LabeledButtonRow";
import Mod from "mod/Mod";
import { promptGameRenameGeneric } from "game/meta/prompt/PromptDescriptions";
import Files from "utilities/Files";

import TarsPanel from "../components/TarsPanel";
import { getTarsTranslation, TarsTranslation, TARS_ID } from "../../ITarsMod";
import Tars from "../../core/Tars";
import TarsMod from "../../TarsMod";

export default class DataPanel extends TarsPanel {

    @Mod.instance<TarsMod>(TARS_ID)
    public readonly TarsMod: TarsMod;

    private readonly rows: Component;

    constructor(tarsInstance: Tars) {
        super(tarsInstance);

        const importInputId = `#tars-import--${Math.random().toString().slice(2)}`;

        new BlockRow()
            .append(new Button()
                .setText(getTarsTranslation(TarsTranslation.DialogButtonSaveData))
                .setTooltip(tooltip => tooltip.addText(text => text.setText(getTarsTranslation(TarsTranslation.DialogButtonSaveDataTooltip))))
                .event.subscribe("activate", async () => {
                    this.TarsMod.addDataSlot(tarsInstance.getSaveDataContainer());
                    return true;
                }))
            .append(new Button("label")
                .setText(getTarsTranslation(TarsTranslation.DialogButtonImportData))
                .setTooltip(tooltip => tooltip.addText(text => text.setText(getTarsTranslation(TarsTranslation.DialogButtonImportDataTooltip))))
                .attributes.set("for", importInputId)
                .append(new Component("input")
                    .setId(importInputId)
                    .attributes.set("type", "file")
                    .attributes.set("accept", ".wayward")
                    .event.subscribe("inputChange", async (input: Component, inputEvent: Event) => {
                        const file = Files.getSingleFromEvent(inputEvent);
                        if (!file) {
                            throw new Error("No file to upload");
                        }

                        const fileData = await Files.uploadSingle(file).then(result => result.data);

                        this.TarsMod.importDataSlot(fileData);

                        return true;
                    }).hide()))
            .appendTo(this);

        new Divider().appendTo(this);

        this.rows = new Component()
            .setStyle("display", "grid")
            .setStyle("row-gap", "5px")
            .setStyle("column-count", "1")
            .appendTo(this);
    }

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelData;
    }

    protected onSwitchTo() {
        const events = this.TarsMod.event.until(this, "switchAway", "remove");
        events.subscribe("changedGlobalDataSlots", this.refresh);
    }

    @Bound
    protected async refresh() {
        this.rows.dump();

        for (const container of this.TarsMod.globalSaveData.dataSlots) {
            new LabeledButtonRow()
                .setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabel).addArgs(container.name)))
                .addButton(button => button
                    .classes.add("button-check")
                    .setTooltip(tooltip => tooltip
                        .addHeading(heading => heading
                            .setText(getTarsTranslation(TarsTranslation.DialogButtonLoadTooltip))))
                    .event.subscribe("activate", () => {
                        this.tarsInstance.loadSaveData(container);
                    }))
                .addButton(button => button
                    .classes.add("button-edit")
                    .setTooltip(tooltip => tooltip
                        .addHeading(heading => heading
                            .setText(getTarsTranslation(TarsTranslation.DialogButtonRenameTooltip))))
                    .event.subscribe("activate", () => {
                        const placeholder = container.name;

                        Prompts.queue(promptGameRenameGeneric, placeholder, placeholder)
                            .then(newName => {
                                if (newName === undefined || newName.length === 0 || newName === placeholder) {
                                    return;
                                }

                                this.TarsMod.renameDataSlot(container, newName);
                            });
                    }))
                .addButton(button => button
                    .classes.add("button-export")
                    .setTooltip(tooltip => tooltip
                        .addHeading(heading => heading
                            .setText(getTarsTranslation(TarsTranslation.DialogButtonExportTooltip))))
                    .event.subscribe("activate", () => {
                        this.TarsMod.exportDataSlot(container);
                    }))
                .addButton(button => button
                    .classes.add("button-delete")
                    .setTooltip(tooltip => tooltip
                        .addHeading(heading => heading
                            .setText(getTarsTranslation(TarsTranslation.DialogButtonDeleteTooltip))))
                    .event.subscribe("activate", async () => {
                        if (!await Prompts.queue(
                            promptDescriptionFactory
                                .priority(PromptPriority.Default)
                                .confirm<[npcName: string]>(this.TarsMod.promptDeleteConfirmation),
                            container.name)) {
                            return;
                        }

                        this.TarsMod.removeDataSlot(container);
                    }))
                .appendTo(this.rows);
        }
    }
}