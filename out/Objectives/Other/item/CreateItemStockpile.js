define(["require", "exports", "game/item/IItem", "../../../IObjective", "../../../Objective", "../../acquire/item/AcquireItem", "../../core/ReserveItems", "../../utility/MoveIntoChest"], function (require, exports, IItem_1, IObjective_1, Objective_1, AcquireItem_1, ReserveItems_1, MoveIntoChest_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlSXRlbVN0b2NrcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vQ3JlYXRlSXRlbVN0b2NrcGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFxQixtQkFBb0IsU0FBUSxtQkFBUztRQUV6RCxZQUE2QixRQUFrQixFQUFtQixRQUFnQixDQUFDO1lBQ2xGLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUVuRixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHVCQUF1QixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkUsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO2lCQUMxRSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMseUJBQXlCLENBQUMsS0FBbUIsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUM3RixJQUFJLEVBQUUsQ0FBQztZQUVULE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTVHLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO1lBQzNFLElBQUksWUFBWSxJQUFJLENBQUMsRUFBRTtnQkFDdEIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7Z0JBQ2pDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7YUFDNUM7WUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLHdCQUF3QixZQUFZLDJCQUEyQixjQUFjLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQyxDQUFDO1lBRXZLLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3RDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsRUFBRSxDQUFDLENBQUM7YUFDckM7WUFNRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBQ0Q7SUE3Q0Qsc0NBNkNDIn0=