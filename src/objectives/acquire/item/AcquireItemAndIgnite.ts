/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import { ItemType } from "game/item/IItem";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import { ItemUtilities, RelatedItemType } from "../../../utilities/Item";
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

    public override canIncludeContextHashCode(): boolean | Set<ItemType> {
        return ItemUtilities.getRelatedItemTypes(this.itemType, RelatedItemType.All);
    }

    public override shouldIncludeContextHashCode(context: Context): boolean {
        return context.isReservedItemType(this.itemType);
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const objectives: IObjective[] = [];

        const itemToIgnite = context.utilities.item.getItemInInventory(context, this.itemType);
        if (itemToIgnite === undefined) {
            objectives.push(new AcquireItem(this.itemType).passAcquireData(this));
        }

        objectives.push(new IgniteItem(itemToIgnite));

        return objectives;
    }

}
