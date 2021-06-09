define(["require", "exports", "game/entity/action/IAction", "../../navigation//INavigation", "../../Objective", "../../utilities/Tile", "../core/MoveToTarget", "./item/UseItem"], function (require, exports, IAction_1, INavigation_1, Objective_1, Tile_1, MoveToTarget_1, UseItem_1) {
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
        getStatus() {
            var _a;
            return `Emptying ${(_a = this.item) === null || _a === void 0 ? void 0 : _a.getName()}`;
        }
        async execute(context) {
            const objectivePipelines = [];
            const targets = await Tile_1.tileUtilities.getNearestTileLocation(context, INavigation_1.anyWaterTileLocation);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW1wdHlXYXRlckNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL0VtcHR5V2F0ZXJDb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZUEsTUFBcUIsbUJBQW9CLFNBQVEsbUJBQVM7UUFFekQsWUFBNkIsSUFBVTtZQUN0QyxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFNO1FBRXZDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sdUJBQXVCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRU0sU0FBUzs7WUFDZixPQUFPLFlBQVksTUFBQSxJQUFJLENBQUMsSUFBSSwwQ0FBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxNQUFNLE9BQU8sR0FBRyxNQUFNLG9CQUFhLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLGtDQUFvQixDQUFDLENBQUM7WUFFMUYsS0FBSyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksT0FBTyxFQUFFO2dCQUNoQyxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO2dCQUVwQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFL0MsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRXpELGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNwQztZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztLQUNEO0lBL0JELHNDQStCQyJ9