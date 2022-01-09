import Creature from "game/entity/creature/Creature";
import type { IVector3 } from "utilities/math/IVector";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export interface IMoveToTargetOptions {
    range: number;
    disableStaminaCheck: boolean;
    skipZCheck: boolean;
    allowBoat: boolean;
}
export default class MoveToTarget extends Objective {
    protected target: IVector3;
    protected readonly moveAdjacentToTarget: boolean;
    protected readonly options?: Partial<IMoveToTargetOptions> | undefined;
    private trackedCreature;
    private trackedPosition;
    constructor(target: IVector3, moveAdjacentToTarget: boolean, options?: Partial<IMoveToTargetOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    getPosition(): IVector3;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    trackCreature(creature: Creature | undefined): this;
    onMove(context: Context): Promise<boolean | import("../../core/objective/IObjective").IObjective>;
}
