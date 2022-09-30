import type Translation from "language/Translation";
import TarsPanel from "../components/TarsPanel";
import { TarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";
export default class MoveToPanel extends TarsPanel {
    private readonly dropdownIsland;
    private readonly dropdownTerrainType;
    private readonly dropdownDoodad;
    private readonly dropdownCreature;
    private readonly dropdownNPC;
    private readonly dropdownPlayer;
    constructor(tarsInstance: Tars);
    getTranslation(): TarsTranslation | Translation;
    protected onSwitchTo(): void;
    protected refresh(): void;
}
