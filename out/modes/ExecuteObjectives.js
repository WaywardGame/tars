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
define(["require", "exports", "../core/objective/IObjective", "../objectives/core/Lambda"], function (require, exports, IObjective_1, Lambda_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExecuteObjectivesMode = void 0;
    class ExecuteObjectivesMode {
        constructor(objectives) {
            this.objectives = objectives;
        }
        async initialize(context, finished) {
            this.finished = finished;
        }
        async determineObjectives(context) {
            return [
                ...this.objectives,
                new Lambda_1.default(async () => {
                    this.finished(true);
                    return IObjective_1.ObjectiveResult.Complete;
                })
            ];
        }
    }
    exports.ExecuteObjectivesMode = ExecuteObjectivesMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZU9iamVjdGl2ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvRXhlY3V0ZU9iamVjdGl2ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQVFILE1BQWEscUJBQXFCO1FBSWpDLFlBQTZCLFVBQXdCO1lBQXhCLGVBQVUsR0FBVixVQUFVLENBQWM7UUFDckQsQ0FBQztRQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZ0IsRUFBRSxRQUFvQztZQUM3RSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUMxQixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWdCO1lBQ2hELE9BQU87Z0JBQ04sR0FBRyxJQUFJLENBQUMsVUFBVTtnQkFDbEIsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO29CQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxDQUFDLENBQUM7YUFDRixDQUFDO1FBQ0gsQ0FBQztLQUVEO0lBckJELHNEQXFCQyJ9