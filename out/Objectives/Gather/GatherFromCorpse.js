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
        getStatus() {
            return "Gathering items from corpses";
        }
        async execute(context) {
            const hasCarveItem = Item_1.itemUtilities.hasInventoryItemForAction(context, IAction_1.ActionType.Carve);
            return Object_1.objectUtilities.findCarvableCorpses(context, this.getIdentifier(), (corpse) => {
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
                            return Tile_1.tileUtilities.canCarveCorpse(game.getTileFromPoint(corpse), true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNvcnBzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tQ29ycHNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUV0RCxZQUE2QixNQUFzQjtZQUNsRCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUVuRCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLG9CQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3JELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyw4QkFBOEIsQ0FBQztRQUN2QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFlBQVksR0FBRyxvQkFBYSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXhGLE9BQU8sd0JBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsTUFBYyxFQUFFLEVBQUU7Z0JBQzVGLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25ELElBQUksU0FBUyxFQUFFO29CQUNkLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzVDLElBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQ3pDLE9BQU8sS0FBSyxDQUFDO3FCQUNiO29CQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO29CQUU5QixNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUU1QyxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTt3QkFDakMsSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFOzRCQUNyQyxPQUFPLG9CQUFhLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzt5QkFDekU7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDLENBQUM7aUJBQ0EsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNiLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7Z0JBRXBDLElBQUksQ0FBQyxZQUFZLEVBQUU7b0JBQ2xCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQzVEO2dCQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsd0NBQWlCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFFLENBQUM7cUJBQ25HLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLHFCQUFXLENBQUMsTUFBTSxDQUFDLHlCQUFVLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFFekcsT0FBTyxVQUFVLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRVMsaUJBQWlCLENBQUMsT0FBZ0I7WUFDM0MsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO0tBRUQ7SUExREQsbUNBMERDIn0=