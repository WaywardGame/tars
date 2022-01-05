import Item from "game/item/Item";
import { IContainer } from "game/item/IItem";
import Doodad from "game/doodad/Doodad";
import Context from "../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class MoveItem extends Objective {
    private readonly item;
    private readonly targetContainer;
    private readonly source;
    constructor(item: Item | undefined, targetContainer: IContainer, source: Doodad | IVector3);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
