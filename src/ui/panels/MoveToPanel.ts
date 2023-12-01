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
import { DEFAULT_ISLAND_ID, IslandId } from "@wayward/game/game/island/IIsland";
import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import type Translation from "@wayward/game/language/Translation";
import { BlockRow } from "@wayward/game/ui/component/BlockRow";
import Button from "@wayward/game/ui/component/Button";
import Divider from "@wayward/game/ui/component/Divider";
import { LabelledRow } from "@wayward/game/ui/component/LabelledRow";
import CreatureDropdown from "@wayward/game/ui/component/dropdown/CreatureDropdown";
import DoodadDropdown from "@wayward/game/ui/component/dropdown/DoodadDropdown";
import IslandDropdown from "@wayward/game/ui/component/dropdown/IslandDropdown";
import NPCDropdown from "@wayward/game/ui/component/dropdown/NPCDropdown";
import PlayerDropdown from "@wayward/game/ui/component/dropdown/PlayerDropdown";
import TerrainDropdown from "@wayward/game/ui/component/dropdown/TerrainDropdown";
import { Bound } from "@wayward/utilities/Decorators";

import { CreatureType } from "@wayward/game/game/entity/creature/ICreature";
import { TarsTranslation, TarsUiSaveDataKey, getTarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";
import { MoveToMode, MoveToType } from "../../modes/MoveTo";
import TarsPanel from "../components/TarsPanel";

export default class MoveToPanel extends TarsPanel {

	private readonly dropdownIsland: IslandDropdown<string>;
	private readonly dropdownTerrainType: TerrainDropdown<string>;
	private readonly dropdownDoodad: DoodadDropdown<string>;
	private readonly dropdownCreature: CreatureDropdown<string>;
	private readonly dropdownNPC: NPCDropdown;
	private readonly dropdownPlayer: PlayerDropdown;

	constructor(tarsInstance: Tars) {
		super(tarsInstance);

		new Button()
			.setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToBase))
			.event.subscribe("activate", async () => {
				await this.tarsInstance.activateManualMode(new MoveToMode({
					type: MoveToType.Base,
				}));
				return true;
			})
			.appendTo(this);

		new Divider().appendTo(this);

		new LabelledRow()
			.classes.add("dropdown-label")
			.setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelIsland)))
			.append(this.dropdownIsland = new IslandDropdown(this.tarsInstance.saveData.ui[TarsUiSaveDataKey.MoveToIslandDropdown] ?? localIsland?.id ?? DEFAULT_ISLAND_ID)
				.event.subscribe("selection", async (_, selection) => {
					this.tarsInstance.saveData.ui[TarsUiSaveDataKey.MoveToIslandDropdown] = selection;
				}))
			.appendTo(this);

		new Button()
			.setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToIsland))
			.event.subscribe("activate", async () => {
				await this.tarsInstance.activateManualMode(new MoveToMode({
					type: MoveToType.Island,
					islandId: this.dropdownIsland.selection as IslandId,
				}));
				return true;
			})
			.appendTo(this);

		new Divider().appendTo(this);

		new LabelledRow()
			.classes.add("dropdown-label")
			.setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelPlayer)))
			.append(this.dropdownPlayer = new PlayerDropdown(this.tarsInstance.saveData.ui[TarsUiSaveDataKey.MoveToPlayerDropdown] ?? "")
				.event.subscribe("selection", async (_, selection) => {
					this.tarsInstance.saveData.ui[TarsUiSaveDataKey.MoveToPlayerDropdown] = selection;
				}))
			.appendTo(this);

		new BlockRow()
			.append(new Button()
				.setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToPlayer))
				.event.subscribe("activate", async () => {
					await this.tarsInstance.activateManualMode(new MoveToMode({
						type: MoveToType.Player,
						playerIdentifier: this.dropdownPlayer.selectedOption,
					}));
					return true;
				}))
			.append(new Button()
				.setText(getTarsTranslation(TarsTranslation.DialogButtonFollowPlayer))
				.event.subscribe("activate", async () => {
					await this.tarsInstance.activateManualMode(new MoveToMode({
						type: MoveToType.Player,
						playerIdentifier: this.dropdownPlayer.selectedOption,
						follow: true,
					}));
					return true;
				}))
			.appendTo(this);

		new Divider().appendTo(this);

		new LabelledRow()
			.classes.add("dropdown-label")
			.setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelDoodad)))
			.append(this.dropdownDoodad = new DoodadDropdown(this.tarsInstance.saveData.ui[TarsUiSaveDataKey.MoveToDoodadDropdown] ?? DoodadType.GraniteCampfire)
				.event.subscribe("selection", async (_, selection) => {
					this.tarsInstance.saveData.ui[TarsUiSaveDataKey.MoveToDoodadDropdown] = selection;
				}))
			.appendTo(this);

		new Button()
			.setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToDoodad))
			.event.subscribe("activate", async () => {
				await this.tarsInstance.activateManualMode(new MoveToMode({
					type: MoveToType.Doodad,
					doodadType: this.dropdownDoodad.selection as DoodadType,
				}));
				return true;
			})
			.appendTo(this);

		new Divider().appendTo(this);

		new LabelledRow()
			.classes.add("dropdown-label")
			.setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelTerrain)))
			.append(this.dropdownTerrainType = new TerrainDropdown(this.tarsInstance.saveData.ui[TarsUiSaveDataKey.MoveToTerrainDropdown] ?? TerrainType.Grass)
				.event.subscribe("selection", async (_, selection) => {
					this.tarsInstance.saveData.ui[TarsUiSaveDataKey.MoveToTerrainDropdown] = selection;
				}))
			.appendTo(this);

		new Button()
			.setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToTerrain))
			.event.subscribe("activate", async () => {
				await this.tarsInstance.activateManualMode(new MoveToMode({
					type: MoveToType.Terrain,
					terrainType: this.dropdownTerrainType.selection as TerrainType,
				}));
				return true;
			})
			.appendTo(this);

		new Divider().appendTo(this);

		new LabelledRow()
			.classes.add("dropdown-label")
			.setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelCreature)))
			.append(this.dropdownCreature = new CreatureDropdown(this.tarsInstance.saveData.ui[TarsUiSaveDataKey.MoveToCreatureDropdown] ?? CreatureType.Rabbit)
				.event.subscribe("selection", async (_, selection) => {
					this.tarsInstance.saveData.ui[TarsUiSaveDataKey.MoveToCreatureDropdown] = selection;
				}))
			.appendTo(this);

		new Button()
			.setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToCreature))
			.event.subscribe("activate", async () => {
				await this.tarsInstance.activateManualMode(new MoveToMode({
					type: MoveToType.Creature,
					creatureType: this.dropdownCreature.selection as CreatureType,
				}));
				return true;
			})
			.appendTo(this);

		new Divider().appendTo(this);

		new LabelledRow()
			.classes.add("dropdown-label")
			.setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelNPC)))
			.append(this.dropdownNPC = new NPCDropdown())
			.appendTo(this);

		new BlockRow()
			.append(new Button()
				.setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToNPC))
				.event.subscribe("activate", async () => {
					if (this.dropdownNPC.selectedNPC) {
						await this.tarsInstance.activateManualMode(new MoveToMode({
							type: MoveToType.NPC,
							npc: this.dropdownNPC.selectedNPC,
						}));
					}

					return true;
				}))
			.append(new Button()
				.setText(getTarsTranslation(TarsTranslation.DialogButtonFollowNPC))
				.event.subscribe("activate", async () => {
					if (this.dropdownNPC.selectedNPC) {
						await this.tarsInstance.activateManualMode(new MoveToMode({
							type: MoveToType.NPC,
							npc: this.dropdownNPC.selectedNPC,
							follow: true,
						}));
					}

					return true;
				}))
			.appendTo(this);
	}

	public getTranslation(): TarsTranslation | Translation {
		return TarsTranslation.DialogPanelMoveTo;
	}

	protected onSwitchTo(): void {
		const events = game.playerManager.event.until(this, "switchAway", "remove");
		events.subscribe("join", this.refresh);
		events.subscribe("leave", this.refresh);
	}

	@Bound
	protected refresh(): void {
		this.dropdownPlayer.refresh();
	}
}
