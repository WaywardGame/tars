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
            var _a, _b, _c, _d, _e, _f, _g;
            return `GatherWaters:${(_a = this.waterContainers) === null || _a === void 0 ? void 0 : _a.join(",")}:${(_b = this.options) === null || _b === void 0 ? void 0 : _b.disallowTerrain}:${(_c = this.options) === null || _c === void 0 ? void 0 : _c.disallowWaterStill}:${(_d = this.options) === null || _d === void 0 ? void 0 : _d.disallowWell}:${(_e = this.options) === null || _e === void 0 ? void 0 : _e.disallowRecipe}:${(_f = this.options) === null || _f === void 0 ? void 0 : _f.allowStartingWaterStill}:${(_g = this.options) === null || _g === void 0 ? void 0 : _g.allowWaitingForWaterStill}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlcldhdGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFFbEQsWUFBNkIsZUFBdUIsRUFBbUIsT0FBc0M7WUFDNUcsS0FBSyxFQUFFLENBQUM7WUFEb0Isb0JBQWUsR0FBZixlQUFlLENBQVE7WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBK0I7UUFFN0csQ0FBQztRQUVNLGFBQWE7O1lBQ25CLE9BQU8sZ0JBQWdCLE1BQUEsSUFBSSxDQUFDLGVBQWUsMENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsZUFBZSxJQUFJLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsa0JBQWtCLElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxZQUFZLElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxjQUFjLElBQUksTUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSx1QkFBdUIsSUFBSSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLHlCQUF5QixFQUFFLENBQUM7UUFDalIsQ0FBQztRQUVNLFNBQVM7WUFDZixNQUFNLFdBQVcsR0FBRyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2lCQUNqRixPQUFPLENBQUMscUJBQVcsQ0FBQyxVQUFVLEVBQUUsd0JBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVoRCxPQUFPLHdCQUF3QixXQUFXLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQztRQUMxRCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RHLENBQUM7S0FDRDtJQXBCRCwrQkFvQkMifQ==