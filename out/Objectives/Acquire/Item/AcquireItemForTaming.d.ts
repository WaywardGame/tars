import { ItemType } from "game/item/IItem";
import Creature from "game/entity/creature/Creature";
import Context from "../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class AcquireItemForTaming extends Objective {
    private readonly creature;
    private static readonly cache;
    constructor(creature: Creature);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    static getItems(context: Context, creature: Creature): ItemType[];
}
