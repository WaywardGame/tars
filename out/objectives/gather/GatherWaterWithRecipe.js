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
            return `Gathering water into ${this.item?.getName()}`;
        }
        async execute(context) {
            if (!this.item) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const baseItemType = this.item.description()?.returnOnUseAndDecay?.type ?? this.item.type;
            if (baseItemType !== undefined) {
                const baseItemDescription = Items_1.default[baseItemType];
                const liquid = baseItemDescription?.gather;
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
                        if (targetItemDescription?.recipe !== undefined) {
                            return [
                                new ReserveItems_1.default(this.item).keepInInventory(),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJXaXRoUmVjaXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlcldhdGVyV2l0aFJlY2lwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFlQSxNQUFxQixxQkFBc0IsU0FBUSxtQkFBUztRQUV4RCxZQUE2QixJQUFXO1lBQ3BDLEtBQUssRUFBRSxDQUFDO1lBRGlCLFNBQUksR0FBSixJQUFJLENBQU87UUFFeEMsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyx5QkFBeUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hELENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyx3QkFBd0IsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzFELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNaLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDbEM7WUFFRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLG1CQUFtQixFQUFFLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUMxRixJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUU7Z0JBQzVCLE1BQU0sbUJBQW1CLEdBQUcsZUFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDM0QsTUFBTSxNQUFNLEdBQUcsbUJBQW1CLEVBQUUsTUFBTSxDQUFDO2dCQUMzQyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7b0JBQ3RCLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztvQkFDN0MsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO29CQUV6QyxJQUFJLGNBQW9DLENBQUM7b0JBRXpDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7d0JBQ3BCLEtBQUssWUFBWTs0QkFFYixjQUFjLEdBQUcsa0JBQWtCLENBQUM7NEJBQ3BDLE1BQU07d0JBRVYsS0FBSyxrQkFBa0I7NEJBRW5CLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQzs0QkFDbEMsTUFBTTtxQkFDYjtvQkFFRCxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7d0JBQzlCLE1BQU0scUJBQXFCLEdBQUcsZUFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQzt3QkFDL0QsSUFBSSxxQkFBcUIsRUFBRSxNQUFNLEtBQUssU0FBUyxFQUFFOzRCQUM3QyxPQUFPO2dDQUNILElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFO2dDQUM3QyxJQUFJLCtCQUFxQixDQUFDLGNBQWMsRUFBRSxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDOzZCQUNoRixDQUFDO3lCQUNMO3FCQUNKO2lCQUNKO2FBQ0o7WUFFRCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO1FBQ3RDLENBQUM7S0FDSjtJQXZERCx3Q0F1REMifQ==