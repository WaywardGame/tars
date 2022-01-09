define(["require", "exports", "game/entity/action/IAction", "utilities/game/TilePosition", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/MoveToTarget", "../other/item/UseItem", "../core/ReserveItems"], function (require, exports, IAction_1, TilePosition_1, IObjective_1, Objective_1, MoveToTarget_1, UseItem_1, ReserveItems_1) {
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
                new ReserveItems_1.default(this.item),
                new MoveToTarget_1.default(this.well, true),
                new UseItem_1.default(IAction_1.ActionType.GatherLiquid, this.item)
                    .setStatus(() => `Gathering water from ${this.well.getName()}`),
            ];
        }
    }
    exports.default = GatherWaterFromWell;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJGcm9tV2VsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJXYXRlckZyb21XZWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWFBLE1BQXFCLG1CQUFvQixTQUFRLG1CQUFTO1FBRXpELFlBQTZCLElBQVksRUFBbUIsSUFBVTtZQUNyRSxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFRO1lBQW1CLFNBQUksR0FBSixJQUFJLENBQU07UUFFdEUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyx1QkFBdUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyx3QkFBd0IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFakMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBQSx3QkFBUyxFQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFO2dCQUN6QyxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsT0FBTztnQkFDTixJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDM0IsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO2dCQUNqQyxJQUFJLGlCQUFPLENBQUMsb0JBQVUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztxQkFDN0MsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLHdCQUF3QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7YUFDaEUsQ0FBQztRQUNILENBQUM7S0FDRDtJQTdCRCxzQ0E2QkMifQ==