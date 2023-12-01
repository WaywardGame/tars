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
import type Translation from "@wayward/game/language/Translation";
import { TarsTranslation } from "../../ITarsMod";
import Tars from "../../core/Tars";
import TarsPanel from "../components/TarsPanel";
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
