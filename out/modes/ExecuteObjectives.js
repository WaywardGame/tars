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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZU9iamVjdGl2ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvRXhlY3V0ZU9iamVjdGl2ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU1BLE1BQWEscUJBQXFCO1FBSTlCLFlBQTZCLFVBQXdCO1lBQXhCLGVBQVUsR0FBVixVQUFVLENBQWM7UUFDckQsQ0FBQztRQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZ0IsRUFBRSxRQUFvQztZQUMxRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUM3QixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWdCO1lBQzdDLE9BQU87Z0JBQ0gsR0FBRyxJQUFJLENBQUMsVUFBVTtnQkFDbEIsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO29CQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNwQyxDQUFDLENBQUM7YUFDTCxDQUFDO1FBQ04sQ0FBQztLQUVKO0lBckJELHNEQXFCQyJ9