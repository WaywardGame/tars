import { DoodadType } from "game/doodad/IDoodad";
import { IslandId } from "game/island/IIsland";
import { TerrainType } from "game/tile/ITerrain";
import Translation from "language/Translation";
import Button from "ui/component/Button";
import Divider from "ui/component/Divider";
import DoodadDropdown from "ui/component/dropdown/DoodadDropdown";
import IslandDropdown from "ui/component/dropdown/IslandDropdown";
import PlayerDropdown from "ui/component/dropdown/PlayerDropdown";
import TerrainDropdown from "ui/component/dropdown/TerrainDropdown";
import { LabelledRow } from "ui/component/LabelledRow";
import { Bound } from "utilities/Decorators";
import { getTarsTranslation, TarsTranslation, TarsUiSaveDataKey } from "../../ITars";
import { MoveToMode, MoveToType } from "../../mode/modes/MoveTo";
import TarsPanel from "../components/TarsPanel";


export default class MoveToPanel extends TarsPanel {

    private readonly dropdownIsland: IslandDropdown<string>;
    private readonly dropdownTerrainType: TerrainDropdown<string>;
    private readonly dropdownDoodad: DoodadDropdown<string>;
    private readonly dropdownPlayer: PlayerDropdown<string>;

    constructor() {
        super();

        new LabelledRow()
            .classes.add("dropdown-label")
            .setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelIsland)))
            .append(this.dropdownIsland = new IslandDropdown(this.TARS.saveData.ui[TarsUiSaveDataKey.MoveToIslandDropdown] ?? localIsland.id)
                .event.subscribe("selection", async (_, selection) => {
                    this.TARS.saveData.ui[TarsUiSaveDataKey.MoveToIslandDropdown] = selection;
                }))
            .appendTo(this);

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToIsland))
            .event.subscribe("activate", async () => {
                console.log("this.dropdownIsland.selection", this.dropdownIsland.selection);
                await this.TARS.activateManualMode(new MoveToMode({
                    type: MoveToType.Island,
                    islandId: this.dropdownIsland.selection as IslandId,
                }));
                return true;
            })
            .appendTo(this);

        new Divider().appendTo(this);

        new LabelledRow()
            .classes.add("dropdown-label")
            .setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelTerrain)))
            .append(this.dropdownTerrainType = new TerrainDropdown(this.TARS.saveData.ui[TarsUiSaveDataKey.MoveToTerrainDropdown] ?? TerrainType.Grass)
                .event.subscribe("selection", async (_, selection) => {
                    this.TARS.saveData.ui[TarsUiSaveDataKey.MoveToTerrainDropdown] = selection;
                }))
            .appendTo(this);

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToTerrain))
            .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveToMode({
                    type: MoveToType.Terrain,
                    terrainType: this.dropdownTerrainType.selection as TerrainType,
                }));
                return true;
            })
            .appendTo(this);

        new Divider().appendTo(this);

        new LabelledRow()
            .classes.add("dropdown-label")
            .setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelDoodad)))
            .append(this.dropdownDoodad = new DoodadDropdown(this.TARS.saveData.ui[TarsUiSaveDataKey.MoveToDoodadDropdown] ?? DoodadType.StoneCampfire)
                .event.subscribe("selection", async (_, selection) => {
                    this.TARS.saveData.ui[TarsUiSaveDataKey.MoveToDoodadDropdown] = selection;
                }))
            .appendTo(this);

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToDoodad))
            .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveToMode({
                    type: MoveToType.Doodad,
                    doodadType: this.dropdownDoodad.selection as DoodadType,
                }));
                return true;
            })
            .appendTo(this);

        new Divider().appendTo(this);

        this.dropdownPlayer = new PlayerDropdown("");
        this.dropdownPlayer.options.get(localPlayer.identifier)?.setDisabled(true);

        new LabelledRow()
            .classes.add("dropdown-label")
            .setLabel(label => label.setText(getTarsTranslation(TarsTranslation.DialogLabelPlayer)))
            .append(this.dropdownPlayer)
            .appendTo(this);

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToPlayer))
            .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveToMode({
                    type: MoveToType.Player,
                    playerIdentifier: this.dropdownPlayer.selection as string,
                }));
                return true;
            })
            .appendTo(this);

        new Divider().appendTo(this);

        new Button()
            .setText(getTarsTranslation(TarsTranslation.DialogButtonMoveToBase))
            .event.subscribe("activate", async () => {
                await this.TARS.activateManualMode(new MoveToMode({
                    type: MoveToType.Base,
                }));
                return true;
            })
            .appendTo(this);
    }

    public getTranslation(): TarsTranslation | Translation {
        return TarsTranslation.DialogPanelMoveTo;
    }

    protected onSwitchTo() {
    }

    @Bound
    protected refresh() {
    }
}
