define(["require", "exports", "utilities/game/TileHelpers", "game/entity/action/actions/Dig", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/Lambda", "../../core/MoveToTarget", "../item/UseItem", "./ClearTile", "../../acquire/item/AcquireInventoryItem"], function (require, exports, TileHelpers_1, Dig_1, IObjective_1, Objective_1, Lambda_1, MoveToTarget_1, UseItem_1, ClearTile_1, AcquireInventoryItem_1) {
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
                    if (digUntilTypeIsNot === TileHelpers_1.default.getType(context.island.getTileFromPoint(this.target))) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlnVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL3RpbGUvRGlnVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFvQkEsTUFBcUIsT0FBUSxTQUFRLG1CQUFTO1FBRTdDLFlBQTZCLE1BQWdCLEVBQW1CLE9BQWtDO1lBQ2pHLEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQVU7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBMkI7UUFFbEcsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxXQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckUsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyRSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBRXBELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVyRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUU1QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxhQUFHLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRTVELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQztZQUMxRCxJQUFJLGlCQUFpQixLQUFLLFNBQVMsRUFBRTtnQkFDcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7b0JBQ3JDLElBQUksaUJBQWlCLEtBQUsscUJBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTt3QkFDNUYsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztxQkFDL0I7b0JBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDcEI7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUF2Q0QsMEJBdUNDIn0=