import { ItemType } from "game/item/IItem";
import Creature from "game/entity/creature/Creature";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
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
