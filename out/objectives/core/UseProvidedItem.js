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
define(["require", "exports", "@wayward/game/game/item/IItem", "@wayward/game/language/Dictionary", "@wayward/game/language/Translation", "../../core/objective/IObjective", "../../core/objective/Objective"], function (require, exports, IItem_1, Dictionary_1, Translation_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UseProvidedItem extends Objective_1.default {
        constructor(itemType) {
            super();
            this.itemType = itemType;
            this.includePositionInHashCode = false;
        }
        getIdentifier(context) {
            return `UseProvidedItem:${IItem_1.ItemType[this.itemType]}:${context?.state.providedItems?.get(this.itemType)}`;
        }
        getStatus() {
            return `Using ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()}`;
        }
        canIncludeContextHashCode(context, objectiveHashCode) {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return context.isReservedItemType(this.itemType);
        }
        async execute(context) {
            return context.tryUseProvidedItems(this.itemType) ? IObjective_1.ObjectiveResult.Complete : IObjective_1.ObjectiveResult.Impossible;
        }
    }
    exports.default = UseProvidedItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlUHJvdmlkZWRJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9Vc2VQcm92aWRlZEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBYUgsTUFBcUIsZUFBZ0IsU0FBUSxtQkFBUztRQUlyRCxZQUE2QixRQUFrQjtZQUM5QyxLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBRnRCLDhCQUF5QixHQUFZLEtBQUssQ0FBQztRQUlwRSxDQUFDO1FBRU0sYUFBYSxDQUFDLE9BQTRCO1lBQ2hELE9BQU8sbUJBQW1CLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sRUFBRSxLQUFLLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztRQUN6RyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sU0FBUyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUNsRixDQUFDO1FBRWUseUJBQXlCLENBQUMsT0FBZ0IsRUFBRSxpQkFBeUI7WUFDcEYsT0FBTyxJQUFJLENBQUM7UUFLYixDQUFDO1FBRWUsNEJBQTRCLENBQUMsT0FBZ0I7WUFDNUQsT0FBTyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE9BQU8sT0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsNEJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLDRCQUFlLENBQUMsVUFBVSxDQUFDO1FBQzNHLENBQUM7S0FFRDtJQWhDRCxrQ0FnQ0MifQ==