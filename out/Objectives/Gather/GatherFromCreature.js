define(["require", "exports", "game/entity/action/IAction", "game/entity/IHuman", "game/item/IItem", "language/Dictionary", "language/Translation", "../../core/objective/IObjective", "../../core/objective/Objective", "../../utilities/Item", "../../utilities/Object", "../acquire/item/AcquireItem", "../acquire/item/AcquireItemForAction", "../analyze/AnalyzeInventory", "../core/AddDifficulty", "../core/ExecuteActionForItem", "../core/Lambda", "../core/MoveToTarget", "../other/item/EquipItem"], function (require, exports, IAction_1, IHuman_1, IItem_1, Dictionary_1, Translation_1, IObjective_1, Objective_1, Item_1, Object_1, AcquireItem_1, AcquireItemForAction_1, AnalyzeInventory_1, AddDifficulty_1, ExecuteActionForItem_1, Lambda_1, MoveToTarget_1, EquipItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromCreature extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
            this.gatherObjectivePriority = 700;
        }
        getIdentifier() {
            return `GatherFromCreature:${this.search.identifier}`;
        }
        getStatus() {
            return "Gathering items from creatures";
        }
        async execute(context) {
            const hasTool = Item_1.itemUtilities.hasInventoryItemForAction(context, IAction_1.ActionType.Butcher);
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
                if (!hasTool) {
                    objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Butcher));
                }
                objectives.push((new MoveToTarget_1.default(creature, false)).trackCreature(creature));
                objectives.push(new Lambda_1.default(async (context) => {
                    const corpses = context.player.getFacingTile().corpses;
                    if (corpses && corpses.length > 0) {
                        this.log.info("Carving corpse");
                        return new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Corpse, this.search.map.get(creature.type))
                            .setStatus(() => `Carving ${Translation_1.default.nameOf(Dictionary_1.default.Creature, creature.type).getString()} corpse`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlckZyb21DcmVhdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFxQkEsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFJeEQsWUFBNkIsTUFBc0I7WUFDbEQsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7WUFGbkMsNEJBQXVCLEdBQUcsR0FBRyxDQUFDO1FBSTlDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sc0JBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdkQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdDQUFnQyxDQUFDO1FBQ3pDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sT0FBTyxHQUFHLG9CQUFhLENBQUMseUJBQXlCLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFckYsT0FBTyx3QkFBZSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsUUFBa0IsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztpQkFDcEosR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNmLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7Z0JBRXBDLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRTtvQkFDdEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDekM7Z0JBR0QsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7b0JBQy9DLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSwwQkFBZ0IsRUFBRSxFQUFFLElBQUksbUJBQVMsQ0FBQyxrQkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7aUJBQ2xIO2dCQUVELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO29CQUNoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksMEJBQWdCLEVBQUUsRUFBRSxJQUFJLG1CQUFTLENBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2lCQUNwSDtnQkFFRCxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNiLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7aUJBQzlEO2dCQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHNCQUFZLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBRTdFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtvQkFDMUMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUM7b0JBQ3ZELElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO3dCQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO3dCQUNoQyxPQUFPLElBQUksOEJBQW9CLENBQUMsd0NBQWlCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFFLENBQUM7NkJBQzVGLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7cUJBQzFHO29CQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7b0JBRTNDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7Z0JBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRUosT0FBTyxVQUFVLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRWtCLGlCQUFpQixDQUFDLE9BQWdCO1lBQ3BELE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztLQUVEO0lBL0RELHFDQStEQyJ9