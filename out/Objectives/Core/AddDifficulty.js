define(["require", "exports", "../../IObjective", "../../Objective"], function (require, exports, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AddDifficulty extends Objective_1.default {
        constructor(difficulty) {
            super();
            this.difficulty = difficulty;
        }
        getIdentifier() {
            return "AddDifficulty";
        }
        getStatus() {
            return undefined;
        }
        isDynamic() {
            return true;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkRGlmZmljdWx0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2NvcmUvQWRkRGlmZmljdWx0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFJQSxNQUFxQixhQUFjLFNBQVEsbUJBQVM7UUFFbkQsWUFBNkIsVUFBa0I7WUFDOUMsS0FBSyxFQUFFLENBQUM7WUFEb0IsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUUvQyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsQ0FBQztRQUN4QixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtnQkFDbEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO2FBQ3ZCO1lBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztRQUNqQyxDQUFDO0tBRUQ7SUExQkQsZ0NBMEJDIn0=