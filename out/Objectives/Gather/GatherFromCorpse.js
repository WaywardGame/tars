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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNvcnBzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tQ29ycHNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUV0RCxZQUE2QixNQUFzQjtZQUNsRCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUVuRCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLG9CQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3JELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sWUFBWSxHQUFHLG9CQUFhLENBQUMseUJBQXlCLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFeEYsT0FBTyx3QkFBZSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxNQUFjLEVBQUUsRUFBRTtnQkFDNUYsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxTQUFTLEVBQUU7b0JBQ2QsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDNUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTt3QkFDekMsT0FBTyxLQUFLLENBQUM7cUJBQ2I7b0JBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7b0JBRTlCLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRTVDLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO3dCQUNqQyxJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7NEJBQ3JDLE9BQU8sb0JBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO3lCQUN6RTtxQkFDRDtpQkFDRDtnQkFFRCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUMsQ0FBQztpQkFDQSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2IsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztnQkFFcEMsSUFBSSxDQUFDLFlBQVksRUFBRTtvQkFDbEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDNUQ7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRWhELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyx3Q0FBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUUsQ0FBQztxQkFDbkcsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcscUJBQVcsQ0FBQyxNQUFNLENBQUMseUJBQVUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUV6RyxPQUFPLFVBQVUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFUyxpQkFBaUIsQ0FBQyxPQUFnQjtZQUMzQyxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7S0FFRDtJQXRERCxtQ0FzREMifQ==