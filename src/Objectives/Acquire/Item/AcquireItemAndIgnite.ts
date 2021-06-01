import { ItemType } from "game/item/IItem";
import { Dictionary } from "language/Dictionaries";
import Translation from "language/Translation";

import Context from "../../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
import { getItemInInventory } from "../../../utilities/Item";
import IgniteItem from "../../other/IgniteItem";

import AcquireItem from "./AcquireItem";

/**
 * Acquires an item for the specified type and ignites it
 */
export default class AcquireItemAndIgnite extends Objective {

    constructor(private readonly itemType: ItemType) {
        super();
    }

    public getIdentifier(): string {
        return `AcquireItemAndIgnite:${ItemType[this.itemType]}`;
    }

    public getStatus(): string {
        return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} and igniting it`;
    }

    public canIncludeContextHashCode(): boolean {
        return true;
    }

    public shouldIncludeContextHashCode(context: Context): boolean {
        return context.isReservedItemType(this.itemType);
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const objectives: IObjective[] = [];

        const itemToIgnite = getItemInInventory(context, this.itemType);
        if (itemToIgnite === undefined) {
            objectives.push(new AcquireItem(this.itemType).setContextDataKey(this.getHashCode()));
        }

        objectives.push(new IgniteItem(itemToIgnite));

        return objectives;
    }

}
