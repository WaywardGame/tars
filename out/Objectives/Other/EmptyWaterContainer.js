define(["require", "exports", "entity/action/IAction", "../../Navigation/INavigation", "../../Objective", "../../Utilities/Tile", "../Core/MoveToTarget", "./UseItem"], function (require, exports, IAction_1, INavigation_1, Objective_1, Tile_1, MoveToTarget_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class EmptyWaterContainer extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getIdentifier() {
            return `EmptyWaterContainer:${this.item}`;
        }
        async execute(context) {
            const objectivePipelines = [];
            const targets = await Tile_1.getNearestTileLocation(context, INavigation_1.anyWaterTileLocation);
            for (const { point } of targets) {
                const objectives = [];
                objectives.push(new MoveToTarget_1.default(point, true));
                objectives.push(new UseItem_1.default(IAction_1.ActionType.Pour, this.item));
                objectivePipelines.push(objectives);
            }
            return objectivePipelines;
        }
    }
    exports.default = EmptyWaterContainer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW1wdHlXYXRlckNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL090aGVyL0VtcHR5V2F0ZXJDb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZUEsTUFBcUIsbUJBQW9CLFNBQVEsbUJBQVM7UUFFekQsWUFBNkIsSUFBVTtZQUN0QyxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFNO1FBRXZDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sdUJBQXVCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsTUFBTSxPQUFPLEdBQUcsTUFBTSw2QkFBc0IsQ0FBQyxPQUFPLEVBQUUsa0NBQW9CLENBQUMsQ0FBQztZQUU1RSxLQUFLLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxPQUFPLEVBQUU7Z0JBQ2hDLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7Z0JBRXBDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUUvQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFekQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUEzQkQsc0NBMkJDIn0=