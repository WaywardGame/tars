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
import { Stat } from "@wayward/game/game/entity/IStats";
import type Context from "../core/context/Context";
export declare class PlayerUtilities {
    getWeight(context: Context): number;
    getMaxWeight(context: Context): number;
    isUsingVehicle(context: Context): boolean;
    isHealthy(context: Context): boolean;
    getRecoverThreshold(context: Context, stat: Stat): number;
    private parseThreshold;
}
