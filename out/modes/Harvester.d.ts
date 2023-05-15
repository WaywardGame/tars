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
import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import type { ITarsMode } from "../core/mode/IMode";
import { BaseMode } from "./BaseMode";
export declare class HarvesterMode extends BaseMode implements ITarsMode {
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>>;
}
