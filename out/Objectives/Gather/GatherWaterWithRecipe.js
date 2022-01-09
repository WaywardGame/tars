define(["require", "exports", "game/item/Items", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireItemWithRecipe", "../core/ReserveItems"], function (require, exports, Items_1, IObjective_1, Objective_1, AcquireItemWithRecipe_1, ReserveItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWaterWithRecipe extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getIdentifier() {
            return `GatherWaterWithRecipe:${this.item}`;
        }
        getStatus() {
            var _a;
            return `Gathering water into ${(_a = this.item) === null || _a === void 0 ? void 0 : _a.getName()}`;
        }
        async execute(context) {
            var _a, _b, _c;
            if (!this.item) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const baseItemType = (_c = (_b = (_a = this.item.description()) === null || _a === void 0 ? void 0 : _a.returnOnUseAndDecay) === null || _b === void 0 ? void 0 : _b.type) !== null && _c !== void 0 ? _c : this.item.type;
            if (baseItemType !== undefined) {
                const baseItemDescription = Items_1.default[baseItemType];
                const liquid = baseItemDescription === null || baseItemDescription === void 0 ? void 0 : baseItemDescription.gather;
                if (liquid !== undefined) {
                    const unpurifiedItemType = liquid.unpurified;
                    const purifiedItemType = liquid.purified;
                    let targetItemType;
                    switch (this.item.type) {
                        case baseItemType:
                            targetItemType = unpurifiedItemType;
                            break;
                        case unpurifiedItemType:
                            targetItemType = purifiedItemType;
                            break;
                    }
                    if (targetItemType !== undefined) {
                        const targetItemDescription = Items_1.default[targetItemType];
                        if ((targetItemDescription === null || targetItemDescription === void 0 ? void 0 : targetItemDescription.recipe) !== undefined) {
                            return [
                                new ReserveItems_1.default(this.item),
                                new AcquireItemWithRecipe_1.default(targetItemType, targetItemDescription.recipe, true),
                            ];
                        }
                    }
                }
            }
            return IObjective_1.ObjectiveResult.Impossible;
        }
    }
    exports.default = GatherWaterWithRecipe;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJXaXRoUmVjaXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlcldhdGVyV2l0aFJlY2lwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFlQSxNQUFxQixxQkFBc0IsU0FBUSxtQkFBUztRQUV4RCxZQUE2QixJQUFXO1lBQ3BDLEtBQUssRUFBRSxDQUFDO1lBRGlCLFNBQUksR0FBSixJQUFJLENBQU87UUFFeEMsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyx5QkFBeUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hELENBQUM7UUFFTSxTQUFTOztZQUNaLE9BQU8sd0JBQXdCLE1BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMxRCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1osT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUNsQztZQUVELE1BQU0sWUFBWSxHQUFHLE1BQUEsTUFBQSxNQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLDBDQUFFLG1CQUFtQiwwQ0FBRSxJQUFJLG1DQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzFGLElBQUksWUFBWSxLQUFLLFNBQVMsRUFBRTtnQkFDNUIsTUFBTSxtQkFBbUIsR0FBRyxlQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLE1BQU0sR0FBRyxtQkFBbUIsYUFBbkIsbUJBQW1CLHVCQUFuQixtQkFBbUIsQ0FBRSxNQUFNLENBQUM7Z0JBQzNDLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtvQkFDdEIsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO29CQUM3QyxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7b0JBRXpDLElBQUksY0FBb0MsQ0FBQztvQkFFekMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTt3QkFDcEIsS0FBSyxZQUFZOzRCQUViLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQzs0QkFDcEMsTUFBTTt3QkFFVixLQUFLLGtCQUFrQjs0QkFFbkIsY0FBYyxHQUFHLGdCQUFnQixDQUFDOzRCQUNsQyxNQUFNO3FCQUNiO29CQUVELElBQUksY0FBYyxLQUFLLFNBQVMsRUFBRTt3QkFDOUIsTUFBTSxxQkFBcUIsR0FBRyxlQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUMvRCxJQUFJLENBQUEscUJBQXFCLGFBQXJCLHFCQUFxQix1QkFBckIscUJBQXFCLENBQUUsTUFBTSxNQUFLLFNBQVMsRUFBRTs0QkFDN0MsT0FBTztnQ0FDSCxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQ0FDM0IsSUFBSSwrQkFBcUIsQ0FBQyxjQUFjLEVBQUUscUJBQXFCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQzs2QkFDaEYsQ0FBQzt5QkFDTDtxQkFDSjtpQkFDSjthQUNKO1lBRUQsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQztRQUN0QyxDQUFDO0tBQ0o7SUF2REQsd0NBdURDIn0=