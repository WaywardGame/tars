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
define(["require", "exports", "@wayward/game/game/item/IItem", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItem", "../../core/ReserveItems", "../../utility/MoveIntoChest"], function (require, exports, IItem_1, IObjective_1, Objective_1, AcquireItem_1, ReserveItems_1, MoveIntoChest_1) {
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
                .map(chest => context.utilities.item.getItemsInContainerByType(context, chest, this.itemType))
                .flat();
            const inventoryItems = context.utilities.item.getItemsInContainerByType(context, context.human.inventory, this.itemType);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlSXRlbVN0b2NrcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vQ3JlYXRlSXRlbVN0b2NrcGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFrQkgsTUFBcUIsbUJBQW9CLFNBQVEsbUJBQVM7UUFFekQsWUFBNkIsUUFBa0IsRUFBbUIsUUFBZ0IsQ0FBQztZQUNsRixLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQW1CLFVBQUssR0FBTCxLQUFLLENBQVk7UUFFbkYsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx1QkFBdUIsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3ZFLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztpQkFDMUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxFQUFFLEtBQW1CLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUMzRyxJQUFJLEVBQUUsQ0FBQztZQUVULE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFekgsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUM7WUFDM0UsSUFBSSxZQUFZLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQztZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDbEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUM3QyxDQUFDO1lBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyx3QkFBd0IsWUFBWSwyQkFBMkIsY0FBYyxDQUFDLE1BQU0sZ0JBQWdCLENBQUMsQ0FBQztZQUV2SyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3ZDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsRUFBRSxDQUFDLENBQUM7WUFDdEMsQ0FBQztZQU1ELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FDRDtJQTdDRCxzQ0E2Q0MifQ==