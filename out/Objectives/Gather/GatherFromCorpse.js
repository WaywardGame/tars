define(["require", "exports", "game/entity/action/IAction", "language/Dictionary", "language/Translation", "../../Objective", "../../utilities/Item", "../../utilities/Object", "../../utilities/Tile", "../acquire/item/AcquireItemForAction", "../core/ExecuteActionForItem", "../core/MoveToTarget"], function (require, exports, IAction_1, Dictionary_1, Translation_1, Objective_1, Item_1, Object_1, Tile_1, AcquireItemForAction_1, ExecuteActionForItem_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromCorpse extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
            this.gatherObjectivePriority = 600;
        }
        getIdentifier() {
            return `GatherFromCorpse:${this.search.identifier}`;
        }
        getStatus() {
            return "Gathering items from corpses";
        }
        async execute(context) {
            const hasTool = Item_1.itemUtilities.hasInventoryItemForAction(context, IAction_1.ActionType.Butcher);
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
                            return Tile_1.tileUtilities.canButcherCorpse(context, context.island.getTileFromPoint(corpse), true);
                        }
                    }
                }
                return false;
            })
                .map(corpse => {
                const objectives = [];
                if (!hasTool) {
                    objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Butcher));
                }
                objectives.push(new MoveToTarget_1.default(corpse, true));
                objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Corpse, this.search.map.get(corpse.type))
                    .setStatus(() => `Carving ${Translation_1.default.nameOf(Dictionary_1.default.Creature, corpse.type).getString()} corpse`));
                return objectives;
            });
        }
        getBaseDifficulty(context) {
            return 20;
        }
    }
    exports.default = GatherFromCorpse;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNvcnBzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tQ29ycHNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUl0RCxZQUE2QixNQUFzQjtZQUNsRCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFnQjtZQUZuQyw0QkFBdUIsR0FBRyxHQUFHLENBQUM7UUFJOUMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxvQkFBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNyRCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sOEJBQThCLENBQUM7UUFDdkMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxPQUFPLEdBQUcsb0JBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLEVBQUUsb0JBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVyRixPQUFPLHdCQUFlLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLE1BQWMsRUFBRSxFQUFFO2dCQUM1RixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLFNBQVMsRUFBRTtvQkFDZCxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM1QyxJQUFJLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO3dCQUN6QyxPQUFPLEtBQUssQ0FBQztxQkFDYjtvQkFFRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztvQkFFOUIsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFNUMsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7d0JBQ2pDLElBQUksYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTs0QkFDckMsT0FBTyxvQkFBYSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO3lCQUM5RjtxQkFDRDtpQkFDRDtnQkFFRCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUMsQ0FBQztpQkFDQSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2IsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztnQkFFcEMsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDYixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsb0JBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2lCQUM5RDtnQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFaEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLHdDQUFpQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBRSxDQUFDO3FCQUNuRyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBRXpHLE9BQU8sVUFBVSxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVrQixpQkFBaUIsQ0FBQyxPQUFnQjtZQUNwRCxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7S0FFRDtJQTVERCxtQ0E0REMifQ==