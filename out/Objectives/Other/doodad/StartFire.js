define(["require", "exports", "game/tile/ITileEvent", "game/entity/action/actions/StartFire", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireInventoryItem", "../../core/MoveToTarget", "../../../core/ITars", "../../core/ExecuteAction", "../../core/Lambda"], function (require, exports, ITileEvent_1, StartFire_1, IContext_1, IObjective_1, Objective_1, AcquireInventoryItem_1, MoveToTarget_1, ITars_1, ExecuteAction_1, Lambda_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StartFire extends Objective_1.default {
        constructor(doodad) {
            super();
            this.doodad = doodad;
        }
        getIdentifier() {
            return `StartFire:${this.doodad}`;
        }
        getStatus() {
            return `Starting a fire for ${this.doodad?.getName()}`;
        }
        async execute(context) {
            const doodad = this.doodad ?? context.getData(IContext_1.ContextDataType.LastBuiltDoodad);
            if (!doodad) {
                this.log.error("Invalid doodad");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const objectives = [];
            const description = doodad.description();
            if (!description || description.lit === undefined || description.providesFire) {
                objectives.push(new MoveToTarget_1.default(doodad, true));
            }
            else {
                if (context.island.tileEvents.getFromTile(doodad.getTile(), ITileEvent_1.TileEventType.Fire)) {
                    this.log.warn("Doodad already on fire?");
                    return IObjective_1.ObjectiveResult.Impossible;
                }
                const kindlingDataKey = this.getUniqueContextDataKey("Kindling");
                const tinderDataKey = this.getUniqueContextDataKey("Tinder");
                objectives.push(new AcquireInventoryItem_1.default("fireKindling", { skipHardReservedItems: true, reserveType: ITars_1.ReserveType.Hard }).setContextDataKey(kindlingDataKey));
                objectives.push(new AcquireInventoryItem_1.default("fireTinder", { skipHardReservedItems: true, reserveType: ITars_1.ReserveType.Hard }).setContextDataKey(tinderDataKey));
                objectives.push(new AcquireInventoryItem_1.default("fireStarter"));
                objectives.push(new MoveToTarget_1.default(doodad, true));
                objectives.push(new ExecuteAction_1.default(StartFire_1.default, (context) => {
                    if (!context.inventory.fireStarter?.isValid()) {
                        this.log.warn("Invalid fireStarter");
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    const kindling = context.getData(kindlingDataKey);
                    if (!kindling?.isValid()) {
                        this.log.warn("Invalid StartFireKindling");
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    const tinder = context.getData(tinderDataKey);
                    if (!tinder?.isValid()) {
                        this.log.warn("Invalid StartFireTinder");
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    return [context.inventory.fireStarter, undefined, kindling, tinder, undefined];
                }).setStatus(this));
                objectives.push(new Lambda_1.default(async (context) => {
                    const description = doodad.description();
                    if (!description || description.lit === undefined || description.providesFire) {
                        return IObjective_1.ObjectiveResult.Complete;
                    }
                    return IObjective_1.ObjectiveResult.Restart;
                }).setStatus(this));
            }
            return objectives;
        }
    }
    exports.default = StartFire;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRGaXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0YXJ0RmlyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFpQkEsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBRS9DLFlBQTZCLE1BQWU7WUFDM0MsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBUztRQUU1QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGFBQWEsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyx1QkFBdUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3hELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDakMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLEdBQUcsS0FBSyxTQUFTLElBQUksV0FBVyxDQUFDLFlBQVksRUFBRTtnQkFFOUUsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFFaEQ7aUJBQU07Z0JBQ04sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLDBCQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ2hGLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7b0JBQ3pDLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7aUJBQ2xDO2dCQUVELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDakUsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUU3RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsY0FBYyxFQUFFLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxtQkFBVyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztnQkFDN0osVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLFlBQVksRUFBRSxFQUFFLHFCQUFxQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsbUJBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pKLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO2dCQUV6RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFaEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsbUJBQWUsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUM5RCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLEVBQUU7d0JBQzlDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7d0JBQ3JDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7cUJBQy9CO29CQUVELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQU8sZUFBZSxDQUFDLENBQUM7b0JBQ3hELElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEVBQUU7d0JBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7d0JBQzNDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7cUJBQy9CO29CQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQU8sYUFBYSxDQUFDLENBQUM7b0JBQ3BELElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUU7d0JBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7d0JBQ3pDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7cUJBQy9CO29CQUVELE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQTRDLENBQUM7Z0JBQzNILENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVwQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLEVBQUMsT0FBTyxFQUFDLEVBQUU7b0JBQzFDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDekMsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsR0FBRyxLQUFLLFNBQVMsSUFBSSxXQUFXLENBQUMsWUFBWSxFQUFFO3dCQUM5RSxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO3FCQUNoQztvQkFHRCxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2dCQUNoQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNwQjtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FFRDtJQTlFRCw0QkE4RUMifQ==