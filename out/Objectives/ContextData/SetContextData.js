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
            return `SetContextData:${this.type}`;
        }
        async execute(context) {
            context.setData(this.type, this.value);
            this.log.info(`Set ${this.type} to ${this.value}`);
            return IObjective_1.ObjectiveResult.Complete;
        }
    }
    exports.default = SetContextData;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0Q29udGV4dERhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvT2JqZWN0aXZlcy9Db250ZXh0RGF0YS9TZXRDb250ZXh0RGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFJQSxNQUFxQixjQUEwQyxTQUFRLG1CQUFTO1FBRS9FLFlBQTZCLElBQU8sRUFBbUIsS0FBb0M7WUFDMUYsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBRztZQUFtQixVQUFLLEdBQUwsS0FBSyxDQUErQjtRQUUzRixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGtCQUFrQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDbkQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztRQUNqQyxDQUFDO0tBRUQ7SUFoQkQsaUNBZ0JDIn0=