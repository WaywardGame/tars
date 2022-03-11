import type ActionExecutor from "game/entity/action/ActionExecutor";
import type actionDescriptions from "game/entity/action/Actions";
import type { IActionDescription } from "game/entity/action/IAction";
import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export declare enum ExecuteActionType {
    Generic = 0,
    Doodad = 1,
    Terrain = 2,
    Corpse = 3
}
export interface IExecuteActionForItemOptions<T extends ActionType> {
    onlyAllowHarvesting: boolean;
    onlyGatherWithHands: boolean;
    actionType: ActionType;
    executor: (context: Context, action: ((typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R, infer AV> ? ActionExecutor<A, E, R, AV> : never)) => void;
}
export default class ExecuteActionForItem<T extends ActionType> extends Objective {
    private readonly type;
    private readonly itemTypes;
    private readonly options?;
    private terrainTileType;
    constructor(type: ExecuteActionType, itemTypes: ItemType[], options?: Partial<IExecuteActionForItemOptions<T>> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
    private executeActionForItem;
    private executeActionCompareInventoryItems;
}
