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
define(["require", "exports", "@wayward/game/game/entity/action/actions/OpenBottle", "@wayward/game/game/item/IItem", "../../../../core/objective/IObjective", "../../../../core/objective/Objective", "../../../contextData/SetContextData", "../../../core/ExecuteActionForItem", "../../../core/ReserveItems", "../AcquireItem"], function (require, exports, OpenBottle_1, IItem_1, IObjective_1, Objective_1, SetContextData_1, ExecuteActionForItem_1, ReserveItems_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireWaterContainer extends Objective_1.default {
        getIdentifier() {
            return "AcquireWaterContainer";
        }
        getStatus() {
            return "Acquiring a water container";
        }
        async execute(context) {
            const itemContextDataKey = this.getUniqueContextDataKey("MessageInABottle");
            const messageInABottleObjectives = [];
            const messageInABottleItem = context.utilities.item.getItemInInventory(context, IItem_1.ItemType.MessageInABottle);
            if (messageInABottleItem) {
                messageInABottleObjectives.push(new ReserveItems_1.default(messageInABottleItem));
                messageInABottleObjectives.push(new SetContextData_1.default(itemContextDataKey, messageInABottleItem));
            }
            else {
                messageInABottleObjectives.push(new AcquireItem_1.default(IItem_1.ItemType.MessageInABottle).passAcquireData(this).setContextDataKey(itemContextDataKey));
            }
            messageInABottleObjectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [IItem_1.ItemType.GlassBottle], {
                genericAction: {
                    action: OpenBottle_1.default,
                    args: (context) => {
                        const item = context.getData(itemContextDataKey);
                        if (!item?.isValid) {
                            this.log.warn(`Invalid message in a bottle item. ${messageInABottleItem}`);
                            return IObjective_1.ObjectiveResult.Restart;
                        }
                        return [item];
                    },
                },
            }).setStatus("Opening glass bottle"));
            return [
                [new AcquireItem_1.default(IItem_1.ItemType.Waterskin).passAcquireData(this)],
                [new AcquireItem_1.default(IItem_1.ItemType.ClayJug).passAcquireData(this)],
                [new AcquireItem_1.default(IItem_1.ItemType.GlassBottle).passAcquireData(this)],
                messageInABottleObjectives,
            ];
        }
    }
    exports.default = AcquireWaterContainer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZVdhdGVyQ29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL3NwZWNpZmljL0FjcXVpcmVXYXRlckNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFjSCxNQUFxQixxQkFBc0IsU0FBUSxtQkFBUztRQUVwRCxhQUFhO1lBQ25CLE9BQU8sdUJBQXVCLENBQUM7UUFDaEMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLDZCQUE2QixDQUFDO1FBQ3RDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFNUUsTUFBTSwwQkFBMEIsR0FBaUIsRUFBRSxDQUFDO1lBRXBELE1BQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLGdCQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMzRyxJQUFJLG9CQUFvQixFQUFFLENBQUM7Z0JBQzFCLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO2dCQUN4RSwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSx3QkFBYyxDQUFDLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUUvRixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUN6SSxDQUFDO1lBRUQsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQ3ZELHdDQUFpQixDQUFDLE9BQU8sRUFDekIsQ0FBQyxnQkFBUSxDQUFDLFdBQVcsQ0FBQyxFQUN0QjtnQkFDQyxhQUFhLEVBQUU7b0JBQ2QsTUFBTSxFQUFFLG9CQUFVO29CQUNsQixJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRTt3QkFDakIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3dCQUNqRCxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDOzRCQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDOzRCQUMzRSxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO3dCQUNoQyxDQUFDO3dCQUVELE9BQU8sQ0FBQyxJQUFJLENBQXlDLENBQUM7b0JBQ3ZELENBQUM7aUJBQ0Q7YUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUV2QyxPQUFPO2dCQUNOLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzRCxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDekQsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzdELDBCQUEwQjthQUMxQixDQUFDO1FBQ0gsQ0FBQztLQUVEO0lBbERELHdDQWtEQyJ9