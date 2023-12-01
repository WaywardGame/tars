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
define(["require", "exports", "@wayward/game/language/Dictionary", "@wayward/game/language/Translation", "../../core/objective/Objective", "../acquire/item/AcquireInventoryItem", "../core/ExecuteActionForItem", "../core/MoveToTarget"], function (require, exports, Dictionary_1, Translation_1, Objective_1, AcquireInventoryItem_1, ExecuteActionForItem_1, MoveToTarget_1) {
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
            return context.utilities.object.findCarvableCorpses(context, this.getIdentifier(), (corpse) => {
                const itemTypes = this.search.map.get(corpse.type);
                if (itemTypes) {
                    const resources = corpse.getResources(true);
                    if (!resources || resources.length === 0) {
                        return false;
                    }
                    const step = corpse.step || 0;
                    const possibleItems = resources.slice(step);
                    return itemTypes.some(itemType => possibleItems.includes(itemType));
                }
                return false;
            })
                .map(corpse => {
                return [
                    new AcquireInventoryItem_1.default("butcher"),
                    new MoveToTarget_1.default(corpse, true),
                    new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Corpse, this.search.map.get(corpse.type))
                        .setStatus(() => `Carving ${Translation_1.default.nameOf(Dictionary_1.default.Creature, corpse.type).getString()} corpse`),
                ];
            });
        }
        getBaseDifficulty(context) {
            return 20;
        }
    }
    exports.default = GatherFromCorpse;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNvcnBzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tQ29ycHNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWFILE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBRXRELFlBQTZCLE1BQXNCO1lBQ2xELEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQWdCO1FBRW5ELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sb0JBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDckQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLDhCQUE4QixDQUFDO1FBQ3ZDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLE1BQWMsRUFBRSxFQUFFO2dCQUNyRyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUNmLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzVDLElBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQzt3QkFDMUMsT0FBTyxLQUFLLENBQUM7b0JBQ2QsQ0FBQztvQkFFRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztvQkFFOUIsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFNUMsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNyRSxDQUFDO2dCQUVELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQyxDQUFDO2lCQUNBLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDYixPQUFPO29CQUNOLElBQUksOEJBQW9CLENBQUMsU0FBUyxDQUFDO29CQUNuQyxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQztvQkFDOUIsSUFBSSw4QkFBb0IsQ0FBQyx3Q0FBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUUsQ0FBQzt5QkFDbkYsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7aUJBQ3ZHLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFa0IsaUJBQWlCLENBQUMsT0FBZ0I7WUFDcEQsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO0tBRUQ7SUE5Q0QsbUNBOENDIn0=