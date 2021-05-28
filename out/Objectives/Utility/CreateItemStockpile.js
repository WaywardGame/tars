define(["require", "exports", "game/item/IItem", "../../IObjective", "../../Objective", "../acquire/item/AcquireItem", "../core/ReserveItems", "./MoveIntoChest"], function (require, exports, IItem_1, IObjective_1, Objective_1, AcquireItem_1, ReserveItems_1, MoveIntoChest_1) {
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
        async execute(context) {
            const baseItems = [...context.base.chest, ...context.base.intermediateChest]
                .map(chest => itemManager.getItemsInContainerByType(chest, this.itemType, true))
                .flat();
            const inventoryItems = itemManager.getItemsInContainerByType(context.player.inventory, this.itemType, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlSXRlbVN0b2NrcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvQ3JlYXRlSXRlbVN0b2NrcGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFxQixtQkFBb0IsU0FBUSxtQkFBUztRQUV6RCxZQUE2QixRQUFrQixFQUFtQixRQUFnQixDQUFDO1lBQ2xGLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUVuRixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHVCQUF1QixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkUsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztpQkFDMUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDLEtBQW1CLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDN0YsSUFBSSxFQUFFLENBQUM7WUFFVCxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUU1RyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQztZQUMzRSxJQUFJLFlBQVksSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO2dCQUNqQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQzVDO1lBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyx3QkFBd0IsWUFBWSwyQkFBMkIsY0FBYyxDQUFDLE1BQU0sZ0JBQWdCLENBQUMsQ0FBQztZQUV2SyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN0QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDaEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLEVBQUUsQ0FBQyxDQUFDO2FBQ3JDO1lBTUQsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUNEO0lBekNELHNDQXlDQyJ9