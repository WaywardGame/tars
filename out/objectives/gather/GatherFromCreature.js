/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "@wayward/game/game/entity/IHuman", "@wayward/game/game/item/IItem", "@wayward/game/language/Dictionary", "@wayward/game/language/Translation", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireInventoryItem", "../acquire/item/AcquireItem", "../analyze/AnalyzeInventory", "../core/AddDifficulty", "../core/ExecuteActionForItem", "../core/Lambda", "../other/creature/HuntCreature", "../other/item/EquipItem"], function (require, exports, IHuman_1, IItem_1, Dictionary_1, Translation_1, IObjective_1, Objective_1, AcquireInventoryItem_1, AcquireItem_1, AnalyzeInventory_1, AddDifficulty_1, ExecuteActionForItem_1, Lambda_1, HuntCreature_1, EquipItem_1) {
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
        getStatus() {
            return "Gathering items from creatures";
        }
        async execute(context) {
            return context.utilities.object.findCreatures(context, this.getIdentifier(), (creature) => this.search.map.has(creature.type) && !creature.isTamed && !context.utilities.creature.isScaredOfCreature(context.human, creature))
                .map(creature => {
                const objectives = [];
                if (creature.aberrant) {
                    objectives.push(new AddDifficulty_1.default(1000));
                }
                if (context.inventory.equipSword === undefined && !context.options.lockEquipment) {
                    objectives.push(new AcquireItem_1.default(IItem_1.ItemType.WoodenSword), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.MainHand));
                }
                if (context.inventory.equipShield === undefined && !context.options.lockEquipment) {
                    objectives.push(new AcquireItem_1.default(IItem_1.ItemType.WoodenShield), new AnalyzeInventory_1.default(), new EquipItem_1.default(IHuman_1.EquipType.OffHand));
                }
                objectives.push(new AcquireInventoryItem_1.default("butcher"));
                objectives.push(new HuntCreature_1.default(creature, true));
                objectives.push(new Lambda_1.default(async (context) => {
                    const corpses = context.human.facingTile.corpses;
                    if (corpses && corpses.length > 0) {
                        this.log.info("Carving corpse");
                        return new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Corpse, this.search.map.get(creature.type))
                            .setStatus(() => `Carving ${Translation_1.default.nameOf(Dictionary_1.default.Creature, creature.type).getString()} corpse`);
                    }
                    this.log.warn("Still attacking creature?");
                    return IObjective_1.ObjectiveResult.Restart;
                }).setStatus(this));
                return objectives;
            });
        }
        getBaseDifficulty(context) {
            return 150;
        }
    }
    exports.default = GatherFromCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvZ2F0aGVyL0dhdGhlckZyb21DcmVhdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFxQkgsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFeEQsWUFBNkIsTUFBc0I7WUFDbEQsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFFbkQsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxzQkFBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN2RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sZ0NBQWdDLENBQUM7UUFDekMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLFFBQWtCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztpQkFDdE8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNmLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7Z0JBRXBDLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUN2QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxDQUFDO2dCQUdELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEtBQUssU0FBUyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDbEYsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLEVBQUUsSUFBSSxtQkFBUyxDQUFDLGtCQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDbkgsQ0FBQztnQkFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBVyxLQUFLLFNBQVMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7b0JBQ25GLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSwwQkFBZ0IsRUFBRSxFQUFFLElBQUksbUJBQVMsQ0FBQyxrQkFBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ25ILENBQUM7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBRXJELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVsRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLEVBQUMsT0FBTyxFQUFDLEVBQUU7b0JBQzFDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztvQkFDakQsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDaEMsT0FBTyxJQUFJLDhCQUFvQixDQUFDLHdDQUFpQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBRSxDQUFDOzZCQUM1RixTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUMzRyxDQUFDO29CQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7b0JBRTNDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7Z0JBQ2hDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVwQixPQUFPLFVBQVUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFa0IsaUJBQWlCLENBQUMsT0FBZ0I7WUFDcEQsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDO0tBRUQ7SUF6REQscUNBeURDIn0=