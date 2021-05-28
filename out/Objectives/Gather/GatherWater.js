define(["require", "exports", "../../IObjective", "../../Objective", "./GatherWaterFromStill", "./GatherWaterFromTerrain", "./GatherWaterFromWell"], function (require, exports, IObjective_1, Objective_1, GatherWaterFromStill_1, GatherWaterFromTerrain_1, GatherWaterFromWell_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWater extends Objective_1.default {
        constructor(item, options) {
            super();
            this.item = item;
            this.options = options;
        }
        getIdentifier() {
            var _a, _b, _c, _d, _e;
            return `GatherWater:${this.item}:${(_a = this.options) === null || _a === void 0 ? void 0 : _a.disallowTerrain}:${(_b = this.options) === null || _b === void 0 ? void 0 : _b.disallowWaterStill}:${(_c = this.options) === null || _c === void 0 ? void 0 : _c.disallowWell}:${(_d = this.options) === null || _d === void 0 ? void 0 : _d.allowStartingWaterStill}:${(_e = this.options) === null || _e === void 0 ? void 0 : _e.allowWaitingForWaterStill}`;
        }
        getStatus() {
            var _a;
            return `Gathering water into ${(_a = this.item) === null || _a === void 0 ? void 0 : _a.getName()}`;
        }
        async execute(context) {
            var _a, _b, _c, _d, _e;
            if (!this.item) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const objectivePipelines = [];
            if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.disallowTerrain)) {
                objectivePipelines.push([new GatherWaterFromTerrain_1.default(this.item)]);
            }
            if (!((_b = this.options) === null || _b === void 0 ? void 0 : _b.disallowWaterStill)) {
                for (const waterStill of context.base.waterStill) {
                    objectivePipelines.push([new GatherWaterFromStill_1.default(waterStill, this.item, (_c = this.options) === null || _c === void 0 ? void 0 : _c.allowStartingWaterStill, (_d = this.options) === null || _d === void 0 ? void 0 : _d.allowWaitingForWaterStill)]);
                }
            }
            if (!((_e = this.options) === null || _e === void 0 ? void 0 : _e.disallowWell)) {
                for (const well of context.base.well) {
                    objectivePipelines.push([new GatherWaterFromWell_1.default(well, this.item)]);
                }
            }
            return objectivePipelines;
        }
    }
    exports.default = GatherWater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyV2F0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBa0JBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixJQUFXLEVBQW1CLE9BQTZCO1lBQ3ZGLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU87WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBc0I7UUFFeEYsQ0FBQztRQUVNLGFBQWE7O1lBQ25CLE9BQU8sZUFBZSxJQUFJLENBQUMsSUFBSSxJQUFJLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsZUFBZSxJQUFJLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsa0JBQWtCLElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxZQUFZLElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSx1QkFBdUIsSUFBSSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLHlCQUF5QixFQUFFLENBQUM7UUFDMU4sQ0FBQztRQUVNLFNBQVM7O1lBQ2YsT0FBTyx3QkFBd0IsTUFBQSxJQUFJLENBQUMsSUFBSSwwQ0FBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3ZELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCOztZQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDZixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLElBQUksQ0FBQyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsZUFBZSxDQUFBLEVBQUU7Z0JBQ25DLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksZ0NBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqRTtZQUVELElBQUksQ0FBQyxDQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsa0JBQWtCLENBQUEsRUFBRTtnQkFDdEMsS0FBSyxNQUFNLFVBQVUsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtvQkFDakQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLHVCQUF1QixFQUFFLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzNKO2FBQ0Q7WUFFRCxJQUFJLENBQUMsQ0FBQSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLFlBQVksQ0FBQSxFQUFFO2dCQUNoQyxLQUFLLE1BQU0sSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNyQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDZCQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNwRTthQUNEO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUF2Q0QsOEJBdUNDIn0=