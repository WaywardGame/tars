import type Doodad from "game/doodad/Doodad";
import type { DoodadTypeGroup } from "game/doodad/IDoodad";
import { DoodadType } from "game/doodad/IDoodad";
export declare class DoodadUtilities {
    getDoodadTypes(doodadTypeOrGroup: DoodadType | DoodadTypeGroup, includeLitAndRevert?: boolean): Set<DoodadType>;
    isWaterStillDesalinating(waterStill: Doodad): boolean;
    isWaterStillDrinkable(waterStill: Doodad): boolean;
}
