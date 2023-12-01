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
define(["require", "exports", "@wayward/game/game/entity/action/actions/SailToCivilization", "@wayward/game/game/entity/player/quest/quest/IQuest", "@wayward/game/game/item/IItem", "../../core/context/IContext", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireInventoryItem", "../acquire/item/AcquireItem", "../contextData/SetContextData", "../core/ExecuteAction", "../core/ReserveItems", "../other/item/MoveItemIntoInventory", "../quest/CompleteQuest", "./moveTo/MoveToWater"], function (require, exports, SailToCivilization_1, IQuest_1, IItem_1, IContext_1, IObjective_1, Objective_1, AcquireInventoryItem_1, AcquireItem_1, SetContextData_1, ExecuteAction_1, ReserveItems_1, MoveItemIntoInventory_1, CompleteQuest_1, MoveToWater_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const requiredItems = [
        IItem_1.ItemType.GoldSword,
        IItem_1.ItemType.GoldenSextant,
        IItem_1.ItemType.GoldCoins,
        IItem_1.ItemType.GoldenChalice,
        IItem_1.ItemType.GoldenKey,
        IItem_1.ItemType.GoldenRing,
    ];
    class SailToCivilization extends Objective_1.default {
        getIdentifier() {
            return "SailToCivilization";
        }
        getStatus() {
            return "Sailing to civilization";
        }
        async execute(context) {
            const player = context.human.asPlayer;
            if (!player) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectives = [];
            if (game.isChallenge) {
                const quest = player.quests.getQuests(IQuest_1.QuestType.Challenge)?.[0];
                if (quest) {
                    objectives.push(new CompleteQuest_1.default(quest));
                }
            }
            else {
                for (const itemType of requiredItems) {
                    const items = context.utilities.item.getBaseItemsByType(context, itemType);
                    if (items.length === 0) {
                        objectives.push(new AcquireItem_1.default(itemType));
                    }
                }
            }
            objectives.push(new AcquireInventoryItem_1.default("sailboat"));
            if (!game.isChallenge) {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false));
                for (const itemType of requiredItems) {
                    const items = context.utilities.item.getBaseItemsByType(context, itemType);
                    if (items.length === 0) {
                        objectives.push(new ReserveItems_1.default(items[0]).keepInInventory(), new MoveItemIntoInventory_1.default(items[0]));
                    }
                }
            }
            objectives.push(new MoveItemIntoInventory_1.default(context.inventory.sailboat), new MoveToWater_1.default(MoveToWater_1.MoveToWaterType.SailAwayWater), new ExecuteAction_1.default(SailToCivilization_1.default, [context.inventory.sailboat, true]).setStatus(this));
            return objectives;
        }
    }
    exports.default = SailToCivilization;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2FpbFRvQ2l2aWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9TYWlsVG9DaXZpbGl6YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBb0JILE1BQU0sYUFBYSxHQUFlO1FBQ2pDLGdCQUFRLENBQUMsU0FBUztRQUNsQixnQkFBUSxDQUFDLGFBQWE7UUFDdEIsZ0JBQVEsQ0FBQyxTQUFTO1FBQ2xCLGdCQUFRLENBQUMsYUFBYTtRQUN0QixnQkFBUSxDQUFDLFNBQVM7UUFDbEIsZ0JBQVEsQ0FBQyxVQUFVO0tBQ25CLENBQUM7SUFFRixNQUFxQixrQkFBbUIsU0FBUSxtQkFBUztRQUVqRCxhQUFhO1lBQ25CLE9BQU8sb0JBQW9CLENBQUM7UUFDN0IsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHlCQUF5QixDQUFDO1FBQ2xDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDYixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO1lBQ25DLENBQUM7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN0QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxrQkFBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ1gsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDM0MsQ0FBQztZQUVGLENBQUM7aUJBQU0sQ0FBQztnQkFDUCxLQUFLLE1BQU0sUUFBUSxJQUFJLGFBQWEsRUFBRSxDQUFDO29CQUN0QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQzNFLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQzt3QkFDeEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDNUMsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBRXRELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBRXZCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsaURBQWlELEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFFOUcsS0FBSyxNQUFNLFFBQVEsSUFBSSxhQUFhLEVBQUUsQ0FBQztvQkFDdEMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUMzRSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7d0JBQ3hCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksK0JBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDcEcsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztZQUVELFVBQVUsQ0FBQyxJQUFJLENBQ2QsSUFBSSwrQkFBcUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUNyRCxJQUFJLHFCQUFXLENBQUMsNkJBQWUsQ0FBQyxhQUFhLENBQUMsRUFDOUMsSUFBSSx1QkFBYSxDQUFDLDRCQUF3QixFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQy9GLENBQUM7WUFFRixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUF4REQscUNBd0RDIn0=