import { ItemType } from "game/item/IItem";
import type Context from "../../core/context/Context";
import type { DoodadSearchMap } from "../../core/ITars";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class GatherFromDoodad extends Objective {
    private readonly itemType;
    private readonly doodadSearchMap;
    constructor(itemType: ItemType, doodadSearchMap: DoodadSearchMap);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canGroupTogether(): boolean;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
}
