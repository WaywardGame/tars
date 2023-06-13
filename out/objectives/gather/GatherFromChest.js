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
define(["require", "exports", "game/item/IItem", "language/Dictionary", "language/Translation", "../../core/context/IContext", "../../core/objective/Objective", "../contextData/SetContextData", "../core/ReserveItems", "../other/item/MoveItemIntoInventory"], function (require, exports, IItem_1, Dictionary_1, Translation_1, IContext_1, Objective_1, SetContextData_1, ReserveItems_1, MoveItemIntoInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromChest extends Objective_1.default {
        constructor(itemType, options = {}) {
            super();
            this.itemType = itemType;
            this.options = options;
        }
        getIdentifier(context) {
            return `GatherFromChest:${IItem_1.ItemType[this.itemType]}:${context?.getData(IContext_1.ContextDataType.PrioritizeBaseItems)}:${context?.getData(IContext_1.ContextDataType.NextActionAllowsIntermediateChest)}`;
        }
        getStatus() {
            return `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} from a chest`;
        }
        canIncludeContextHashCode(context, objectiveHashCode) {
            return {
                objectiveHashCode,
                itemTypes: new Set([this.itemType]),
            };
        }
        shouldIncludeContextHashCode(context, objectiveHashCode) {
            return context.isReservedItemType(this.itemType, objectiveHashCode);
        }
        async execute(context, objectiveHashCode) {
            const prioritizeBaseItems = context.getData(IContext_1.ContextDataType.PrioritizeBaseItems);
            let chests = context.base.chest;
            if (!context.getData(IContext_1.ContextDataType.NextActionAllowsIntermediateChest)) {
                chests = chests.concat(context.base.intermediateChest);
            }
            return chests
                .map(chest => {
                const items = context.utilities.item.getItemsInContainerByType(context, chest, this.itemType)
                    .filter(item => {
                    if (context.isHardReservedItem(item)) {
                        return false;
                    }
                    if (this.options.requiredMinDur !== undefined && (item.durability === undefined || item.durability < this.options.requiredMinDur)) {
                        return false;
                    }
                    if (this.options.requirePlayerCreatedIfCraftable) {
                        const canCraft = item.description?.recipe;
                        if (canCraft && !item.crafterIdentifier) {
                            return false;
                        }
                    }
                    if (this.options.willDestroyItem && !context.utilities.item.canDestroyItem(context, item)) {
                        return false;
                    }
                    return true;
                });
                if (items.length > 0) {
                    const item = items[0];
                    return [
                        new ReserveItems_1.default(item).passAcquireData(this).passObjectiveHashCode(objectiveHashCode),
                        new SetContextData_1.default(this.contextDataKey, item),
                        new MoveItemIntoInventory_1.default(item).overrideDifficulty(prioritizeBaseItems ? 5 : undefined),
                    ];
                }
                return undefined;
            })
                .filter(objectives => objectives !== undefined);
        }
    }
    exports.default = GatherFromChest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNoZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlckZyb21DaGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFnQkgsTUFBcUIsZUFBZ0IsU0FBUSxtQkFBUztRQUVyRCxZQUE2QixRQUFrQixFQUFtQixVQUF1QyxFQUFFO1lBQzFHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBa0M7UUFFM0csQ0FBQztRQUVNLGFBQWEsQ0FBQyxPQUE0QjtZQUNoRCxPQUFPLG1CQUFtQixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxPQUFPLEVBQUUsT0FBTyxDQUFDLDBCQUFlLENBQUMsbUJBQW1CLENBQUMsSUFBSSxPQUFPLEVBQUUsT0FBTyxDQUFDLDBCQUFlLENBQUMsaUNBQWlDLENBQUMsRUFBRSxDQUFDO1FBQ3JMLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDO1FBQ25HLENBQUM7UUFFZSx5QkFBeUIsQ0FBQyxPQUFnQixFQUFFLGlCQUF5QjtZQUNwRixPQUFPO2dCQUNOLGlCQUFpQjtnQkFDakIsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ25DLENBQUM7UUFDSCxDQUFDO1FBRWUsNEJBQTRCLENBQUMsT0FBZ0IsRUFBRSxpQkFBeUI7WUFHdkYsT0FBTyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFTTSxLQUFLLENBQUMsT0FB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