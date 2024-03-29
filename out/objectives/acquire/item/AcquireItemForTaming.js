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
define(["require", "exports", "../../../core/objective/Objective", "./AcquireItem"], function (require, exports, Objective_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemForTaming extends Objective_1.default {
        constructor(creature) {
            super();
            this.creature = creature;
        }
        getIdentifier() {
            return `AcquireItemForTaming:${this.creature}`;
        }
        getStatus() {
            return `Acquiring an item to use for taming ${this.creature.getName()}`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return AcquireItemForTaming.getItems(context, this.creature).some(itemType => context.isReservedItemType(itemType));
        }
        async execute(context) {
            return AcquireItemForTaming.getItems(context, this.creature)
                .map(item => [new AcquireItem_1.default(item, { requirePlayerCreatedIfCraftable: true }).passAcquireData(this)]);
        }
        static getItems(context, creature) {
            let result = AcquireItemForTaming.cache.get(creature.type);
            if (result === undefined) {
                result = [];
                const acceptedItems = creature.description?.acceptedItems;
                if (acceptedItems) {
                    for (const itemTypeOrGroup of acceptedItems) {
                        if (context.island.items.isGroup(itemTypeOrGroup)) {
                            result = result.concat(Array.from(context.island.items.getGroupItems(itemTypeOrGroup)));
                        }
                        else {
                            result.push(itemTypeOrGroup);
                        }
                    }
                }
                AcquireItemForTaming.cache.set(creature.type, result);
            }
            return result;
        }
    }
    AcquireItemForTaming.cache = new Map();
    exports.default = AcquireItemForTaming;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gb3JUYW1pbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW1Gb3JUYW1pbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBV0gsTUFBcUIsb0JBQXFCLFNBQVEsbUJBQVM7UUFJMUQsWUFBNkIsUUFBa0I7WUFDOUMsS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUUvQyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHVDQUF1QyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDekUsQ0FBQztRQUVlLHlCQUF5QjtZQUN4QyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFZSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUM1RCxPQUFPLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3JILENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE9BQU8sb0JBQW9CLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDO2lCQUMxRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBRSwrQkFBK0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekcsQ0FBQztRQUVNLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBZ0IsRUFBRSxRQUFrQjtZQUMxRCxJQUFJLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3pCLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBRVosTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUM7Z0JBQzFELElBQUksYUFBYSxFQUFFO29CQUNsQixLQUFLLE1BQU0sZUFBZSxJQUFJLGFBQWEsRUFBRTt3QkFDNUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7NEJBQ2xELE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFFeEY7NkJBQU07NEJBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQzt5QkFDN0I7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3REO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDOztJQWhEdUIsMEJBQUssR0FBa0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztzQkFGckQsb0JBQW9CIn0=