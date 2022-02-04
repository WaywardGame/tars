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
            return `GatherWater:${this.waterContainer}:${this.options?.disallowTerrain}:${this.options?.disallowWaterStill}:${this.options?.disallowWell}:${this.options?.disallowRecipe}:${this.options?.allowStartingWaterStill}:${this.options?.allowWaitingForWater}`;
        }
        getStatus() {
            return `Gathering water into ${this.waterContainer?.getName()}`;
        }
        async execute(context) {
            if (!this.waterContainer) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const objectivePipelines = [];
            if (!this.options?.disallowTerrain) {
                objectivePipelines.push([new GatherWaterFromTerrain_1.default(this.waterContainer)]);
            }
            if (!this.options?.disallowWaterStill) {
                for (const waterStill of context.base.waterStill) {
                    objectivePipelines.push([new GatherWaterFromStill_1.default(waterStill, this.waterContainer, {
                            allowStartingWaterStill: this.options?.allowStartingWaterStill,
                            allowWaitingForWater: this.options?.allowWaitingForWater,
                        })]);
                }
                for (const solarStill of context.base.solarStill) {
                    objectivePipelines.push([new GatherWaterFromStill_1.default(solarStill, this.waterContainer, {
                            allowWaitingForWater: this.options?.allowWaitingForWater,
                        })]);
                }
            }
            if (!this.options?.disallowWell) {
                for (const well of context.base.well) {
                    objectivePipelines.push([new GatherWaterFromWell_1.default(well, this.waterContainer)]);
                }
            }
            if (!this.options?.disallowRecipe) {
                objectivePipelines.push([new GatherWaterWithRecipe_1.default(this.waterContainer)]);
            }
            return objectivePipelines;
        }
    }
    exports.default = GatherWater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9nYXRoZXIvR2F0aGVyV2F0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBd0JBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixjQUFxQixFQUFtQixPQUFzQztZQUMxRyxLQUFLLEVBQUUsQ0FBQztZQURvQixtQkFBYyxHQUFkLGNBQWMsQ0FBTztZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUErQjtRQUUzRyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGVBQWUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGtCQUFrQixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsdUJBQXVCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxDQUFDO1FBQy9QLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyx3QkFBd0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ2pFLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUN6QixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRTtnQkFDbkMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxnQ0FBc0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzNFO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUU7Z0JBQ3RDLEtBQUssTUFBTSxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7b0JBQ2pELGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksOEJBQW9CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7NEJBQ2xGLHVCQUF1QixFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsdUJBQXVCOzRCQUM5RCxvQkFBb0IsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLG9CQUFvQjt5QkFDeEQsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDTDtnQkFFRCxLQUFLLE1BQU0sVUFBVSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO29CQUNqRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDhCQUFvQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFOzRCQUNsRixvQkFBb0IsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLG9CQUFvQjt5QkFDeEQsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDTDthQUNEO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFO2dCQUNoQyxLQUFLLE1BQU0sSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNyQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDZCQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUM5RTthQUNEO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxFQUFFO2dCQUNsQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLCtCQUFxQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUU7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FDRDtJQXBERCw4QkFvREMifQ==