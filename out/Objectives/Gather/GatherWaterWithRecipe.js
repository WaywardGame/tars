define(["require", "exports", "game/item/Items", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireItemWithRecipe", "../core/ReserveItems", "../../core/ITars"], function (require, exports, Items_1, IObjective_1, Objective_1, AcquireItemWithRecipe_1, ReserveItems_1, ITars_1) {
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
                                new ReserveItems_1.default(this.item).keepInInventory().setReserveType(ITars_1.ReserveType.Soft),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJXaXRoUmVjaXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlcldhdGVyV2l0aFJlY2lwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFnQkEsTUFBcUIscUJBQXNCLFNBQVEsbUJBQVM7UUFFeEQsWUFBNkIsSUFBVztZQUNwQyxLQUFLLEVBQUUsQ0FBQztZQURpQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRXhDLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8seUJBQXlCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNoRCxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sd0JBQXdCLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMxRCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDWixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDMUYsSUFBSSxZQUFZLEtBQUssU0FBUyxFQUFFO2dCQUM1QixNQUFNLG1CQUFtQixHQUFHLGVBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzNELE1BQU0sTUFBTSxHQUFHLG1CQUFtQixFQUFFLE1BQU0sQ0FBQztnQkFDM0MsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO29CQUN0QixNQUFNLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7b0JBQzdDLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztvQkFFekMsSUFBSSxjQUFvQyxDQUFDO29CQUV6QyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNwQixLQUFLLFlBQVk7NEJBRWIsY0FBYyxHQUFHLGtCQUFrQixDQUFDOzRCQUNwQyxNQUFNO3dCQUVWLEtBQUssa0JBQWtCOzRCQUVuQixjQUFjLEdBQUcsZ0JBQWdCLENBQUM7NEJBQ2xDLE1BQU07cUJBQ2I7b0JBRUQsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO3dCQUM5QixNQUFNLHFCQUFxQixHQUFHLGVBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7d0JBQy9ELElBQUkscUJBQXFCLEVBQUUsTUFBTSxLQUFLLFNBQVMsRUFBRTs0QkFDN0MsT0FBTztnQ0FLSCxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxtQkFBVyxDQUFDLElBQUksQ0FBQztnQ0FDOUUsSUFBSSwrQkFBcUIsQ0FBQyxjQUFjLEVBQUUscUJBQXFCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQzs2QkFDaEYsQ0FBQzt5QkFDTDtxQkFDSjtpQkFDSjthQUNKO1lBRUQsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQztRQUN0QyxDQUFDO0tBQ0o7SUEzREQsd0NBMkRDIn0=