import { WorldZ } from "game/WorldZ";
import Context from "../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class MoveToZ extends Objective {
    private readonly z;
    constructor(z: WorldZ);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
