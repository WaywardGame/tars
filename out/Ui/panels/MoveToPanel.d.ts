import Translation from "language/Translation";
import { TarsTranslation } from "../../ITars";
import TarsPanel from "../components/TarsPanel";
export default class MoveToPanel extends TarsPanel {
    private readonly dropdownIsland;
    private readonly dropdownTerrainType;
    private readonly dropdownDoodad;
    private readonly dropdownPlayer;
    constructor();
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
