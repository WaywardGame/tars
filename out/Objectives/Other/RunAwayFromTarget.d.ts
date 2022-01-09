import Entity from "game/entity/Entity";
import type { IVector3 } from "utilities/math/IVector";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class RunAwayFromTarget extends Objective {
    private readonly target;
    private readonly maxRunAwayDistance;
    constructor(target: Entity | IVector3, maxRunAwayDistance?: number);
    getIdentifier(): string;
    getStatus(): string | undefined;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
