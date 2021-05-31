define(["require", "exports", "game/entity/action/IAction", "language/Dictionaries", "language/Translation", "../../Objective", "../../utilities/Item", "../../utilities/Object", "../../utilities/Tile", "../acquire/item/AcquireItemForAction", "../core/ExecuteActionForItem", "../core/MoveToTarget"], function (require, exports, IAction_1, Dictionaries_1, Translation_1, Objective_1, Item_1, Object_1, Tile_1, AcquireItemForAction_1, ExecuteActionForItem_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromCorpse extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
        }
        getIdentifier() {
            return `GatherFromCorpse:${this.search.identifier}`;
        }
        async execute(context) {
            const hasCarveItem = Item_1.hasInventoryItemForAction(context, IAction_1.ActionType.Carve);
            return Object_1.findCarvableCorpses(context, this.getIdentifier(), (corpse) => {
                const itemTypes = this.search.map.get(corpse.type);
                if (itemTypes) {
                    const resources = corpse.getResources(true);
                    if (!resources || resources.length === 0) {
                        return false;
                    }
                    const step = corpse.step || 0;
                    const possibleItems = resources.slice(step);
                    for (const itemType of itemTypes) {
                        if (possibleItems.includes(itemType)) {
                            return Tile_1.canCarveCorpse(game.getTileFromPoint(corpse), true);
                        }
                    }
                }
                return false;
            })
                .map(corpse => {
                const objectives = [];
                if (!hasCarveItem) {
                    objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Carve));
                }
                objectives.push(new MoveToTarget_1.default(corpse, true));
                objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Corpse, this.search.map.get(corpse.type))
                    .setStatus(() => `Carving ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Creature, corpse.type).getString()} corpse`));
                return objectives;
            });
        }
        getBaseDifficulty(context) {
            return 20;
        }
    }
    exports.default = GatherFromCorpse;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNvcnBzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tQ29ycHNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUV0RCxZQUE2QixNQUFzQjtZQUNsRCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUVuRCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLG9CQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3JELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sWUFBWSxHQUFHLGdDQUF5QixDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTFFLE9BQU8sNEJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLE1BQWMsRUFBRSxFQUFFO2dCQUM1RSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLFNBQVMsRUFBRTtvQkFDZCxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM1QyxJQUFJLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO3dCQUN6QyxPQUFPLEtBQUssQ0FBQztxQkFDYjtvQkFFRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztvQkFFOUIsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFNUMsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7d0JBQ2pDLElBQUksYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTs0QkFDckMsT0FBTyxxQkFBYyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzt5QkFDM0Q7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDLENBQUM7aUJBQ0EsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNiLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7Z0JBRXBDLElBQUksQ0FBQyxZQUFZLEVBQUU7b0JBQ2xCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQzVEO2dCQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsd0NBQWlCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFFLENBQUM7cUJBQ25HLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLHFCQUFXLENBQUMsTUFBTSxDQUFDLHlCQUFVLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFFekcsT0FBTyxVQUFVLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRVMsaUJBQWlCLENBQUMsT0FBZ0I7WUFDM0MsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO0tBRUQ7SUF0REQsbUNBc0RDIn0=