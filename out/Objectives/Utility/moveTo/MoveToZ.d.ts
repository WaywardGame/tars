import { WorldZ } from "game/WorldZ";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class MoveToZ extends Objective {
    private readonly z;
    constructor(z: WorldZ);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
