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
                if (tileEventManager.get(doodad.getTile(), ITileEvent_1.TileEventType.Fire)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRGaXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0YXJ0RmlyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFlQSxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsTUFBZTtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFTO1FBRTVDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDL0UsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsR0FBRyxLQUFLLFNBQVMsSUFBSSxXQUFXLENBQUMsWUFBWSxFQUFFO2dCQUU5RSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUVoRDtpQkFBTTtnQkFDTixJQUFJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsMEJBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDL0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztvQkFDekMsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQztpQkFDbEM7Z0JBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksS0FBSyxTQUFTLEVBQUU7b0JBQ2pELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw0QkFBa0IsQ0FBQyxxQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7aUJBQ2hFO2dCQUVELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFO29CQUMvQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksNEJBQWtCLENBQUMscUJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2lCQUM5RDtnQkFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtvQkFDaEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztpQkFDaEU7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRWhELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzthQUNsRjtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FFRDtJQWxERCw0QkFrREMifQ==