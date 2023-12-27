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
define(["require", "exports", "@wayward/game/game/item/IItem", "@wayward/game/language/Dictionary", "@wayward/game/language/Translation", "@wayward/game/game/entity/action/actions/Plant", "../../../core/objective/IObjective", "../../../core/objective/Objective", "./UseItem", "../../core/ReserveItems", "./MoveItemsIntoInventory", "../tile/TillForSeed"], function (require, exports, IItem_1, Dictionary_1, Translation_1, Plant_1, IObjective_1, Objective_1, UseItem_1, ReserveItems_1, MoveItemsIntoInventory_1, TillForSeed_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.gardenMaxTilesChecked = void 0;
    exports.gardenMaxTilesChecked = 1536;
    class PlantSeed extends Objective_1.default {
        constructor(itemOrItemType, maxTilesChecked = exports.gardenMaxTilesChecked) {
            super();
            this.itemOrItemType = itemOrItemType;
            this.maxTilesChecked = maxTilesChecked;
        }
        getIdentifier() {
            return `PlantSeed:${typeof (this.itemOrItemType) === "number" ? IItem_1.ItemType[this.itemOrItemType] : this.itemOrItemType}`;
        }
        getStatus() {
            return `Planting ${typeof (this.itemOrItemType) === "number" ? Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemOrItemType).getString() : this.itemOrItemType.getName()}`;
        }
        async execute(context) {
            const item = typeof (this.itemOrItemType) === "number" ? this.getAcquiredItem(context) : this.itemOrItemType;
            if (!item?.isValid) {
                this.log.error("Invalid seed item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            return [
                new ReserveItems_1.default(item).keepInInventory(),
                new MoveItemsIntoInventory_1.default(item),
                new TillForSeed_1.default(item.type, this.maxTilesChecked),
                new UseItem_1.default(Plant_1.default, item),
            ];
        }
    }
    exports.default = PlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9QbGFudFNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQWlCVSxRQUFBLHFCQUFxQixHQUFHLElBQUksQ0FBQztJQUUxQyxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsY0FBK0IsRUFBbUIsa0JBQXNDLDZCQUFxQjtZQUN6SSxLQUFLLEVBQUUsQ0FBQztZQURvQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFBbUIsb0JBQWUsR0FBZixlQUFlLENBQTRDO1FBRTFJLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2SCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sWUFBWSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDdkssQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7WUFDN0csSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDcEMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztZQUNoQyxDQUFDO1lBRUQsT0FBTztnQkFDTixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFO2dCQUN4QyxJQUFJLGdDQUFzQixDQUFDLElBQUksQ0FBQztnQkFDaEMsSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQztnQkFDaEQsSUFBSSxpQkFBTyxDQUFDLGVBQUssRUFBRSxJQUFJLENBQUM7YUFDeEIsQ0FBQztRQUNILENBQUM7S0FFRDtJQTdCRCw0QkE2QkMifQ==