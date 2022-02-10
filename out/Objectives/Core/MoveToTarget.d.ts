import Corpse from "game/entity/creature/corpse/Corpse";
import Item from "game/item/Item";
import type { IVector3 } from "utilities/math/IVector";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export interface IMoveToTargetOptions {
    range: number;
    disableStaminaCheck: boolean;
    disableTracking: boolean;
    allowBoat: boolean;
    idleIfAlreadyThere: boolean;
    skipZCheck: boolean;
    changeZ: number;
}
export default class MoveToTarget extends Objective {
    protected target: IVector3;
    protected readonly moveAdjacentToTarget: boolean;
    protected readonly options?: Partial<IMoveToTargetOptions> | undefined;
    private trackedCreature;
    private trackedCorpse;
    private trackedItem;
    private trackedPosition;
    constructor(target: IVector3, moveAdjacentToTarget: boolean, options?: Partial<IMoveToTargetOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    getPosition(): IVector3;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    trackItem(item: Item | undefined): this;
    onItemRemoved(context: Context, item: Item): boolean;
    onCorpseRemoved(context: Context, corpse: Corpse): boolean;
    onMove(context: Context): Promise<boolean | import("../../core/objective/IObjective").IObjective>;
}
