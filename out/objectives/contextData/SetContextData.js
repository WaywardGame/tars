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
define(["require", "exports", "../../core/objective/IObjective", "../../core/objective/Objective"], function (require, exports, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SetContextData extends Objective_1.default {
        constructor(type, value) {
            super();
            this.type = type;
            this.value = value;
            this.includePositionInHashCode = false;
        }
        getIdentifier() {
            return `SetContextData:${this.type}=${this.value}`;
        }
        getStatus() {
            return undefined;
        }
        async execute(context) {
            context.setData(this.type, this.value);
            return IObjective_1.ObjectiveResult.Complete;
        }
    }
    exports.default = SetContextData;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0Q29udGV4dERhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9jb250ZXh0RGF0YS9TZXRDb250ZXh0RGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFPSCxNQUFxQixjQUFlLFNBQVEsbUJBQVM7UUFJcEQsWUFBNkIsSUFBWSxFQUFtQixLQUFzQjtZQUNqRixLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFRO1lBQW1CLFVBQUssR0FBTCxLQUFLLENBQWlCO1lBRnpELDhCQUF5QixHQUFZLEtBQUssQ0FBQztRQUlwRSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGtCQUFrQixJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwRCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztRQUNqQyxDQUFDO0tBRUQ7SUFyQkQsaUNBcUJDIn0=