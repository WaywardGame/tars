define(["require", "exports", "game/entity/action/IAction", "game/entity/IHuman", "game/item/IItem", "language/Dictionaries", "language/Translation", "../../IObjective", "../../Objective", "../../utilities/Item", "../../utilities/Object", "../acquire/item/AcquireItem", "../acquire/item/AcquireItemForAction", "../analyze/AnalyzeInventory", "../core/AddDifficulty", "../core/ExecuteActionForItem", "../core/Lambda", "../core/MoveToTarget", "../other/item/EquipItem"], function (require, exports, IAction_1, IHuman_1, IItem_1, Dictionaries_1, Translation_1, IObjective_1, Objective_1, Item_1, Object_1, AcquireItem_1, AcquireItemForAction_1, AnalyzeInventory_1, AddDifficulty_1, ExecuteActionForItem_1, Lambda_1, MoveToTarget_1, EquipItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromCreature extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
        }
        getIdentifier() {
            return `GatherFromCreature:${this.search.identifier}`;
        }
        async execute(context) {
            const hasCarveItem = Item_1.itemUtilities.hasInventoryItemForAction(context, IAction_1.ActionType.Carve);
            return Object_1.objectUtilities.findCreatures(context, this.getIdentifier(), (creature) => this.search.map.has(creature.type) && !creature.isTamed())
                .map(creature => {
                const objectives = [];
                if (creature.aberrant) {
                    objectives.push(new AddDifficulty_1.default(1000));
                }
                if (context.inventory.equipSword === undefined) {
                    objectives.push(new AcquireItem_1.default(IItem_1.ItemType.WoodenSword), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.LeftHand));
                }
                if (context.inventory.equipShield === undefined) {
                    objectives.push(new AcquireItem_1.default(IItem_1.ItemType.WoodenShield), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.RightHand));
                }
                if (!hasCarveItem) {
                    objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Carve));
                }
                objectives.push((new MoveToTarget_1.default(creature, false)).trackCreature(creature));
                objectives.push(new Lambda_1.default(async (context) => {
                    const corpses = context.player.getFacingTile().corpses;
                    if (corpses && corpses.length > 0) {
                        this.log.info("Carving corpse");
                        return new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Corpse, this.search.map.get(creature.type))
                            .setStatus(() => `Carving ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Creature, creature.type).getString()} corpse`);
                    }
                    this.log.warn("Still attacking creature?");
                    return IObjective_1.ObjectiveResult.Complete;
                }));
                return objectives;
            });
        }
        getBaseDifficulty(context) {
            return 150;
        }
    }
    exports.default = GatherFromCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlckZyb21DcmVhdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFzQkEsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFeEQsWUFBNkIsTUFBc0I7WUFDbEQsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFFbkQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxzQkFBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN2RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFlBQVksR0FBRyxvQkFBYSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXhGLE9BQU8sd0JBQWUsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLFFBQWtCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQ3BKLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDZixNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO2dCQUVwQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUU7b0JBQ3RCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQ3pDO2dCQUdELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFO29CQUMvQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksMEJBQWdCLEVBQUUsRUFBRSxJQUFJLG1CQUFLLENBQUMsa0JBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUM5RztnQkFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtvQkFDaEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLEVBQUUsSUFBSSxtQkFBSyxDQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztpQkFDaEg7Z0JBRUQsSUFBSSxDQUFDLFlBQVksRUFBRTtvQkFDbEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDNUQ7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksc0JBQVksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFFN0UsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO29CQUMxQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQztvQkFDdkQsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQ2hDLE9BQU8sSUFBSSw4QkFBb0IsQ0FBQyx3Q0FBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUUsQ0FBQzs2QkFDNUYsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcscUJBQVcsQ0FBQyxNQUFNLENBQUMseUJBQVUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztxQkFDMUc7b0JBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztvQkFFM0MsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDakMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFSixPQUFPLFVBQVUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFUyxpQkFBaUIsQ0FBQyxPQUFnQjtZQUMzQyxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7S0FFRDtJQXpERCxxQ0F5REMifQ==