define(["require", "exports", "../../core/objective/Objective"], function (require, exports, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Lambda extends Objective_1.default {
        constructor(lambda, difficulty = 1) {
            super();
            this.lambda = lambda;
            this.difficulty = difficulty;
            this.includePositionInHashCode = false;
            this.includeUniqueIdentifierInHashCode = true;
        }
        getIdentifier() {
            return `Lambda:${this.difficulty}`;
        }
        getStatus() {
            return "Miscellaneous processing";
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            if (context.calculatingDifficulty) {
                return this.difficulty;
            }
            return this.lambda(context, this);
        }
    }
    exports.default = Lambda;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGFtYmRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9MYW1iZGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBS0EsTUFBcUIsTUFBTyxTQUFRLG1CQUFTO1FBTTVDLFlBQTZCLE1BQStFLEVBQW1CLGFBQWEsQ0FBQztZQUM1SSxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUF5RTtZQUFtQixlQUFVLEdBQVYsVUFBVSxDQUFJO1lBSnBILDhCQUF5QixHQUFZLEtBQUssQ0FBQztZQUV4QyxzQ0FBaUMsR0FBWSxJQUFJLENBQUM7UUFJOUUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxVQUFVLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNwQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sMEJBQTBCLENBQUM7UUFDbkMsQ0FBQztRQUVlLFNBQVM7WUFDeEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtnQkFDbEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO2FBQ3ZCO1lBRUQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuQyxDQUFDO0tBRUQ7SUE5QkQseUJBOEJDIn0=