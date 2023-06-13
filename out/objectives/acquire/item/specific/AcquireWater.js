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
define(["require", "exports", "game/item/IItem", "../../../../core/objective/Objective", "../AcquireItemByGroup"], function (require, exports, IItem_1, Objective_1, AcquireItemByGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireWater extends Objective_1.default {
        constructor(options) {
            super();
            this.options = options;
        }
        getIdentifier() {
            return `AcquireWater:${this.options?.onlySafeToDrink},${this.options?.onlyForDesalination}`;
        }
        getStatus() {
            return "Acquiring water";
        }
        async execute(context) {
            if (this.options?.onlyForDesalination) {
                return [
                    [new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.ContainerOfSeawater, this.options).passAcquireData(this)],
                ];
            }
            if (this.options?.onlySafeToDrink) {
                return [
                    [new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.ContainerOfDesalinatedWater, this.options).passAcquireData(this)],
                    [new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.ContainerOfFilteredWater, this.options).passAcquireData(this)],
                    [new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.ContainerOfPurifiedFreshWater, this.options).passAcquireData(this)],
                ];
            }
            return [
                [new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.ContainerOfDesalinatedWater, this.options).passAcquireData(this)],
                [new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.ContainerOfFilteredWater, this.options).passAcquireData(this)],
                [new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.ContainerOfPurifiedFreshWater, this.options).passAcquireData(this)],
                [new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.ContainerOfSeawater, this.options).passAcquireData(this)],
                [new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.ContainerOfSwampWater, this.options).passAcquireData(this)],
                [new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.ContainerOfUnpurifiedFreshWater, this.options).passAcquireData(this)],
            ];
        }
    }
    exports.default = AcquireWater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZVdhdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL3NwZWNpZmljL0FjcXVpcmVXYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFlSCxNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsT0FBdUM7WUFDaEUsS0FBSyxFQUFFLENBQUM7WUFEaUIsWUFBTyxHQUFQLE9BQU8sQ0FBZ0M7UUFFcEUsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxnQkFBZ0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxlQUFlLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxDQUFDO1FBQ2hHLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxpQkFBaUIsQ0FBQztRQUM3QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUU7Z0JBQ25DLE9BQU87b0JBQ0gsQ0FBQyxJQUFJLDRCQUFrQixDQUFDLHFCQUFhLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDbEcsQ0FBQzthQUNMO1lBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRTtnQkFDL0IsT0FBTztvQkFDSCxDQUFDLElBQUksNEJBQWtCLENBQUMscUJBQWEsQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN2RyxDQUFDLElBQUksNEJBQWtCLENBQUMscUJBQWEsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUVwRyxDQUFDLElBQUksNEJBQWtCLENBQUMscUJBQWEsQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUM1RyxDQUFDO2FBQ0w7WUFFRCxPQUFPO2dCQUNILENBQUMsSUFBSSw0QkFBa0IsQ0FBQyxxQkFBYSxDQUFDLDJCQUEyQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZHLENBQUMsSUFBSSw0QkFBa0IsQ0FBQyxxQkFBYSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXBHLENBQUMsSUFBSSw0QkFBa0IsQ0FBQyxxQkFBYSxDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pHLENBQUMsSUFBSSw0QkFBa0IsQ0FBQyxxQkFBYSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQy9GLENBQUMsSUFBSSw0QkFBa0IsQ0FBQyxxQkFBYSxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pHLENBQUMsSUFBSSw0QkFBa0IsQ0FBQyxxQkFBYSxDQUFDLCtCQUErQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDOUcsQ0FBQztRQUNOLENBQUM7S0FFSjtJQXpDRCwrQkF5Q0MifQ==