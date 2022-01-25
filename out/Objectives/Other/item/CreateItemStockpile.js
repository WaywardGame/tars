define(["require", "exports", "game/item/IItem", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItem", "../../core/ReserveItems", "../../utility/MoveIntoChest"], function (require, exports, IItem_1, IObjective_1, Objective_1, AcquireItem_1, ReserveItems_1, MoveIntoChest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CreateItemStockpile extends Objective_1.default {
        constructor(itemType, count = 1) {
            super();
            this.itemType = itemType;
            this.count = count;
        }
        getIdentifier() {
            return `CreateItemStockpile:${IItem_1.ItemType[this.itemType]}:${this.count}`;
        }
        getStatus() {
            return undefined;
        }
        async execute(context) {
            const baseItems = [...context.base.chest, ...context.base.intermediateChest]
                .map(chest => context.island.items.getItemsInContainerByType(chest, this.itemType, { includeSubContainers: true }))
                .flat();
            const inventoryItems = context.island.items.getItemsInContainerByType(context.player.inventory, this.itemType, { includeSubContainers: true });
            const acquireCount = this.count - baseItems.length - inventoryItems.length;
            if (acquireCount <= 0) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const objectives = [];
            for (const baseItem of baseItems) {
                objectives.push(new ReserveItems_1.default(baseItem));
            }
            this.log.info(`Acquiring ${IItem_1.ItemType[this.itemType]} x${this.count} for the stockpile. x${acquireCount} needs to be acquired. x${inventoryItems.length} in inventory.`);
            for (let i = 0; i < acquireCount; i++) {
                objectives.push(new AcquireItem_1.default(this.itemType));
                objectives.push(new MoveIntoChest_1.default());
            }
            return objectives;
        }
    }
    exports.default = CreateItemStockpile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlSXRlbVN0b2NrcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vQ3JlYXRlSXRlbVN0b2NrcGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFnQkEsTUFBcUIsbUJBQW9CLFNBQVEsbUJBQVM7UUFFekQsWUFBNkIsUUFBa0IsRUFBbUIsUUFBZ0IsQ0FBQztZQUNsRixLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQW1CLFVBQUssR0FBTCxLQUFLLENBQVk7UUFFbkYsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx1QkFBdUIsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZFLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztpQkFDMUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsS0FBbUIsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztpQkFDaEksSUFBSSxFQUFFLENBQUM7WUFFVCxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUUvSSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQztZQUMzRSxJQUFJLFlBQVksSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO2dCQUNqQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQzVDO1lBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyx3QkFBd0IsWUFBWSwyQkFBMkIsY0FBYyxDQUFDLE1BQU0sZ0JBQWdCLENBQUMsQ0FBQztZQUV2SyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN0QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDaEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLEVBQUUsQ0FBQyxDQUFDO2FBQ3JDO1lBTUQsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUNEO0lBN0NELHNDQTZDQyJ9