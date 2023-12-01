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
define(["require", "exports", "@wayward/game/game/item/IItem", "../../core/objective/IObjective", "../../core/objective/Objective"], function (require, exports, IItem_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ProvideItems extends Objective_1.default {
        constructor(...itemTypes) {
            super();
            this.includePositionInHashCode = false;
            this.itemTypes = itemTypes;
        }
        getIdentifier() {
            return `ProvideItems:${this.itemTypes.map(itemType => IItem_1.ItemType[itemType]).join(",")}`;
        }
        getStatus() {
            return undefined;
        }
        async execute(context) {
            context.addProvidedItems(this.itemTypes);
            return IObjective_1.ObjectiveResult.Complete;
        }
    }
    exports.default = ProvideItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvdmlkZUl0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9Qcm92aWRlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBWUgsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBTWxELFlBQVksR0FBRyxTQUFxQjtZQUNuQyxLQUFLLEVBQUUsQ0FBQztZQUxnQiw4QkFBeUIsR0FBWSxLQUFLLENBQUM7WUFPbkUsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDNUIsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxnQkFBZ0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxnQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDdkYsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7UUFDakMsQ0FBQztLQUVEO0lBekJELCtCQXlCQyJ9