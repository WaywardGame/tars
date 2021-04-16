define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "../../IContext", "../../IObjective", "../../Objective", "../Acquire/Item/AcquireItemByGroup", "../Acquire/Item/AcquireItemForAction", "../Core/MoveToTarget", "./UseItem"], function (require, exports, IAction_1, IItem_1, IContext_1, IObjective_1, Objective_1, AcquireItemByGroup_1, AcquireItemForAction_1, MoveToTarget_1, UseItem_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRGaXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvT3RoZXIvU3RhcnRGaXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWNBLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixNQUFlO1lBQzNDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQVM7UUFFNUMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxhQUFhLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNuQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ2pDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxHQUFHLEtBQUssU0FBUyxJQUFJLFdBQVcsQ0FBQyxZQUFZLEVBQUU7Z0JBRTlFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBRWhEO2lCQUFNO2dCQUVOLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFO29CQUNqRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksNEJBQWtCLENBQUMscUJBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUNoRTtnQkFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtvQkFDL0MsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFrQixDQUFDLHFCQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztpQkFDOUQ7Z0JBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7b0JBQ2hELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7aUJBQ2hFO2dCQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7YUFDbEY7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUE5Q0QsNEJBOENDIn0=