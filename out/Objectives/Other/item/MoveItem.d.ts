import Item from "game/item/Item";
import { IContainer } from "game/item/IItem";
import Doodad from "game/doodad/Doodad";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class MoveItem extends Objective {
    private readonly item;
    private readonly targetContainer;
    private readonly source;
    constructor(item: Item | undefined, targetContainer: IContainer, source: Doodad | IVector3);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
