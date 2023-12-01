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
define(["require", "exports", "../core/objective/IObjective", "../objectives/utility/moveTo/MoveToBase", "../objectives/utility/OrganizeBase", "../objectives/utility/OrganizeInventory", "../objectives/core/Lambda", "./BaseMode"], function (require, exports, IObjective_1, MoveToBase_1, OrganizeBase_1, OrganizeInventory_1, Lambda_1, BaseMode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TidyUpMode = void 0;
    class TidyUpMode extends BaseMode_1.BaseMode {
        async initialize(_, finished) {
        }
        async determineObjectives(context) {
            const objectives = [];
            objectives.push(...await this.getBuildAnotherChestObjectives(context));
            const tiles = context.utilities.base.getTilesWithItemsNearBase(context);
            if (tiles.totalCount > 0) {
                objectives.push(new OrganizeBase_1.default(tiles.tiles));
            }
            objectives.push(new MoveToBase_1.default());
            objectives.push(new OrganizeInventory_1.default());
            objectives.push(new Lambda_1.default(async () => IObjective_1.ObjectiveResult.Complete).setStatus("Waiting"));
            return objectives;
        }
    }
    exports.TidyUpMode = TidyUpMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlkeVVwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL1RpZHlVcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBY0gsTUFBYSxVQUFXLFNBQVEsbUJBQVE7UUFJaEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7UUFFeEUsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjtZQUNoRCxNQUFNLFVBQVUsR0FBcUMsRUFBRSxDQUFDO1lBRXhELFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBRXZFLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hFLElBQUksS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEQsQ0FBQztZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxvQkFBVSxFQUFFLENBQUMsQ0FBQztZQUVsQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksMkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBRXpDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsNEJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQWN2RixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBQ0Q7SUF0Q0QsZ0NBc0NDIn0=