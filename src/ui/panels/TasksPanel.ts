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

import { DoodadType } from "@wayward/game/game/doodad/IDoodad";
import { CreatureType } from "@wayward/game/game/entity/creature/ICreature";
import { ItemType } from "@wayward/game/game/item/IItem";
import type Translation from "@wayward/game/language/Translation";
import Button from "@wayward/game/ui/component/Button";
import Divider from "@wayward/game/ui/component/Divider";
import CreatureDropdown from "@wayward/game/ui/component/dropdown/CreatureDropdown";
import DoodadDropdown from "@wayward/game/ui/component/dropdown/DoodadDropdown";
import ItemDropdown from "@wayward/game/ui/component/dropdown/ItemDropdown";
import { LabelledRow } from "@wayward/game/ui/component/LabelledRow";
import { Bound } from "@wayward/utilities/Decorators";

import Tars from "../../core/Tars";
import { getTarsTranslation, TarsTranslation, TarsUiSaveDataKey } from "../../ITarsMod";
import { AcquireItemMode } from "../../modes/AcquireItem";
import { BuildDoodadMode } from "../../modes/BuildDoodad";
import { ExecuteObjectivesMode } from "../../modes/ExecuteObjectives";
import { TameCreatureMode } from "../../modes/TameCreature";
import SailToCivilization from "../../objectives/utility/SailToCivilization";
import TarsPanel from "../components/TarsPanel";

export default class TasksPanel extends TarsPanel {

	private readonly dropdownItemType: ItemDropdown<string>;
	private readonly dropdownDoodadType: DoodadDropdown<string>;
	private readonly dropdownCreature: CreatureDropdown<string>;

	constructor(tarsInstance: Tars) {
		super(tarsInstance);

		new LabelledRow()
			.classes.add("dropdown-label")
			.setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelItem)))
			.append(this.dropdownItemType = new ItemDropdown(this.tarsInstance.saveData.ui[TarsUiSaveDataKey.AcquireItemDropdown] ?? ItemType.Branch)
				.event.subscribe("selection", async (_, selection) => {
					this.tarsInstance.saveData.ui[TarsUiSaveDataKey.AcquireItemDropdown] = selection;
				}))
			.appendTo(this);

		new Button()
			.setText(getTarsTranslation(TarsTranslation.DialogButtonAquireItem))
			.setTooltip(tooltip => tooltip.setText(getTarsTranslation(TarsTranslation.DialogButtonAquireItemTooltip)))
			.event.subscribe("activate", async () => {
				await this.tarsInstance.activateManualMode(new AcquireItemMode(this.dropdownItemType.selection as ItemType));
				return true;
			})
			.appendTo(this);

		new Divider().appendTo(this);

		new LabelledRow()
			.classes.add("dropdown-label")
			.setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelDoodad)))
			.append(this.dropdownDoodadType = new DoodadDropdown(this.tarsInstance.saveData.ui[TarsUiSaveDataKey.BuildDoodadDropdown] ?? DoodadType.GraniteCampfire)
				.event.subscribe("selection", async (_, selection) => {
					this.tarsInstance.saveData.ui[TarsUiSaveDataKey.BuildDoodadDropdown] = selection;
				}))
			.appendTo(this);

		new Button()
			.setText(getTarsTranslation(TarsTranslation.DialogButtonBuildDoodad))
			.setTooltip(tooltip => tooltip.setText(getTarsTranslation(TarsTranslation.DialogButtonBuildDoodadTooltip)))
			.event.subscribe("activate", async () => {
				await this.tarsInstance.activateManualMode(new BuildDoodadMode(this.dropdownDoodadType.selection as DoodadType));
				return true;
			})
			.appendTo(this);

		new Divider().appendTo(this);

		new LabelledRow()
			.classes.add("dropdown-label")
			.setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelCreature)))
			.append(this.dropdownCreature = new CreatureDropdown(this.tarsInstance.saveData.ui[TarsUiSaveDataKey.TameCreatureDropdown] ?? CreatureType.Rabbit)
				.event.subscribe("selection", async (_, selection) => {
					this.tarsInstance.saveData.ui[TarsUiSaveDataKey.TameCreatureDropdown] = selection;
				}))
			.appendTo(this);

		new Button()
			.setText(getTarsTranslation(TarsTranslation.DialogButtonTameCreature))
			.setTooltip(tooltip => tooltip.setText(getTarsTranslation(TarsTranslation.DialogButtonTameCreatureTooltip)))
			.event.subscribe("activate", async () => {
				await this.tarsInstance.activateManualMode(new TameCreatureMode(this.dropdownCreature.selection as CreatureType));
				return true;
			})
			.appendTo(this);

		new Divider().appendTo(this);

		new Button()
			.setText(getTarsTranslation(TarsTranslation.DialogButtonSailToCivilization))
			.setTooltip(tooltip => tooltip.setText(getTarsTranslation(TarsTranslation.DialogButtonSailToCivilizationTooltip)))
			.event.subscribe("activate", async () => {
				await this.tarsInstance.activateManualMode(new ExecuteObjectivesMode([new SailToCivilization()]));
				return true;
			})
			.appendTo(this);
	}

	public getTranslation(): TarsTranslation | Translation {
		return TarsTranslation.DialogPanelTasks;
	}

	protected onSwitchTo(): void {
	}

	@Bound
	protected refresh(): void {
	}
}
