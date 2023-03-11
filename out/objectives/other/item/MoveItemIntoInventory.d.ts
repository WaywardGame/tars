import { IContainer } from "game/item/IItem";
import type Item from "game/item/Item";
import Tile from "game/tile/Tile";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class MoveItemIntoInventory extends Objective {
    private readonly item?;
    private readonly tile?;
    private readonly targetContainer?;
    constructor(item?: Item | undefined, tile?: Tile | undefined, targetContainer?: IContainer | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
