define(["require", "exports", "../../IObjective", "../../Objective"], function (require, exports, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SetContextData extends Objective_1.default {
        constructor(type, value) {
            super();
            this.type = type;
            this.value = value;
        }
        getIdentifier() {
            return `SetContextData:${this.type}:${this.value}`;
        }
        async execute(context) {
            context.setData(this.type, this.value);
            return IObjective_1.ObjectiveResult.Complete;
        }
    }
    exports.default = SetContextData;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0Q29udGV4dERhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9jb250ZXh0RGF0YS9TZXRDb250ZXh0RGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFJQSxNQUFxQixjQUFlLFNBQVEsbUJBQVM7UUFFcEQsWUFBNkIsSUFBWSxFQUFtQixLQUFzQjtZQUNqRixLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFRO1lBQW1CLFVBQUssR0FBTCxLQUFLLENBQWlCO1FBRWxGLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sa0JBQWtCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztRQUNqQyxDQUFDO0tBRUQ7SUFmRCxpQ0FlQyJ9