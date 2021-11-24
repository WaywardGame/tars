define(["require", "exports", "game/entity/action/IAction", "utilities/game/TilePosition", "../../IObjective", "../../Objective", "../core/MoveToTarget", "../other/item/UseItem"], function (require, exports, IAction_1, TilePosition_1, IObjective_1, Objective_1, MoveToTarget_1, UseItem_1) {
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
        getStatus() {
            return `Gathering water from ${this.well.getName()}`;
        }
        async execute(context) {
            const pos = this.well.getPoint();
            const wellData = context.island.wellData[(0, TilePosition_1.getTileId)(pos.x, pos.y, pos.z)];
            if (!wellData || wellData.quantity === 0) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                new MoveToTarget_1.default(this.well, true),
                new UseItem_1.default(IAction_1.ActionType.GatherLiquid, this.item)
                    .setStatus(() => `Gathering water from ${this.well.getName()}`),
            ];
        }
    }
    exports.default = GatherWaterFromWell;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJGcm9tV2VsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJXYXRlckZyb21XZWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLE1BQXFCLG1CQUFvQixTQUFRLG1CQUFTO1FBRXpELFlBQTZCLElBQVksRUFBbUIsSUFBVTtZQUNyRSxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFRO1lBQW1CLFNBQUksR0FBSixJQUFJLENBQU07UUFFdEUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx1QkFBdUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyx3QkFBd0IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFakMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBQSx3QkFBUyxFQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFO2dCQUN6QyxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsT0FBTztnQkFDTixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7Z0JBQ2pDLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO3FCQUM3QyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsd0JBQXdCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQzthQUNoRSxDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBNUJELHNDQTRCQyJ9