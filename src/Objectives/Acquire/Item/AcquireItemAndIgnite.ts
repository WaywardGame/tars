import { ItemType } from "game/item/IItem";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import Context from "../../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
import { itemUtilities } from "../../../utilities/Item";
import IgniteItem from "../../other/item/IgniteItem";
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

    public getStatus(): string | undefined {
        return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} and igniting it`;
    }

    public override canIncludeContextHashCode(): boolean {
        return true;
    }

    public override shouldIncludeContextHashCode(context: Context): boolean {
        return context.isReservedItemType(this.itemType);
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const objectives: IObjective[] = [];

        const itemToIgnite = itemUtilities.getItemInInventory(context, this.itemType);
        if (itemToIgnite === undefined) {
            objectives.push(new AcquireItem(this.itemType).setContextDataKey(this.getHashCode()));
        }

        objectives.push(new IgniteItem(itemToIgnite));

        return objectives;
    }

}
