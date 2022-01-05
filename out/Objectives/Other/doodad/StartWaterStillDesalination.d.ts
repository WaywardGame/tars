import Doodad from "game/doodad/Doodad";
import Context from "../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
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
