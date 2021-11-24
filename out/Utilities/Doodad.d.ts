import Doodad from "game/doodad/Doodad";
import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
declare class DoodadUtilities {
    getDoodadTypes(doodadTypeOrGroup: DoodadType | DoodadTypeGroup, includeLitAndRevert?: boolean): Set<DoodadType>;
    isWaterStillDesalinating(waterStill: Doodad): boolean;
    isWaterStillDrinkable(waterStill: Doodad): boolean;
}
export declare const doodadUtilities: DoodadUtilities;
export {};
