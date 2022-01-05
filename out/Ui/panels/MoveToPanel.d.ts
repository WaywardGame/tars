import Translation from "language/Translation";
import TarsPanel from "../components/TarsPanel";
import { TarsTranslation } from "../../ITarsMod";
export default class MoveToPanel extends TarsPanel {
    private readonly dropdownIsland;
    private readonly dropdownTerrainType;
    private readonly dropdownDoodad;
    private readonly dropdownNPC;
    private readonly dropdownPlayer;
    constructor();
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
