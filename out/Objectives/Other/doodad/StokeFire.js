define(["require", "exports", "game/entity/action/actions/StokeFire", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget", "./StartFire", "../../acquire/item/AcquireInventoryItem", "../../../core/ITars", "../../core/ExecuteAction"], function (require, exports, StokeFire_1, IContext_1, IObjective_1, Objective_1, MoveToTarget_1, StartFire_1, AcquireInventoryItem_1, ITars_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StokeFire extends Objective_1.default {
        constructor(doodad) {
            super();
            this.doodad = doodad;
        }
        getIdentifier() {
            return `StokeFire:${this.doodad}`;
        }
        getStatus() {
            return `Stoking ${this.doodad?.getName()}`;
        }
        async execute(context) {
            const doodad = this.doodad ?? context.getData(IContext_1.ContextDataType.LastBuiltDoodad);
            if (!doodad) {
                this.log.error("Invalid doodad");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const itemContextDataKey = this.getUniqueContextDataKey("Kindling");
            const objectives = [];
            const description = doodad.description();
            if (description && !description.providesFire) {
                objectives.push(new StartFire_1.default(doodad));
            }
            objectives.push(new AcquireInventoryItem_1.default("fireKindling", { skipHardReservedItems: true, reserveType: ITars_1.ReserveType.Hard }).setContextDataKey(itemContextDataKey));
            objectives.push(new MoveToTarget_1.default(doodad, true));
            objectives.push(new ExecuteAction_1.default(StokeFire_1.default, (context) => {
                const kindling = context.getData(itemContextDataKey);
                if (!kindling?.isValid()) {
                    this.log.warn("Invalid StokeFire kindling");
                    return IObjective_1.ObjectiveResult.Restart;
                }
                return [kindling];
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = StokeFire;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Rva2VGaXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0b2tlRmlyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFpQkEsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBRS9DLFlBQTZCLE1BQWU7WUFDM0MsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBUztRQUU1QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGFBQWEsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxXQUFXLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUM1QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ2pDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUVwRSxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxJQUFJLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUU7Z0JBQzdDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDdkM7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsY0FBYyxFQUFFLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxtQkFBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBRWhLLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRWhELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG1CQUFlLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDOUQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBTyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFO29CQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO29CQUM1QyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2lCQUMvQjtnQkFFRCxPQUFPLENBQUMsUUFBUSxDQUE0QyxDQUFDO1lBQzlELENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXBCLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FFRDtJQS9DRCw0QkErQ0MifQ==