import Doodad from "game/doodad/Doodad";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class StartWaterStillDesalination extends Objective {
    private readonly waterStill;
    constructor(waterStill: Doodad);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
