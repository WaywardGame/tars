import Corpse from "game/entity/creature/corpse/Corpse";
import Creature from "game/entity/creature/Creature";
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
    equipWeapons: boolean;
    skipZCheck: boolean;
    changeZ: number;
    reverse: boolean;
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
    getIdentifier(context: Context | undefined): string;
    getStatus(context: Context): string | undefined;
    getPosition(): IVector3;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    trackItem(item: Item | undefined): this;
    onItemRemoved(context: Context, item: Item): boolean;
    onCreatureRemoved(context: Context, creature: Creature): boolean;
    onCorpseRemoved(context: Context, corpse: Corpse): boolean;
    onMove(context: Context): Promise<boolean | import("../../core/objective/IObjective").IObjective>;
}
