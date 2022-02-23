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
            return context.utilities.object.findDoodads(context, `${this.getIdentifier()}|1`, doodad => doodad.type === this.doodadtype && !context.utilities.base.isBaseDoodad(context, doodad), 5)
                .map(target => ([
                new MoveToTarget_1.default(target, true),
                new ClearTile_1.default(target),
                new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], {
                    actionType: IAction_1.ActionType.Pickup,
                    executor: (context, action) => {
                        action.execute(context.actionExecutor);
                    },
                }).passAcquireData(this)
                    .setStatus(() => `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.doodadtype).getString()} from ${target.getName()}`),
            ]));
        }
        getBaseDifficulty(context) {
            return 20;
        }
    }
    exports.default = GatherFromBuilt;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUJ1aWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlckZyb21CdWlsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixlQUFnQixTQUFRLG1CQUFTO1FBRWxELFlBQTZCLFFBQWtCLEVBQW1CLFVBQXNCO1lBQ3BGLEtBQUssRUFBRSxDQUFDO1lBRGlCLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUV4RixDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLG1CQUFtQixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxvQkFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQ3ZGLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLENBQUM7UUFDM0csQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQzVFLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3JHLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ1osSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7Z0JBQzlCLElBQUksbUJBQVMsQ0FBQyxNQUFNLENBQUM7Z0JBQ3JCLElBQUksOEJBQW9CLENBQ3BCLHdDQUFpQixDQUFDLE9BQU8sRUFDekIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQ2Y7b0JBQ0ksVUFBVSxFQUFFLG9CQUFVLENBQUMsTUFBTTtvQkFDN0IsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO3dCQUMxQixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDM0MsQ0FBQztpQkFDSixDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztxQkFDdkIsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO2FBQ2pJLENBQUMsQ0FBQyxDQUFDO1FBQ1osQ0FBQztRQUVrQixpQkFBaUIsQ0FBQyxPQUFnQjtZQUNqRCxPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUM7S0FFSjtJQXJDRCxrQ0FxQ0MifQ==