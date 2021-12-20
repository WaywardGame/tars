import Entity from "game/entity/Entity";
import { IVector3 } from "utilities/math/IVector";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class RunAwayFromTarget extends Objective {
    private readonly target;
    private readonly maxRunAwayDistance;
    constructor(target: Entity | IVector3, maxRunAwayDistance?: number);
    getIdentifier(): string;
    getStatus(): string | undefined;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
