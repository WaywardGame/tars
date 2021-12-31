import Creature from "game/entity/creature/Creature";
import { IVector3 } from "utilities/math/IVector";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
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
    onMove(context: Context): Promise<boolean | import("../../IObjective").IObjective>;
}
