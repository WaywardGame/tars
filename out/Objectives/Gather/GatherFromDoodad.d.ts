import { ItemType } from "game/item/IItem";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import { DoodadSearchMap } from "../../ITars";
import Objective from "../../Objective";
export default class GatherFromDoodad extends Objective {
    private readonly itemType;
    private readonly doodadSearchMap;
    readonly gatherObjectivePriority = 200;
    constructor(itemType: ItemType, doodadSearchMap: DoodadSearchMap);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canGroupTogether(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
}
