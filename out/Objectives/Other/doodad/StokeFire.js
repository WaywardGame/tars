define(["require", "exports", "game/entity/action/IAction", "../../../IContext", "../../../IObjective", "../../../Objective", "../../acquire/item/AcquireItemForAction", "../../core/MoveToTarget", "./StartFire", "../item/UseItem"], function (require, exports, IAction_1, IContext_1, IObjective_1, Objective_1, AcquireItemForAction_1, MoveToTarget_1, StartFire_1, UseItem_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Rva2VGaXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0b2tlRmlyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxNQUFxQixTQUFVLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsTUFBZTtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFTO1FBRTVDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDakMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLElBQUksV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRTtnQkFDN0MsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUN2QztZQUVELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxZQUFZLEtBQUssU0FBUyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ2hHLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7YUFDaEU7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLFNBQVMsRUFBRSxNQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsWUFBWSwwQ0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFeEYsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUVEO0lBbkNELDRCQW1DQyJ9