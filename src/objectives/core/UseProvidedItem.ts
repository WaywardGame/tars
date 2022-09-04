import { ItemType } from "game/item/IItem";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { ItemUtilities, RelatedItemType } from "../../utilities/Item";

/**
 * Trys to use a provided item
 */
export default class UseProvidedItem extends Objective {

    public override readonly includePositionInHashCode: boolean = false;

    constructor(private readonly itemType: ItemType) {
        super();
    }

    public getIdentifier(): string {
        return `UseProvidedItem:${ItemType[this.itemType]}`;
    }

    public getStatus(): string | undefined {
        return `Using ${Translation.nameOf(Dictionary.Item, this.itemType).getString()}`;
    }

    public override canIncludeContextHashCode() {
        return ItemUtilities.getRelatedItemTypes(this.itemType, RelatedItemType.All);
    }

    public override shouldIncludeContextHashCode(context: Context): boolean {
        return context.isReservedItemType(this.itemType);
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        return context.tryUseProvidedItems(this.itemType) ? ObjectiveResult.Complete : ObjectiveResult.Impossible;
    }

}
