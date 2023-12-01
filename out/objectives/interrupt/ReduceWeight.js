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
define(["require", "exports", "@wayward/game/game/entity/player/IPlayer", "../../core/objective/IObjective", "../../core/objective/Objective", "../utility/OrganizeInventory"], function (require, exports, IPlayer_1, IObjective_1, Objective_1, OrganizeInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReduceWeight extends Objective_1.default {
        constructor(options = {}) {
            super();
            this.options = options;
        }
        getIdentifier() {
            return "ReduceWeight";
        }
        getStatus() {
            return "Reducing weight";
        }
        canSaveChildObjectives() {
            return false;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return true;
        }
        async execute(context) {
            const weightStatus = context.human.getWeightStatus();
            if (weightStatus === IPlayer_1.WeightStatus.None) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            return new OrganizeInventory_1.default({
                allowChests: weightStatus !== IPlayer_1.WeightStatus.Overburdened,
                ...this.options,
            });
        }
    }
    exports.default = ReduceWeight;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkdWNlV2VpZ2h0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvaW50ZXJydXB0L1JlZHVjZVdlaWdodC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFVSCxNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFFbEQsWUFBNkIsVUFBK0MsRUFBRTtZQUM3RSxLQUFLLEVBQUUsQ0FBQztZQURvQixZQUFPLEdBQVAsT0FBTyxDQUEwQztRQUU5RSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGNBQWMsQ0FBQztRQUN2QixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8saUJBQWlCLENBQUM7UUFDMUIsQ0FBQztRQUVlLHNCQUFzQjtZQUNyQyxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFZSx5QkFBeUI7WUFDeEMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRWUsNEJBQTRCLENBQUMsT0FBZ0I7WUFDNUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3JELElBQUksWUFBWSxLQUFLLHNCQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3hDLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7WUFDL0IsQ0FBQztZQUVELE9BQU8sSUFBSSwyQkFBaUIsQ0FBQztnQkFDNUIsV0FBVyxFQUFFLFlBQVksS0FBSyxzQkFBWSxDQUFDLFlBQVk7Z0JBQ3ZELEdBQUcsSUFBSSxDQUFDLE9BQU87YUFDZixDQUFDLENBQUM7UUFDSixDQUFDO0tBRUQ7SUF0Q0QsK0JBc0NDIn0=