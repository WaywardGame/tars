define(["require", "exports", "game/entity/action/actions/Dig", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/Lambda", "../../core/MoveToTarget", "../item/UseItem", "./ClearTile", "../../acquire/item/AcquireInventoryItem"], function (require, exports, Dig_1, IObjective_1, Objective_1, Lambda_1, MoveToTarget_1, UseItem_1, ClearTile_1, AcquireInventoryItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DigTile extends Objective_1.default {
        constructor(target, options) {
            super();
            this.target = target;
            this.options = options;
        }
        getIdentifier() {
            return `DigTile:${this.target.x},${this.target.y},${this.target.z}`;
        }
        getStatus() {
            return `Digging ${this.target.x},${this.target.y},${this.target.z}`;
        }
        async execute(context) {
            const objectives = [];
            objectives.push(new AcquireInventoryItem_1.default("shovel"));
            objectives.push(new MoveToTarget_1.default(this.target, true));
            objectives.push(new ClearTile_1.default(this.target));
            objectives.push(new UseItem_1.default(Dig_1.default, context.inventory.shovel));
            const digUntilTypeIsNot = this.options?.digUntilTypeIsNot;
            if (digUntilTypeIsNot !== undefined) {
                objectives.push(new Lambda_1.default(async () => {
                    if (digUntilTypeIsNot === this.target.type) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(this));
            }
            return objectives;
        }
    }
    exports.default = DigTile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlnVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL3RpbGUvRGlnVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFrQkEsTUFBcUIsT0FBUSxTQUFRLG1CQUFTO1FBRTdDLFlBQTZCLE1BQVksRUFBbUIsT0FBa0M7WUFDN0YsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBTTtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUEyQjtRQUU5RixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLFdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyRSxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JFLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFFcEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXJELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRTVDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLGFBQUcsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFNUQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDO1lBQzFELElBQUksaUJBQWlCLEtBQUssU0FBUyxFQUFFO2dCQUNwQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDckMsSUFBSSxpQkFBaUIsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTt3QkFDM0MsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztxQkFDL0I7b0JBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDcEI7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUF2Q0QsMEJBdUNDIn0=