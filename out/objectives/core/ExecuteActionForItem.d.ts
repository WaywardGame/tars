import type { AnyActionDescription } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { GetActionArguments } from "../../utilities/Action";
import Message from "language/dictionary/Message";
export declare enum ExecuteActionType {
    Generic = 0,
    Doodad = 1,
    Terrain = 2,
    Corpse = 3
}
export interface IExecuteActioGenericAction<T extends AnyActionDescription> {
    action: T;
    args: GetActionArguments<T>;
    expectedMessages?: Set<Message>;
}
export interface IExecuteActionForItemOptions<T extends AnyActionDescription> {
    onlyAllowHarvesting: boolean;
    onlyGatherWithHands: boolean;
    moveAllMatchingItems: boolean;
    genericAction: IExecuteActioGenericAction<T>;
    preRetry: (context: Context) => ObjectiveResult | undefined;
}
export default class ExecuteActionForItem<T extends AnyActionDescription> extends Objective {
    private readonly type;
    private readonly options?;
    protected readonly includeUniqueIdentifierInHashCode: boolean;
    private terrainTileType;
    private readonly itemTypes;
    constructor(type: ExecuteActionType, itemTypes: Set<ItemType> | ItemType[], options?: Partial<IExecuteActionForItemOptions<T>> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
    private executeActionForItem;
    private executeActionCompareInventoryItems;
}
