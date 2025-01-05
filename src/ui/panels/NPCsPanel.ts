import { EventHandler } from "@wayward/game/event/EventManager";
import RemoveControllableNPC from "@wayward/game/game/entity/action/actions/RemoveControllableNPC";
import Island from "@wayward/game/game/island/Island";
import Prompts from "@wayward/game/game/meta/prompt/Prompts";
import type Translation from "@wayward/game/language/Translation";
import Button from "@wayward/game/ui/component/Button";
import Component from "@wayward/game/ui/component/Component";
import Divider from "@wayward/game/ui/component/Divider";
import { LabeledButtonRow } from "@wayward/game/ui/component/LabeledButtonRow";
import { Bound } from "@wayward/utilities/Decorators";

import Mod from "@wayward/game/mod/Mod";
import { TARS_ID, TarsTranslation, getTarsTranslation } from "../../ITarsMod";
import type TarsMod from "../../TarsMod";
import type { TarsNPC } from "../../core/Tars";
import type Tars from "../../core/Tars";
import type TarsDialog from "../TarsDialog";
import TarsPanel from "../components/TarsPanel";

export default class NPCsPanel extends TarsPanel {

	@Mod.instance<TarsMod>(TARS_ID)
	public readonly TarsMod: TarsMod;

	private readonly rows: Component;

	constructor(tarsInstance: Tars) {
		super(tarsInstance);

		new Button()
			.setText(getTarsTranslation(TarsTranslation.DialogButtonSpawnNPC))
			.setTooltip(tooltip => tooltip.setText(getTarsTranslation(TarsTranslation.DialogButtonSpawnNPCTooltip)))
			.event.subscribe("activate", async () => {
				this.TarsMod.spawnNpc();
				return true;
			})
			.appendTo(this);

		new Divider().appendTo(this);

		this.rows = new Component()
			// spacetech why? -love, chiri
			.style.set("display", "grid")
			.style.set("row-gap", "5px")
			.style.set("column-count", "1")
			.appendTo(this);
	}

	public getTranslation(): TarsTranslation | Translation {
		return TarsTranslation.DialogPanelNPCs;
	}

	protected onSwitchTo(): void {
		for (const island of game.islands.active) {
			this.onIslandActivated(island);
		}
	}

	@EventHandler(Island, "activated")
	protected onIslandActivated(island: Island): void {
		const events = island.npcs.event.until(this, "switchAway", "remove");
		events.subscribe("create", this.refresh);
		events.subscribe("remove", this.refresh);

		void this.refresh();
	}

	@EventHandler(Island, "deactivated")
	protected onIslandDeactivated(island: Island): void {
		island.npcs.event.unsubscribe("create", this.refresh);
		island.npcs.event.unsubscribe("remove", this.refresh);

		void this.refresh();
	}

	@Bound
	protected async refresh(): Promise<void> {
		// ensure the refresh occurs after the npc is removed from the manager
		if (!await this.sleep(10)) {
			return;
		}

		this.rows.dump();

		const nonPlayerHumans = game.getNonPlayerHumans();
		for (const human of nonPlayerHumans) {
			const npc = human.asNPC;
			if (!npc) {
				continue;
			}

			const tarsInstance = (npc as TarsNPC).tarsInstance;
			if (tarsInstance === undefined) {
				continue;
			}

			const blockRow = new LabeledButtonRow()
				.setLabel(label => label.setText(human.getName()))
				.addButton(button => button
					.classes.add("button-gear")
					.setTooltip(tooltip => tooltip.setText(getTarsTranslation(TarsTranslation.DialogButtonConfigurationTooltip)))
					.event.subscribe("activate", () => {
						gameScreen?.dialogs.open<TarsDialog>(this.TarsMod.dialogMain, undefined, tarsInstance.dialogSubId)?.initialize(tarsInstance);
					}))
				.addButton(button => button
					.classes.add("button-delete")
					.setTooltip(tooltip => tooltip.setText(getTarsTranslation(TarsTranslation.DialogButtonDeleteTooltip)))
					.event.subscribe("activate", async () => {
						if (!await Prompts.queue(
							this.TarsMod.promptDeleteConfirmation,
							human.getName())) {
							return;
						}

						await RemoveControllableNPC.execute(localPlayer, npc);
					}))
				.appendTo(this.rows);

			human.event.until(blockRow.label, "remove")
				.subscribe("renamed", () => {
					blockRow.label.setText(human.getName());
				});
		}
	}
}
