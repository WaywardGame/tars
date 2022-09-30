define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/actions/PickUp", "game/item/IItem", "language/Dictionary", "language/Translation", "../../core/objective/Objective", "../core/ExecuteActionForItem", "../core/MoveToTarget", "../other/tile/ClearTile"], function (require, exports, IDoodad_1, PickUp_1, IItem_1, Dictionary_1, Translation_1, Objective_1, ExecuteActionForItem_1, MoveToTarget_1, ClearTile_1) {
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
            return context.utilities.object.findDoodads(context, this.getIdentifier(), doodad => {
                if (doodad.type !== this.doodadtype || context.utilities.base.isBaseDoodad(context, doodad)) {
                    return false;
                }
                if (context.options.goodCitizen && multiplayer.isConnected() && doodad.getBuilder() !== context.human) {
                    return false;
                }
                return true;
            }, 5)
                .map(target => ([
                new MoveToTarget_1.default(target, true),
                new ClearTile_1.default(target),
                new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [this.itemType], {
                    genericAction: {
                        action: PickUp_1.default,
                        args: [],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUJ1aWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlckZyb21CdWlsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixlQUFnQixTQUFRLG1CQUFTO1FBRWxELFlBQTZCLFFBQWtCLEVBQW1CLFVBQXNCO1lBQ3BGLEtBQUssRUFBRSxDQUFDO1lBRGlCLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUV4RixDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLG1CQUFtQixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxvQkFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQ3ZGLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLENBQUM7UUFDM0csQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDaEYsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRTtvQkFDekYsT0FBTyxLQUFLLENBQUM7aUJBQ2hCO2dCQUVELElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLFdBQVcsRUFBRSxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUUsS0FBSyxPQUFPLENBQUMsS0FBSyxFQUFFO29CQUVuRyxPQUFPLEtBQUssQ0FBQztpQkFDaEI7Z0JBRUQsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDQSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNaLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO2dCQUM5QixJQUFJLG1CQUFTLENBQUMsTUFBTSxDQUFDO2dCQUNyQixJQUFJLDhCQUFvQixDQUNwQix3Q0FBaUIsQ0FBQyxPQUFPLEVBQ3pCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUNmO29CQUNJLGFBQWEsRUFBRTt3QkFDWCxNQUFNLEVBQUUsZ0JBQU07d0JBQ2QsSUFBSSxFQUFFLEVBQUU7cUJBQ1g7aUJBQ0osQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7cUJBQ3ZCLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQzthQUNqSSxDQUFDLENBQUMsQ0FBQztRQUNaLENBQUM7UUFFa0IsaUJBQWlCLENBQUMsT0FBZ0I7WUFDakQsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDO0tBRUo7SUEvQ0Qsa0NBK0NDIn0=