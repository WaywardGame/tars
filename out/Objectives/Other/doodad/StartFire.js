define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITileEvent", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItemByGroup", "../../acquire/item/AcquireItemForAction", "../../core/MoveToTarget", "../item/UseItem"], function (require, exports, IAction_1, IItem_1, ITileEvent_1, IContext_1, IObjective_1, Objective_1, AcquireItemByGroup_1, AcquireItemForAction_1, MoveToTarget_1, UseItem_1) {
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
            var _a;
            return `Starting a fire for ${(_a = this.doodad) === null || _a === void 0 ? void 0 : _a.getName()}`;
        }
        async execute(context) {
            const doodad = this.doodad || context.getData(IContext_1.ContextDataType.LastBuiltDoodad);
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
                if (context.inventory.fireKindling === undefined) {
                    objectives.push(new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.Kindling));
                }
                if (context.inventory.fireTinder === undefined) {
                    objectives.push(new AcquireItemByGroup_1.default(IItem_1.ItemTypeGroup.Tinder));
                }
                if (context.inventory.fireStarter === undefined) {
                    objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.StartFire));
                }
                objectives.push(new MoveToTarget_1.default(doodad, true));
                objectives.push(new UseItem_1.default(IAction_1.ActionType.StartFire, context.inventory.fireStarter));
            }
            return objectives;
        }
    }
    exports.default = StartFire;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRGaXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0YXJ0RmlyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFnQkEsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBRS9DLFlBQTZCLE1BQWU7WUFDM0MsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBUztRQUU1QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGFBQWEsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFFTSxTQUFTOztZQUNmLE9BQU8sdUJBQXVCLE1BQUEsSUFBSSxDQUFDLE1BQU0sMENBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUN4RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ2pDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxHQUFHLEtBQUssU0FBUyxJQUFJLFdBQVcsQ0FBQyxZQUFZLEVBQUU7Z0JBRTlFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBRWhEO2lCQUFNO2dCQUNOLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSwwQkFBYSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNoRixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO29CQUN6QyxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2lCQUNsQztnQkFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTtvQkFDakQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFrQixDQUFDLHFCQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFDaEU7Z0JBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7b0JBQy9DLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw0QkFBa0IsQ0FBQyxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7aUJBQzlEO2dCQUVELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO29CQUNoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsb0JBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2lCQUNoRTtnQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFaEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLENBQUMsb0JBQVUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2FBQ2xGO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUVEO0lBdERELDRCQXNEQyJ9