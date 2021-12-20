import { ItemType } from "game/item/IItem";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class AcquireItemFromDismantle extends Objective {
    private readonly itemType;
    private readonly dismantleItemTypes;
    constructor(itemType: ItemType, dismantleItemTypes: ItemType[]);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
}
