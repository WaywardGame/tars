define(["require", "exports", "game/entity/action/IAction", "game/entity/player/quest/quest/IQuest", "game/item/IItem", "../core/ReserveItems", "../quest/CompleteQuest", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireItem", "../analyze/AnalyzeInventory", "../core/ExecuteAction", "../other/item/MoveItemIntoInventory", "./moveTo/MoveToWater", "../../core/context/IContext", "../contextData/SetContextData"], function (require, exports, IAction_1, IQuest_1, IItem_1, ReserveItems_1, CompleteQuest_1, IObjective_1, Objective_1, AcquireItem_1, AnalyzeInventory_1, ExecuteAction_1, MoveItemIntoInventory_1, MoveToWater_1, IContext_1, SetContextData_1) {
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
            const objectives = [];
            if (game.isChallenge) {
                const quests = context.player.quests.getQuests(IQuest_1.QuestType.Challenge);
                const quest = quests[0];
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
            if (!context.inventory.sailBoat) {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.Sailboat), new AnalyzeInventory_1.default());
            }
            if (!game.isChallenge) {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false));
                for (const itemType of requiredItems) {
                    const items = context.utilities.item.getBaseItemsByType(context, itemType);
                    if (items.length === 0) {
                        objectives.push(new ReserveItems_1.default(items[0]).keepInInventory(), new MoveItemIntoInventory_1.default(items[0]));
                    }
                }
            }
            objectives.push(new MoveItemIntoInventory_1.default(context.inventory.sailBoat), new MoveToWater_1.default(true), new ExecuteAction_1.default(IAction_1.ActionType.SailToCivilization, (context, action) => {
                action.execute(context.player, context.inventory.sailBoat, true);
                return IObjective_1.ObjectiveResult.Complete;
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = SailToCivilization;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2FpbFRvQ2l2aWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9TYWlsVG9DaXZpbGl6YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBa0JBLE1BQU0sYUFBYSxHQUFlO1FBQzlCLGdCQUFRLENBQUMsU0FBUztRQUNsQixnQkFBUSxDQUFDLGFBQWE7UUFDdEIsZ0JBQVEsQ0FBQyxTQUFTO1FBQ2xCLGdCQUFRLENBQUMsYUFBYTtRQUN0QixnQkFBUSxDQUFDLFNBQVM7UUFDbEIsZ0JBQVEsQ0FBQyxVQUFVO0tBQ3RCLENBQUM7SUFFRixNQUFxQixrQkFBbUIsU0FBUSxtQkFBUztRQUU5QyxhQUFhO1lBQ2hCLE9BQU8sb0JBQW9CLENBQUM7UUFDaEMsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLHlCQUF5QixDQUFDO1FBQ3JDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNsQixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDcEUsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLEtBQUssRUFBRTtvQkFDUCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUM3QzthQUVKO2lCQUFNO2dCQUNILEtBQUssTUFBTSxRQUFRLElBQUksYUFBYSxFQUFFO29CQUNsQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQzNFLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQ3BCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7cUJBQzlDO2lCQUNKO2FBQ0o7WUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUU7Z0JBQzdCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSwwQkFBZ0IsRUFBRSxDQUFDLENBQUM7YUFDL0U7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFFbkIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxpREFBaUQsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUU5RyxLQUFLLE1BQU0sUUFBUSxJQUFJLGFBQWEsRUFBRTtvQkFDbEMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUMzRSxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO3dCQUNwQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBRSxJQUFJLCtCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ3RHO2lCQUNKO2FBQ0o7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUNYLElBQUksK0JBQXFCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFDckQsSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQyxFQUNyQixJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDakUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNqRSxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FDckIsQ0FBQztZQUVGLE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7S0FFSjtJQXpERCxxQ0F5REMifQ==