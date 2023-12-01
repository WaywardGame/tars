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

import { promptGameRenameGeneric } from "@wayward/game/game/meta/prompt/PromptDescriptions";
import Prompts from "@wayward/game/game/meta/prompt/Prompts";
import type Translation from "@wayward/game/language/Translation";
import Mod from "@wayward/game/mod/Mod";
import { BlockRow } from "@wayward/game/ui/component/BlockRow";
import Button from "@wayward/game/ui/component/Button";
import Component from "@wayward/game/ui/component/Component";
import Divider from "@wayward/game/ui/component/Divider";
import { LabeledButtonRow } from "@wayward/game/ui/component/LabeledButtonRow";
import { Bound } from "@wayward/utilities/Decorators";
import Files from "@wayward/game/utilities/Files";

import { TARS_ID, TarsTranslation, getTarsTranslation } from "../../ITarsMod";
import TarsMod from "../../TarsMod";
import Tars from "../../core/Tars";
import TarsPanel from "../components/TarsPanel";

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
				.setTooltip(tooltip => tooltip.setText(getTarsTranslation(TarsTranslation.DialogButtonSaveDataTooltip)))
				.event.subscribe("activate", async () => {
					this.TarsMod.addDataSlot(tarsInstance.getSaveDataContainer());
					return true;
				}))
			.append(new Button("label")
				.setText(getTarsTranslation(TarsTranslation.DialogButtonImportData))
				.setTooltip(tooltip => tooltip.setText(getTarsTranslation(TarsTranslation.DialogButtonImportDataTooltip)))
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

	protected onSwitchTo(): void {
		const events = this.TarsMod.event.until(this, "switchAway", "remove");
		events.subscribe("changedGlobalDataSlots", this.refresh);
	}

	@Bound
	protected async refresh(): Promise<void> {
		this.rows.dump();

		for (const container of this.TarsMod.globalSaveData.dataSlots) {
			new LabeledButtonRow()
				.setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabel).addArgs(container.name)))
				.addButton(button => button
					.classes.add("button-check")
					.setTooltip(tooltip => tooltip.setText(getTarsTranslation(TarsTranslation.DialogButtonLoadTooltip)))
					.event.subscribe("activate", () => {
						this.tarsInstance.loadSaveData(container);
					}))
				.addButton(button => button
					.classes.add("button-edit")
					.setTooltip(tooltip => tooltip.setText(getTarsTranslation(TarsTranslation.DialogButtonRenameTooltip)))
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
					.setTooltip(tooltip => tooltip.setText(getTarsTranslation(TarsTranslation.DialogButtonExportTooltip)))
					.event.subscribe("activate", () => {
						this.TarsMod.exportDataSlot(container);
					}))
				.addButton(button => button
					.classes.add("button-delete")
					.setTooltip(tooltip => tooltip.setText(getTarsTranslation(TarsTranslation.DialogButtonDeleteTooltip)))
					.event.subscribe("activate", async () => {
						if (!await Prompts.queue(
							this.TarsMod.promptDeleteConfirmation,
							container.name)) {
							return;
						}

						this.TarsMod.removeDataSlot(container);
					}))
				.appendTo(this.rows);
		}
	}
}
