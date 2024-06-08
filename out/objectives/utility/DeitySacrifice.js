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
define(["require", "exports", "@wayward/game/game/entity/action/actions/Sacrifice", "@wayward/game/game/item/IItem", "@wayward/game/game/deity/Deity", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/Restart", "../acquire/item/AcquireInventoryItem", "../other/item/BuildItem", "../other/item/MoveItemsIntoInventory", "../core/MoveToTarget", "../other/item/MoveItems", "../core/ExecuteAction", "../core/ReserveItems"], function (require, exports, Sacrifice_1, IItem_1, Deity_1, IObjective_1, Objective_1, Restart_1, AcquireInventoryItem_1, BuildItem_1, MoveItemsIntoInventory_1, MoveToTarget_1, MoveItems_1, ExecuteAction_1, ReserveItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const deityItemLimit = 5;
    class DeitySacrifice extends Objective_1.default {
        constructor(deity) {
            super();
            this.deity = deity;
        }
        getIdentifier() {
            return `DeitySacrifice:${this.deity}`;
        }
        getStatus() {
            return `Sacrificing items to ${Deity_1.Deity[this.deity]}`;
        }
        async execute(context) {
            if (context.human.alignment.invoked) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const objectives = [];
            if (context.base.altar.length === 0) {
                objectives.push(new AcquireInventoryItem_1.default("altar"), new BuildItem_1.default(), new Restart_1.default());
            }
            else {
                const altar = context.base.altar[0];
                if (altar.containedItems.length < deityItemLimit) {
                    let runes = context.utilities.item.getBaseItems(context).filter(item => item.isInGroup(IItem_1.ItemTypeGroup.ArtifactOfInvocation));
                    runes = runes.slice(0, deityItemLimit);
                    if (runes.length === 0) {
                        return IObjective_1.ObjectiveResult.Impossible;
                    }
                    objectives.push(new ReserveItems_1.default(...runes));
                    for (const item of runes) {
                        objectives.push(new MoveItemsIntoInventory_1.default(item));
                    }
                    objectives.push(new MoveToTarget_1.default(context.base.altar[0], true));
                    for (const item of runes) {
                        objectives.push(new MoveItems_1.default(item, altar));
                    }
                }
                objectives.push(new ExecuteAction_1.default(Sacrifice_1.default, () => {
                    return [{ deity: this.deity, altar }];
                }).setStatus(this));
            }
            return objectives;
        }
    }
    exports.default = DeitySacrifice;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVpdHlTYWNyaWZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L0RlaXR5U2FjcmlmaWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQW9CSCxNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUE7SUFFeEIsTUFBcUIsY0FBZSxTQUFRLG1CQUFTO1FBRXBELFlBQTZCLEtBQVk7WUFDeEMsS0FBSyxFQUFFLENBQUM7WUFEb0IsVUFBSyxHQUFMLEtBQUssQ0FBTztRQUV6QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGtCQUFrQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHdCQUF3QixhQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDckMsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztZQUMvQixDQUFDO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDckMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksbUJBQVMsRUFBRSxFQUFFLElBQUksaUJBQU8sRUFBRSxDQUFDLENBQUM7WUFFcEYsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVwQyxJQUFJLEtBQUssQ0FBQyxjQUFlLENBQUMsTUFBTSxHQUFHLGNBQWMsRUFBRSxDQUFDO29CQUVuRCxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztvQkFHNUgsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUV2QyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7d0JBQ3hCLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7b0JBQ25DLENBQUM7b0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUU1QyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO3dCQUMxQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQXNCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDbkQsQ0FBQztvQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUUvRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO3dCQUMxQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBbUIsQ0FBQyxDQUFDLENBQUM7b0JBQzNELENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxtQkFBUyxFQUFFLEdBQUcsRUFBRTtvQkFDakQsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQXdDLENBQUM7Z0JBQzlFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLENBQUM7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUEzREQsaUNBMkRDIn0=