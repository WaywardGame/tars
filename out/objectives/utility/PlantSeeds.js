define(["require", "exports", "../../core/objective/Objective", "../core/Restart", "../other/item/PlantSeed"], function (require, exports, Objective_1, Restart_1, PlantSeed_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PlantSeeds extends Objective_1.default {
        constructor(seeds) {
            super();
            this.seeds = seeds;
        }
        getIdentifier() {
            return `PlantSeeds:${this.seeds.join(",")}`;
        }
        getStatus() {
            return "Planting seeds";
        }
        async execute(context) {
            const objectivePipelines = [];
            for (const seed of this.seeds) {
                objectivePipelines.push([
                    new PlantSeed_1.default(seed),
                    new Restart_1.default(),
                ]);
            }
            return objectivePipelines;
        }
    }
    exports.default = PlantSeeds;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvUGxhbnRTZWVkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFPQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFN0MsWUFBNkIsS0FBYTtZQUN0QyxLQUFLLEVBQUUsQ0FBQTtZQURrQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBRTFDLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sY0FBYyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2hELENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxnQkFBZ0IsQ0FBQztRQUM1QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUMzQixrQkFBa0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3BCLElBQUksbUJBQVMsQ0FBQyxJQUFJLENBQUM7b0JBQ25CLElBQUksaUJBQU8sRUFBRTtpQkFDaEIsQ0FBQyxDQUFDO2FBQ047WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzlCLENBQUM7S0FFSjtJQTNCRCw2QkEyQkMifQ==