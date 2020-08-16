define(["require", "exports", "entity/action/IAction", "entity/IHuman", "item/IItem", "../../IObjective", "../../Objective", "../../Utilities/Item", "../../Utilities/Object", "../Acquire/Item/AcquireItem", "../Acquire/Item/AcquireItemForAction", "../Analyze/AnalyzeInventory", "../Core/AddDifficulty", "../Core/ExecuteActionForItem", "../Core/Lambda", "../Core/MoveToTarget", "../Other/Equip"], function (require, exports, IAction_1, IHuman_1, IItem_1, IObjective_1, Objective_1, Item_1, Object_1, AcquireItem_1, AcquireItemForAction_1, AnalyzeInventory_1, AddDifficulty_1, ExecuteActionForItem_1, Lambda_1, MoveToTarget_1, Equip_1) {
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
            const hasCarveItem = Item_1.getInventoryItemsWithUse(context, IAction_1.ActionType.Carve).length > 0;
            return Object_1.findCreatures(context, this.getIdentifier(), (creature) => this.search.map.has(creature.type) && !creature.isTamed())
                .map(creature => {
                const objectives = [];
                if (creature.aberrant) {
                    objectives.push(new AddDifficulty_1.default(1000));
                }
                if (context.inventory.equipSword === undefined) {
                    objectives.push(new AcquireItem_1.default(IItem_1.ItemType.WoodenSword), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.LeftHand));
                }
                if (context.inventory.equipShield === undefined) {
                    objectives.push(new AcquireItem_1.default(IItem_1.ItemType.WoodenShield), new AnalyzeInventory_1.default(), new Equip_1.default(IHuman_1.EquipType.RightHand));
                }
                if (!hasCarveItem) {
                    objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Carve));
                }
                objectives.push((new MoveToTarget_1.default(creature, false)).trackCreature(creature));
                objectives.push(new Lambda_1.default(async (context) => {
                    const corpses = context.player.getFacingTile().corpses;
                    if (corpses && corpses.length > 0) {
                        this.log.info("Carving corpse");
                        return new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Corpse, this.search.map.get(creature.type));
                    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvR2F0aGVyL0dhdGhlckZyb21DcmVhdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFvQkEsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFeEQsWUFBNkIsTUFBc0I7WUFDbEQsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFFbkQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxzQkFBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN2RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFlBQVksR0FBRywrQkFBd0IsQ0FBQyxPQUFPLEVBQUUsb0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBRXBGLE9BQU8sc0JBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsUUFBa0IsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztpQkFDcEksR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNmLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7Z0JBRXBDLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRTtvQkFDdEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDekM7Z0JBR0QsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7b0JBQy9DLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSwwQkFBZ0IsRUFBRSxFQUFFLElBQUksZUFBSyxDQUFDLGtCQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFDOUc7Z0JBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7b0JBQ2hELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSwwQkFBZ0IsRUFBRSxFQUFFLElBQUksZUFBSyxDQUFDLGtCQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztpQkFDaEg7Z0JBRUQsSUFBSSxDQUFDLFlBQVksRUFBRTtvQkFDbEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDNUQ7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksc0JBQVksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFFN0UsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO29CQUMxQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQztvQkFDdkQsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQ2hDLE9BQU8sSUFBSSw4QkFBb0IsQ0FBQyx3Q0FBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFDO3FCQUMvRjtvQkFFRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVKLE9BQU8sVUFBVSxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVTLGlCQUFpQixDQUFDLE9BQWdCO1lBQzNDLE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztLQUVEO0lBdERELHFDQXNEQyJ9