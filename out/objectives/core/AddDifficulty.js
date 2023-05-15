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
    class AddDifficulty extends Objective_1.default {
        constructor(difficulty) {
            super();
            this.difficulty = difficulty;
            this.includePositionInHashCode = false;
        }
        getIdentifier() {
            return `AddDifficulty:${this.difficulty}`;
        }
        getStatus() {
            return undefined;
        }
        async execute(context) {
            if (context.calculatingDifficulty) {
                return this.difficulty;
            }
            return IObjective_1.ObjectiveResult.Complete;
        }
    }
    exports.default = AddDifficulty;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkRGlmZmljdWx0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2NvcmUvQWRkRGlmZmljdWx0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFPSCxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFJbkQsWUFBNkIsVUFBa0I7WUFDOUMsS0FBSyxFQUFFLENBQUM7WUFEb0IsZUFBVSxHQUFWLFVBQVUsQ0FBUTtZQUZ0Qiw4QkFBeUIsR0FBWSxLQUFLLENBQUM7UUFJcEUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxPQUFPLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2xDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQzthQUN2QjtZQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7UUFDakMsQ0FBQztLQUVEO0lBeEJELGdDQXdCQyJ9