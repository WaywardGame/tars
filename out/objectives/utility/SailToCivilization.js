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
define(["require", "exports", "game/entity/player/quest/quest/IQuest", "game/item/IItem", "game/entity/action/actions/SailToCivilization", "../core/ReserveItems", "../quest/CompleteQuest", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireItem", "../core/ExecuteAction", "../other/item/MoveItemIntoInventory", "./moveTo/MoveToWater", "../../core/context/IContext", "../contextData/SetContextData", "../acquire/item/AcquireInventoryItem"], function (require, exports, IQuest_1, IItem_1, SailToCivilization_1, ReserveItems_1, CompleteQuest_1, IObjective_1, Objective_1, AcquireItem_1, ExecuteAction_1, MoveItemIntoInventory_1, MoveToWater_1, IContext_1, SetContextData_1, AcquireInventoryItem_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2FpbFRvQ2l2aWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9TYWlsVG9DaXZpbGl6YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBb0JILE1BQU0sYUFBYSxHQUFlO1FBQzlCLGdCQUFRLENBQUMsU0FBUztRQUNsQixnQkFBUSxDQUFDLGFBQWE7UUFDdEIsZ0JBQVEsQ0FBQyxTQUFTO1FBQ2xCLGdCQUFRLENBQUMsYUFBYTtRQUN0QixnQkFBUSxDQUFDLFNBQVM7UUFDbEIsZ0JBQVEsQ0FBQyxVQUFVO0tBQ3RCLENBQUM7SUFFRixNQUFxQixrQkFBbUIsU0FBUSxtQkFBUztRQUU5QyxhQUFhO1lBQ2hCLE9BQU8sb0JBQW9CLENBQUM7UUFDaEMsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLHlCQUF5QixDQUFDO1FBQ3JDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1QsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNyQztZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNsQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxrQkFBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLElBQUksS0FBSyxFQUFFO29CQUNQLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQzdDO2FBRUo7aUJBQU07Z0JBQ0gsS0FBSyxNQUFNLFFBQVEsSUFBSSxhQUFhLEVBQUU7b0JBQ2xDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDM0UsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTt3QkFDcEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztxQkFDOUM7aUJBQ0o7YUFDSjtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBRXRELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUVuQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQWMsQ0FBQywwQkFBZSxDQUFDLGlEQUFpRCxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBRTlHLEtBQUssTUFBTSxRQUFRLElBQUksYUFBYSxFQUFFO29CQUNsQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQzNFLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQ3BCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksK0JBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDdEc7aUJBQ0o7YUFDSjtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQ1gsSUFBSSwrQkFBcUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUNyRCxJQUFJLHFCQUFXLENBQUMsNkJBQWUsQ0FBQyxhQUFhLENBQUMsRUFDOUMsSUFBSSx1QkFBYSxDQUFDLDRCQUF3QixFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQ2xHLENBQUM7WUFFRixPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDO0tBRUo7SUF4REQscUNBd0RDIn0=