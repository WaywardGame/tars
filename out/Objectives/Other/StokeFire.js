define(["require", "exports", "entity/action/IAction", "../../Context", "../../IObjective", "../../Objective", "../Acquire/Item/AcquireItemForAction", "../Core/MoveToTarget", "./StartFire", "./UseItem"], function (require, exports, IAction_1, Context_1, IObjective_1, Objective_1, AcquireItemForAction_1, MoveToTarget_1, StartFire_1, UseItem_1) {
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
        async execute(context) {
            const doodad = this.doodad || context.getData(Context_1.ContextDataType.LastBuiltDoodad);
            if (!doodad) {
                this.log.error("Invalid doodad");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const objectives = [];
            const description = doodad.description();
            if (description && !description.providesFire) {
                objectives.push(new StartFire_1.default(doodad));
            }
            if (context.inventory.fireStoker === undefined) {
                objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.StokeFire));
            }
            objectives.push(new MoveToTarget_1.default(doodad, true));
            objectives.push(new UseItem_1.default(IAction_1.ActionType.StokeFire, context.inventory.fireStoker));
            return objectives;
        }
    }
    exports.default = StokeFire;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Rva2VGaXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvT3RoZXIvU3Rva2VGaXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVlBLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixNQUFlO1lBQzNDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQVM7UUFFNUMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxhQUFhLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNuQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMseUJBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ2pDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxJQUFJLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUU7Z0JBQzdDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDdkM7WUFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtnQkFDL0MsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUNoRTtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRWhELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUVqRixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUFuQ0QsNEJBbUNDIn0=