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
define(["require", "exports", "@wayward/game/game/item/IItem", "@wayward/game/language/Dictionary", "@wayward/game/language/Translation", "../../core/context/IContext", "../../core/objective/Objective", "../contextData/SetContextData", "../core/ReserveItems", "../other/item/MoveItemIntoInventory"], function (require, exports, IItem_1, Dictionary_1, Translation_1, IContext_1, Objective_1, SetContextData_1, ReserveItems_1, MoveItemIntoInventory_1) {
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