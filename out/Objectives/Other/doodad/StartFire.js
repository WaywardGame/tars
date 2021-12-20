define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/tile/ITileEvent", "../../../IContext", "../../../IObjective", "../../../Objective", "../../acquire/item/AcquireItemByGroup", "../../acquire/item/AcquireItemForAction", "../../core/MoveToTarget", "../item/UseItem"], function (require, exports, IAction_1, IItem_1, ITileEvent_1, IContext_1, IObjective_1, Objective_1, AcquireItemByGroup_1, AcquireItemForAction_1, MoveToTarget_1, UseItem_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRGaXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0YXJ0RmlyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFlQSxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsTUFBZTtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFTO1FBRTVDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUVNLFNBQVM7O1lBQ2YsT0FBTyx1QkFBdUIsTUFBQSxJQUFJLENBQUMsTUFBTSwwQ0FBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3hELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDakMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLEdBQUcsS0FBSyxTQUFTLElBQUksV0FBVyxDQUFDLFlBQVksRUFBRTtnQkFFOUUsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFFaEQ7aUJBQU07Z0JBQ04sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLDBCQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ2hGLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7b0JBQ3pDLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7aUJBQ2xDO2dCQUVELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFO29CQUNqRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksNEJBQWtCLENBQUMscUJBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUNoRTtnQkFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtvQkFDL0MsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFrQixDQUFDLHFCQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztpQkFDOUQ7Z0JBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7b0JBQ2hELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7aUJBQ2hFO2dCQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7YUFDbEY7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUF0REQsNEJBc0RDIn0=