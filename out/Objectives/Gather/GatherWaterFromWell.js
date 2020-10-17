define(["require", "exports", "entity/action/IAction", "utilities/TilePosition", "../../IObjective", "../../Objective", "../Core/ExecuteAction", "../Core/MoveToTarget"], function (require, exports, IAction_1, TilePosition_1, IObjective_1, Objective_1, ExecuteAction_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWaterFromWell extends Objective_1.default {
        constructor(well, item) {
            super();
            this.well = well;
            this.item = item;
        }
        getIdentifier() {
            return `GatherWaterFromWell:${this.well}`;
        }
        async execute(context) {
            const pos = this.well.getPoint();
            const wellData = island.wellData[TilePosition_1.getTileId(pos.x, pos.y, pos.z)];
            if (!wellData || wellData.quantity === 0) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                new MoveToTarget_1.default(this.well, true),
                new ExecuteAction_1.default(IAction_1.ActionType.UseItem, (context, action) => {
                    action.execute(context.player, this.item, IAction_1.ActionType.GatherWater);
                }).setStatus(() => `Gathering water from ${this.well.getName()}`),
            ];
        }
    }
    exports.default = GatherWaterFromWell;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJGcm9tV2VsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0dhdGhlci9HYXRoZXJXYXRlckZyb21XZWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLE1BQXFCLG1CQUFvQixTQUFRLG1CQUFTO1FBRXpELFlBQTZCLElBQVksRUFBbUIsSUFBVTtZQUNyRSxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFRO1lBQW1CLFNBQUksR0FBSixJQUFJLENBQU07UUFFdEUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx1QkFBdUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFakMsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyx3QkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFO2dCQUN6QyxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsT0FBTztnQkFDTixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7Z0JBQ2pDLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDekQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsb0JBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDbkUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLHdCQUF3QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7YUFDakUsQ0FBQztRQUNILENBQUM7S0FDRDtJQXpCRCxzQ0F5QkMifQ==