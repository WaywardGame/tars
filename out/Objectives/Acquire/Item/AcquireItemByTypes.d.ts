import { ItemType } from "game/item/IItem";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import AcquireBase from "./AcquireBase";
export default class AcquireItemByTypes extends AcquireBase {
    private readonly itemTypes;
    constructor(itemTypes: ItemType[]);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(): Promise<ObjectiveExecutionResult>;
}
