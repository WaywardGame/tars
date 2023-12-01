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
import type Doodad from "@wayward/game/game/doodad/Doodad";
import type { DoodadTypeGroup } from "@wayward/game/game/doodad/IDoodad";
import { DoodadType } from "@wayward/game/game/doodad/IDoodad";
export declare class DoodadUtilities {
    getDoodadTypes(doodadTypeOrGroup: DoodadType | DoodadTypeGroup, includeLitAndRevert?: boolean): Set<DoodadType>;
    isWaterSourceDoodadBusy(waterSource: Doodad): boolean;
    isWaterSourceDoodadDrinkable(waterStill: Doodad): boolean;
    requiresFire(doodadTypeOrGroup: DoodadType | DoodadTypeGroup): boolean;
}
