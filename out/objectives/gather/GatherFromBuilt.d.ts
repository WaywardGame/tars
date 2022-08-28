import { DoodadType } from "game/doodad/IDoodad";
import { ItemType } from "game/item/IItem";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class GatherFromBuilt extends Objective {
    private readonly itemType;
    private readonly doodadtype;
    constructor(itemType: ItemType, doodadtype: DoodadType);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
}
