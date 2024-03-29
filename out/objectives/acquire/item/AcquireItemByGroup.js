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
define(["require", "exports", "game/item/IItem", "../../../utilities/ItemUtilities", "./AcquireBase", "./AcquireItem"], function (require, exports, IItem_1, ItemUtilities_1, AcquireBase_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemByGroup extends AcquireBase_1.default {
        constructor(itemTypeGroup, options = {}) {
            super();
            this.itemTypeGroup = itemTypeGroup;
            this.options = options;
        }
        getIdentifier() {
            return `AcquireItemByGroup:${IItem_1.ItemTypeGroup[this.itemTypeGroup]}`;
        }
        getStatus(context) {
            return `Acquiring ${context.island.items.getItemTypeGroupName(this.itemTypeGroup)}`;
        }
        canIncludeContextHashCode() {
            return ItemUtilities_1.ItemUtilities.getRelatedItemTypesByGroup(this.itemTypeGroup);
        }
        shouldIncludeContextHashCode(context) {
            return this.getItemTypes(context).some(itemType => context.isReservedItemType(itemType));
        }
        async execute(context) {
            let itemTypes = this.getItemTypes(context);
            if (this.options.excludeItemTypes) {
                itemTypes = itemTypes.filter(itemType => !this.options.excludeItemTypes.has(itemType));
            }
            return itemTypes.map(itemType => [new AcquireItem_1.default(itemType, this.options).passAcquireData(this)]);
        }
        getItemTypes(context) {
            let result = AcquireItemByGroup.cache.get(this.itemTypeGroup);
            if (result === undefined) {
                const groupItems = new Set(context.island.items.getGroupItems(this.itemTypeGroup));
                if (this.itemTypeGroup === IItem_1.ItemTypeGroup.Liquid) {
                    for (const itemType of Array.from(groupItems)) {
                        if (context.utilities.item.isSafeToDrinkItemType(context, itemType)) {
                            groupItems.delete(itemType);
                        }
                    }
                }
                result = Array.from(groupItems);
                AcquireItemByGroup.cache.set(this.itemTypeGroup, result);
            }
            return result;
        }
    }
    AcquireItemByGroup.cache = new Map();
    exports.default = AcquireItemByGroup;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1CeUdyb3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL0FjcXVpcmVJdGVtQnlHcm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFXSCxNQUFxQixrQkFBbUIsU0FBUSxxQkFBVztRQUkxRCxZQUE2QixhQUE0QixFQUFtQixVQUF3QyxFQUFFO1lBQ3JILEtBQUssRUFBRSxDQUFDO1lBRG9CLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQW1DO1FBRXRILENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sc0JBQXNCLHFCQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7UUFDbEUsQ0FBQztRQUVNLFNBQVMsQ0FBQyxPQUFnQjtZQUNoQyxPQUFPLGFBQWEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7UUFDckYsQ0FBQztRQUVlLHlCQUF5QjtZQUN4QyxPQUFPLDZCQUFhLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFZSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUM1RCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDMUYsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ2xDLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFpQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ3hGO1lBRUQsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25HLENBQUM7UUFFTyxZQUFZLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxNQUFNLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDOUQsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN6QixNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxxQkFBYSxDQUFDLE1BQU0sRUFBRTtvQkFFaEQsS0FBSyxNQUFNLFFBQVEsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO3dCQUM5QyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRTs0QkFDcEUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQzt5QkFDNUI7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2hDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUN6RDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQzs7SUFsRHVCLHdCQUFLLEdBQW1DLElBQUksR0FBRyxFQUFFLENBQUM7c0JBRnRELGtCQUFrQiJ9