define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/item/IItem", "language/Dictionary", "language/Translation", "../../core/objective/Objective", "../core/ExecuteActionForItem", "../core/MoveToTarget", "../other/tile/ClearTile"], function (require, exports, IDoodad_1, IAction_1, IItem_1, Dictionary_1, Translation_1, Objective_1, ExecuteActionForItem_1, MoveToTarget_1, ClearTile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromBuilt extends Objective_1.default {
        constructor(itemType, doodadtype) {
            super();
            this.itemType = itemType;
            this.doodadtype = doodadtype;
        }
        getIdentifier() {
            return `GatherFromBuilt:${IItem_1.ItemType[this.itemType]}:${IDoodad_1.DoodadType[this.doodadtype]}`;
        }
        getStatus() {
            return `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} from built doodad`;
        }
        async execute(context) {
            return context.utilities.object.findDoodads(context, `${this.getIdentifier()}|1`, doodad => doodad.type === this.doodadtype, 5)
                .map(target => {
                const objectives = [];
                objectives.push(new MoveToTarget_1.default(target, true));
                objectives.push(new ClearTile_1.default(target));
                objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], {
                    actionType: IAction_1.ActionType.Pickup,
                    executor: (context, action) => {
                        action.execute(context.actionExecutor);
                    },
                }).passAcquireData(this)
                    .setStatus(() => `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.doodadtype).getString()} from ${target.getName()}`));
                return objectives;
            });
        }
        getBaseDifficulty(context) {
            return 20;
        }
    }
    exports.default = GatherFromBuilt;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUJ1aWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlckZyb21CdWlsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixlQUFnQixTQUFRLG1CQUFTO1FBRWxELFlBQTZCLFFBQWtCLEVBQW1CLFVBQXNCO1lBQ3BGLEtBQUssRUFBRSxDQUFDO1lBRGlCLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUV4RixDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLG1CQUFtQixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxvQkFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQ3ZGLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLENBQUM7UUFDM0csQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2lCQUMxSCxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ1YsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztnQkFFcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FDcEMsd0NBQWlCLENBQUMsT0FBTyxFQUN6QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFDZjtvQkFDSSxVQUFVLEVBQUUsb0JBQVUsQ0FBQyxNQUFNO29CQUM3QixRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7d0JBQzFCLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUMzQyxDQUFDO2lCQUNKLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO3FCQUN2QixTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNoSSxPQUFPLFVBQVUsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztRQUNYLENBQUM7UUFFa0IsaUJBQWlCLENBQUMsT0FBZ0I7WUFDakQsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDO0tBRUo7SUF2Q0Qsa0NBdUNDIn0=