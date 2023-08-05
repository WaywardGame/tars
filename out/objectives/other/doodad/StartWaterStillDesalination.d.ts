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
import type Doodad from "game/doodad/Doodad";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export interface IStartWaterStillDesalinationOptions {
    disableAttaching: boolean;
    disablePouring: boolean;
    disableStarting: boolean;
    forceStarting: boolean;
    forceStoke: boolean;
}
export default class StartWaterStillDesalination extends Objective {
    private readonly waterStill;
    private readonly options;
    constructor(waterStill: Doodad, options?: Partial<IStartWaterStillDesalinationOptions>);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
