define(["require", "exports", "../../Objective"], function (require, exports, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Lambda extends Objective_1.default {
        constructor(lambda, difficulty = 1) {
            super();
            this.lambda = lambda;
            this.difficulty = difficulty;
        }
        getIdentifier() {
            return "Lambda";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGFtYmRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9MYW1iZGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBS0EsTUFBcUIsTUFBTyxTQUFRLG1CQUFTO1FBRTVDLFlBQTZCLE1BQStFLEVBQW1CLGFBQWEsQ0FBQztZQUM1SSxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUF5RTtZQUFtQixlQUFVLEdBQVYsVUFBVSxDQUFJO1FBRTdJLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sUUFBUSxDQUFDO1FBQ2pCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTywwQkFBMEIsQ0FBQztRQUNuQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxPQUFPLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2xDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQzthQUN2QjtZQUVELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkMsQ0FBQztLQUVEO0lBMUJELHlCQTBCQyJ9