import type Doodad from "game/doodad/Doodad";
import type Context from "../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class StartSolarStill extends Objective {
    private readonly solarStill;
    constructor(solarStill: Doodad);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
