define(["require", "exports", "game/entity/action/IAction", "../../IContext", "../../IObjective", "../../Objective", "../acquire/item/AcquireItemForAction", "../core/MoveToTarget", "./StartFire", "./UseItem"], function (require, exports, IAction_1, IContext_1, IObjective_1, Objective_1, AcquireItemForAction_1, MoveToTarget_1, StartFire_1, UseItem_1) {
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
            var _a;
            const doodad = this.doodad || context.getData(IContext_1.ContextDataType.LastBuiltDoodad);
            if (!doodad) {
                this.log.error("Invalid doodad");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const objectives = [];
            const description = doodad.description();
            if (description && !description.providesFire) {
                objectives.push(new StartFire_1.default(doodad));
            }
            if (context.inventory.fireKindling === undefined || context.inventory.fireKindling.length === 0) {
                objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.StokeFire));
            }
            objectives.push(new MoveToTarget_1.default(doodad, true));
            objectives.push(new UseItem_1.default(IAction_1.ActionType.StokeFire, (_a = context.inventory.fireKindling) === null || _a === void 0 ? void 0 : _a[0]));
            return objectives;
        }
    }
    exports.default = StokeFire;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Rva2VGaXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvU3Rva2VGaXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWFBLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixNQUFlO1lBQzNDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQVM7UUFFNUMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxhQUFhLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNuQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDL0UsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDekMsSUFBSSxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFO2dCQUM3QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3ZDO1lBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksS0FBSyxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDaEcsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUNoRTtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRWhELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsU0FBUyxFQUFFLE1BQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLDBDQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4RixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUFuQ0QsNEJBbUNDIn0=