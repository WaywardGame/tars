import { NPCType } from "game/entity/npc/INPCs";
import { DoodadType } from "game/doodad/IDoodad";
import type { IslandId } from "game/island/IIsland";
import { TerrainType } from "game/tile/ITerrain";
import type Translation from "language/Translation";
import Button from "ui/component/Button";
import Divider from "ui/component/Divider";
import DoodadDropdown from "ui/component/dropdown/DoodadDropdown";
import IslandDropdown from "ui/component/dropdown/IslandDropdown";
import PlayerDropdown from "ui/component/dropdown/PlayerDropdown";
import TerrainDropdown from "ui/component/dropdown/TerrainDropdown";
import NPCDropdown from "ui/component/dropdown/NPCDropdown";
import { LabelledRow } from "ui/component/LabelledRow";
import { Bound } from "utilities/Decorators";

import { MoveToMode, MoveToType } from "../../modes/MoveTo";
import TarsPanel from "../components/TarsPanel";
import { getTarsTranslation, TarsTranslation, TarsUiSaveDataKey } from "../../ITarsMod";

export default class MoveToPanel extends TarsPanel {

    private readonly dropdownIsland: IslandDropdown<string>;
    private readonly dropdownTerrainType: TerrainDropdown<string>;
    private readonly dropdownDoodad: DoodadDropdown<string>;
    private readonly dropdownNPC: NPCDropdown<string>;
    private readonly dropdownPlayer: PlayerDropdown;

    constructor() {
        super();

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToBase))
            .event.subscribe("activate", async () => {
                await this.TarsMod.tarsInstance?.activateManualMode(new MoveToMode({
                    type: MoveToType.Base,
                }));
                return true;
            })
            .appendTo(this);

        new Divider().appendTo(this);

        new LabelledRow()
            .classes.add("dropdown-label")
            .setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelIsland)))
            .append(this.dropdownIsland = new IslandDropdown(this.TarsMod.saveData.ui[TarsUiSaveDataKey.MoveToIslandDropdown] ?? localIsland.id)
                .event.subscribe("selection", async (_, selection) => {
                    this.TarsMod.saveData.ui[TarsUiSaveDataKey.MoveToIslandDropdown] = selection;
                }))
            .appendTo(this);

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToIsland))
            .event.subscribe("activate", async () => {
                await this.TarsMod.tarsInstance?.activateManualMode(new MoveToMode({
                    type: MoveToType.Island,
                    islandId: this.dropdownIsland.selection as IslandId,
                }));
                return true;
            })
            .appendTo(this);

        new Divider().appendTo(this);

        this.dropdownPlayer = new PlayerDropdown("");

        new LabelledRow()
            .classes.add("dropdown-label")
            .setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelPlayer)))
            .append(this.dropdownPlayer)
            .appendTo(this);

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToPlayer))
            .event.subscribe("activate", async () => {
                await this.TarsMod.tarsInstance?.activateManualMode(new MoveToMode({
                    type: MoveToType.Player,
                    playerIdentifier: this.dropdownPlayer.selection,
                }));
                return true;
            })
            .appendTo(this);

        new Divider().appendTo(this);

        new LabelledRow()
            .classes.add("dropdown-label")
            .setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelDoodad)))
            .append(this.dropdownDoodad = new DoodadDropdown(this.TarsMod.saveData.ui[TarsUiSaveDataKey.MoveToDoodadDropdown] ?? DoodadType.StoneCampfire)
                .event.subscribe("selection", async (_, selection) => {
                    this.TarsMod.saveData.ui[TarsUiSaveDataKey.MoveToDoodadDropdown] = selection;
                }))
            .appendTo(this);

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToDoodad))
            .event.subscribe("activate", async () => {
                await this.TarsMod.tarsInstance?.activateManualMode(new MoveToMode({
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
            .append(this.dropdownTerrainType = new TerrainDropdown(this.TarsMod.saveData.ui[TarsUiSaveDataKey.MoveToTerrainDropdown] ?? TerrainType.Grass)
                .event.subscribe("selection", async (_, selection) => {
                    this.TarsMod.saveData.ui[TarsUiSaveDataKey.MoveToTerrainDropdown] = selection;
                }))
            .appendTo(this);

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToTerrain))
            .event.subscribe("activate", async () => {
                await this.TarsMod.tarsInstance?.activateManualMode(new MoveToMode({
                    type: MoveToType.Terrain,
                    terrainType: this.dropdownTerrainType.selection as TerrainType,
                }));
                return true;
            })
            .appendTo(this);

        new Divider().appendTo(this);

        new LabelledRow()
            .classes.add("dropdown-label")
            .setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelNPC)))
            .append(this.dropdownNPC = new NPCDropdown(this.TarsMod.saveData.ui[TarsUiSaveDataKey.MoveToNPCDropdown] ?? NPCType.Merchant)
                .event.subscribe("selection", async (_, selection) => {
                    this.TarsMod.saveData.ui[TarsUiSaveDataKey.MoveToNPCDropdown] = selection;
                }))
            .appendTo(this);

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToNPC))
            .event.subscribe("activate", async () => {
                await this.TarsMod.tarsInstance?.activateManualMode(new MoveToMode({
                    type: MoveToType.NPC,
                    npcType: this.dropdownNPC.selection as NPCType,
                }));
                return true;
            })
            .appendTo(this);
    }

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelMoveTo;
    }

    protected onSwitchTo() {
        const events = playerManager.event.until(this, "switchAway", "remove");
        events.subscribe("join", this.refresh);
        events.subscribe("leave", this.refresh);
    }

    @Bound
    protected refresh() {
        this.dropdownPlayer.refresh();
        this.dropdownPlayer.options.get(localPlayer.identifier)?.setDisabled(true);
    }
}
