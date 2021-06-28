define(["require", "exports", "language/Translation", "../../Objective", "./GatherWater"], function (require, exports, Translation_1, Objective_1, GatherWater_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWaters extends Objective_1.default {
        constructor(waterContainers, options) {
            super();
            this.waterContainers = waterContainers;
            this.options = options;
        }
        getIdentifier() {
            var _a, _b, _c, _d, _e, _f, _g;
            return `GatherWaters:${(_a = this.waterContainers) === null || _a === void 0 ? void 0 : _a.join(",")}:${(_b = this.options) === null || _b === void 0 ? void 0 : _b.disallowTerrain}:${(_c = this.options) === null || _c === void 0 ? void 0 : _c.disallowWaterStill}:${(_d = this.options) === null || _d === void 0 ? void 0 : _d.disallowWell}:${(_e = this.options) === null || _e === void 0 ? void 0 : _e.disallowRecipe}:${(_f = this.options) === null || _f === void 0 ? void 0 : _f.allowStartingWaterStill}:${(_g = this.options) === null || _g === void 0 ? void 0 : _g.allowWaitingForWaterStill}`;
        }
        getStatus() {
            const translation = Stream.values(this.waterContainers.map(item => item.getName()))
                .collect(Translation_1.default.formatList, Translation_1.ListEnder.Or);
            return `Gathering water into ${translation.getString()}`;
        }
        async execute(context) {
            return this.waterContainers.map(waterContainer => ([new GatherWater_1.default(waterContainer, this.options)]));
        }
    }
    exports.default = GatherWaters;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlcldhdGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFFbEQsWUFBNkIsZUFBdUIsRUFBbUIsT0FBNkI7WUFDbkcsS0FBSyxFQUFFLENBQUM7WUFEb0Isb0JBQWUsR0FBZixlQUFlLENBQVE7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBc0I7UUFFcEcsQ0FBQztRQUVNLGFBQWE7O1lBQ25CLE9BQU8sZ0JBQWdCLE1BQUEsSUFBSSxDQUFDLGVBQWUsMENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsZUFBZSxJQUFJLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsa0JBQWtCLElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxZQUFZLElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxjQUFjLElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSx1QkFBdUIsSUFBSSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLHlCQUF5QixFQUFFLENBQUM7UUFDalIsQ0FBQztRQUVNLFNBQVM7WUFDZixNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7aUJBQ2pGLE9BQU8sQ0FBQyxxQkFBVyxDQUFDLFVBQVUsRUFBRSx1QkFBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRWhELE9BQU8sd0JBQXdCLFdBQVcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQzFELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEcsQ0FBQztLQUNEO0lBcEJELCtCQW9CQyJ9