define(["require", "exports", "game/entity/action/IAction", "utilities/game/TileHelpers", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItemForAction", "../../analyze/AnalyzeInventory", "../../core/Lambda", "../../core/MoveToTarget", "../item/UseItem", "./ClearTile"], function (require, exports, IAction_1, TileHelpers_1, IObjective_1, Objective_1, AcquireItemForAction_1, AnalyzeInventory_1, Lambda_1, MoveToTarget_1, UseItem_1, ClearTile_1) {
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
            const shovel = context.inventory.shovel;
            if (!shovel) {
                objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Dig), new AnalyzeInventory_1.default());
            }
            objectives.push(new MoveToTarget_1.default(this.target, true));
            objectives.push(new ClearTile_1.default(this.target));
            objectives.push(new UseItem_1.default(IAction_1.ActionType.Dig, shovel));
            const digUntilTypeIsNot = this.options?.digUntilTypeIsNot;
            if (digUntilTypeIsNot !== undefined) {
                objectives.push(new Lambda_1.default(async () => {
                    if (digUntilTypeIsNot === TileHelpers_1.default.getType(context.island.getTileFromPoint(this.target))) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    return IObjective_1.ObjectiveResult.Complete;
                }));
            }
            return objectives;
        }
    }
    exports.default = DigTile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlnVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL3RpbGUvRGlnVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFxQkEsTUFBcUIsT0FBUSxTQUFRLG1CQUFTO1FBRTdDLFlBQTZCLE1BQWdCLEVBQW1CLE9BQWtDO1lBQ2pHLEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQVU7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBMkI7UUFFbEcsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxXQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckUsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyRSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osVUFBVSxDQUFDLElBQUksQ0FDZCxJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsR0FBRyxDQUFDLEVBQ3hDLElBQUksMEJBQWdCLEVBQUUsQ0FDdEIsQ0FBQzthQUNGO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXJELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRTVDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFckQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDO1lBQzFELElBQUksaUJBQWlCLEtBQUssU0FBUyxFQUFFO2dCQUNwQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDckMsSUFBSSxpQkFBaUIsS0FBSyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO3dCQUM1RixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO3FCQUMvQjtvQkFFRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUE3Q0QsMEJBNkNDIn0=