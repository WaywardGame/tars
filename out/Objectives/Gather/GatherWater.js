define(["require", "exports", "../../core/objective/IObjective", "../../core/objective/Objective", "./GatherWaterFromStill", "./GatherWaterFromTerrain", "./GatherWaterFromWell", "./GatherWaterWithRecipe"], function (require, exports, IObjective_1, Objective_1, GatherWaterFromStill_1, GatherWaterFromTerrain_1, GatherWaterFromWell_1, GatherWaterWithRecipe_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWater extends Objective_1.default {
        constructor(waterContainer, options) {
            super();
            this.waterContainer = waterContainer;
            this.options = options;
        }
        getIdentifier() {
            var _a, _b, _c, _d, _e, _f;
            return `GatherWater:${this.waterContainer}:${(_a = this.options) === null || _a === void 0 ? void 0 : _a.disallowTerrain}:${(_b = this.options) === null || _b === void 0 ? void 0 : _b.disallowWaterStill}:${(_c = this.options) === null || _c === void 0 ? void 0 : _c.disallowWell}:${(_d = this.options) === null || _d === void 0 ? void 0 : _d.disallowRecipe}:${(_e = this.options) === null || _e === void 0 ? void 0 : _e.allowStartingWaterStill}:${(_f = this.options) === null || _f === void 0 ? void 0 : _f.allowWaitingForWaterStill}`;
        }
        getStatus() {
            var _a;
            return `Gathering water into ${(_a = this.waterContainer) === null || _a === void 0 ? void 0 : _a.getName()}`;
        }
        async execute(context) {
            var _a, _b, _c, _d, _e, _f;
            if (!this.waterContainer) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const objectivePipelines = [];
            if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.disallowTerrain)) {
                objectivePipelines.push([new GatherWaterFromTerrain_1.default(this.waterContainer)]);
            }
            if (!((_b = this.options) === null || _b === void 0 ? void 0 : _b.disallowWaterStill)) {
                for (const waterStill of context.base.waterStill) {
                    objectivePipelines.push([new GatherWaterFromStill_1.default(waterStill, this.waterContainer, {
                            allowStartingWaterStill: (_c = this.options) === null || _c === void 0 ? void 0 : _c.allowStartingWaterStill,
                            allowWaitingForWaterStill: (_d = this.options) === null || _d === void 0 ? void 0 : _d.allowWaitingForWaterStill,
                        })]);
                }
            }
            if (!((_e = this.options) === null || _e === void 0 ? void 0 : _e.disallowWell)) {
                for (const well of context.base.well) {
                    objectivePipelines.push([new GatherWaterFromWell_1.default(well, this.waterContainer)]);
                }
            }
            if (!((_f = this.options) === null || _f === void 0 ? void 0 : _f.disallowRecipe)) {
                objectivePipelines.push([new GatherWaterWithRecipe_1.default(this.waterContainer)]);
            }
            return objectivePipelines;
        }
    }
    exports.default = GatherWater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyV2F0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBd0JBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixjQUFxQixFQUFtQixPQUFzQztZQUMxRyxLQUFLLEVBQUUsQ0FBQztZQURvQixtQkFBYyxHQUFkLGNBQWMsQ0FBTztZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUErQjtRQUUzRyxDQUFDO1FBRU0sYUFBYTs7WUFDbkIsT0FBTyxlQUFlLElBQUksQ0FBQyxjQUFjLElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxlQUFlLElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxrQkFBa0IsSUFBSSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLFlBQVksSUFBSSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLGNBQWMsSUFBSSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLHVCQUF1QixJQUFJLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUseUJBQXlCLEVBQUUsQ0FBQztRQUNwUSxDQUFDO1FBRU0sU0FBUzs7WUFDZixPQUFPLHdCQUF3QixNQUFBLElBQUksQ0FBQyxjQUFjLDBDQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDakUsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUN6QixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLElBQUksQ0FBQyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsZUFBZSxDQUFBLEVBQUU7Z0JBQ25DLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksZ0NBQXNCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMzRTtZQUVELElBQUksQ0FBQyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsa0JBQWtCLENBQUEsRUFBRTtnQkFDdEMsS0FBSyxNQUFNLFVBQVUsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtvQkFDakQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTs0QkFDbEYsdUJBQXVCLEVBQUUsTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSx1QkFBdUI7NEJBQzlELHlCQUF5QixFQUFFLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUseUJBQXlCO3lCQUNsRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNMO2FBQ0Q7WUFFRCxJQUFJLENBQUMsQ0FBQSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLFlBQVksQ0FBQSxFQUFFO2dCQUNoQyxLQUFLLE1BQU0sSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNyQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDZCQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUM5RTthQUNEO1lBRUQsSUFBSSxDQUFDLENBQUEsTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxjQUFjLENBQUEsRUFBRTtnQkFDbEMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSwrQkFBcUIsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzFFO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUE5Q0QsOEJBOENDIn0=