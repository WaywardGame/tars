define(["require", "exports", "@wayward/goodstream/Stream", "language/ITranslation", "language/Translation", "../../core/objective/Objective", "./GatherWater"], function (require, exports, Stream_1, ITranslation_1, Translation_1, Objective_1, GatherWater_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWaters extends Objective_1.default {
        constructor(waterContainers, options) {
            super();
            this.waterContainers = waterContainers;
            this.options = options;
        }
        getIdentifier() {
            return `GatherWaters:${this.waterContainers?.join(",")}:${this.options?.disallowTerrain}:${this.options?.disallowWaterStill}:${this.options?.disallowWell}:${this.options?.disallowRecipe}:${this.options?.allowStartingWaterStill}:${this.options?.allowWaitingForWater}`;
        }
        getStatus() {
            const translation = Stream_1.default.values(this.waterContainers.map(item => item.getName()))
                .collect(Translation_1.default.formatList, ITranslation_1.ListEnder.Or);
            return `Gathering water into ${translation.getString()}`;
        }
        async execute(context) {
            return this.waterContainers.map(waterContainer => ([new GatherWater_1.default(waterContainer, this.options)]));
        }
    }
    exports.default = GatherWaters;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlcldhdGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFFbEQsWUFBNkIsZUFBdUIsRUFBbUIsT0FBc0M7WUFDNUcsS0FBSyxFQUFFLENBQUM7WUFEb0Isb0JBQWUsR0FBZixlQUFlLENBQVE7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBK0I7UUFFN0csQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxnQkFBZ0IsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxlQUFlLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLFlBQVksSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLHVCQUF1QixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQztRQUM1USxDQUFDO1FBRU0sU0FBUztZQUNmLE1BQU0sV0FBVyxHQUFHLGdCQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7aUJBQ2pGLE9BQU8sQ0FBQyxxQkFBVyxDQUFDLFVBQVUsRUFBRSx3QkFBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRWhELE9BQU8sd0JBQXdCLFdBQVcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQzFELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEcsQ0FBQztLQUNEO0lBcEJELCtCQW9CQyJ9