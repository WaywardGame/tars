define(["require", "exports", "game/item/IItem", "language/Dictionary", "language/Translation", "game/entity/action/actions/Plant", "../../../core/objective/IObjective", "../../../core/objective/Objective", "./UseItem", "../../core/ReserveItems", "./MoveItemIntoInventory", "../tile/TillForSeed"], function (require, exports, IItem_1, Dictionary_1, Translation_1, Plant_1, IObjective_1, Objective_1, UseItem_1, ReserveItems_1, MoveItemIntoInventory_1, TillForSeed_1) {
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
            if (!item?.isValid()) {
                this.log.error("Invalid seed item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            return [
                new ReserveItems_1.default(item).keepInInventory(),
                new MoveItemIntoInventory_1.default(item),
                new TillForSeed_1.default(item.type, this.maxTilesChecked),
                new UseItem_1.default(Plant_1.default, item),
            ];
        }
    }
    exports.default = PlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9QbGFudFNlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQWVhLFFBQUEscUJBQXFCLEdBQUcsSUFBSSxDQUFDO0lBRTFDLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixjQUErQixFQUFtQixrQkFBc0MsNkJBQXFCO1lBQ3pJLEtBQUssRUFBRSxDQUFDO1lBRG9CLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUFtQixvQkFBZSxHQUFmLGVBQWUsQ0FBNEM7UUFFMUksQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxhQUFhLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxnQkFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZILENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxZQUFZLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUN2SyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUM3RyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUNwQyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsT0FBTztnQkFDTixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFO2dCQUN4QyxJQUFJLCtCQUFxQixDQUFDLElBQUksQ0FBQztnQkFDL0IsSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQztnQkFDaEQsSUFBSSxpQkFBTyxDQUFDLGVBQUssRUFBRSxJQUFJLENBQUM7YUFDeEIsQ0FBQztRQUNILENBQUM7S0FFRDtJQTdCRCw0QkE2QkMifQ==