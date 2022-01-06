define(["require", "exports", "game/entity/action/IAction", "utilities/game/TileHelpers", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItemForAction", "../../analyze/AnalyzeInventory", "../../core/Lambda", "../../core/MoveToTarget", "../item/UseItem"], function (require, exports, IAction_1, TileHelpers_1, IObjective_1, Objective_1, AcquireItemForAction_1, AnalyzeInventory_1, Lambda_1, MoveToTarget_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DigTile extends Objective_1.default {
        constructor(target, options = {}) {
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
            objectives.push(new MoveToTarget_1.default(this.target, true), new UseItem_1.default(IAction_1.ActionType.Dig, shovel));
            const digUntilTypeIsNot = this.options.digUntilTypeIsNot;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlnVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL3RpbGUvRGlnVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFlQSxNQUFxQixPQUFRLFNBQVEsbUJBQVM7UUFFN0MsWUFBNkIsTUFBZ0IsRUFBbUIsVUFBdUQsRUFBRTtZQUN4SCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFVO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQWtEO1FBRXpILENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JFLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxXQUFXLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckUsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUN4QyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksMEJBQWdCLEVBQUUsQ0FBQyxDQUFDO2FBQ2xGO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLGlCQUFPLENBQUMsb0JBQVUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUUxRixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUM7WUFDekQsSUFBSSxpQkFBaUIsS0FBSyxTQUFTLEVBQUU7Z0JBQ3BDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO29CQUNyQyxJQUFJLGlCQUFpQixLQUFLLHFCQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7d0JBQzVGLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7cUJBQy9CO29CQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7Z0JBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FFRDtJQXRDRCwwQkFzQ0MifQ==