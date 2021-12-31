define(["require", "exports", "../../../Objective", "./AcquireItem"], function (require, exports, Objective_1, AcquireItem_1) {
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
            var _a;
            let result = AcquireItemForTaming.cache.get(creature.type);
            if (result === undefined) {
                result = [];
                const acceptedItems = (_a = creature.description()) === null || _a === void 0 ? void 0 : _a.acceptedItems;
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
    exports.default = AcquireItemForTaming;
    AcquireItemForTaming.cache = new Map();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gb3JUYW1pbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW1Gb3JUYW1pbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0EsTUFBcUIsb0JBQXFCLFNBQVEsbUJBQVM7UUFJMUQsWUFBNkIsUUFBa0I7WUFDOUMsS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUUvQyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHVDQUF1QyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDekUsQ0FBQztRQUVlLHlCQUF5QjtZQUN4QyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFZSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUM1RCxPQUFPLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3JILENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE9BQU8sb0JBQW9CLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDO2lCQUMxRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBRSwrQkFBK0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekcsQ0FBQztRQUVNLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBZ0IsRUFBRSxRQUFrQjs7WUFDMUQsSUFBSSxNQUFNLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0QsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN6QixNQUFNLEdBQUcsRUFBRSxDQUFDO2dCQUVaLE1BQU0sYUFBYSxHQUFHLE1BQUEsUUFBUSxDQUFDLFdBQVcsRUFBRSwwQ0FBRSxhQUFhLENBQUM7Z0JBQzVELElBQUksYUFBYSxFQUFFO29CQUNsQixLQUFLLE1BQU0sZUFBZSxJQUFJLGFBQWEsRUFBRTt3QkFDNUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7NEJBQ2xELE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFFeEY7NkJBQU07NEJBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQzt5QkFDN0I7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3REO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDOztJQWxERix1Q0FtREM7SUFqRHdCLDBCQUFLLEdBQWtDLElBQUksR0FBRyxFQUFFLENBQUMifQ==