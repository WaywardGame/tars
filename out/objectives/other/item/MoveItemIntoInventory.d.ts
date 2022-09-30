import { IContainer } from "game/item/IItem";
import type Item from "game/item/Item";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class MoveItemIntoInventory extends Objective {
    private readonly item?;
    private readonly point?;
    private readonly targetContainer?;
    constructor(item?: Item | undefined, point?: IVector3 | undefined, targetContainer?: IContainer | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
