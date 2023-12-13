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
define(["require", "exports", "@wayward/game/game/entity/action/actions/Sacrifice", "@wayward/game/game/item/IItem", "@wayward/game/game/deity/Deity", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/Restart", "../acquire/item/AcquireInventoryItem", "../other/item/BuildItem", "../other/item/MoveItemIntoInventory", "../core/MoveToTarget", "../other/item/MoveItem", "../core/ExecuteAction", "../core/ReserveItems"], function (require, exports, Sacrifice_1, IItem_1, Deity_1, IObjective_1, Objective_1, Restart_1, AcquireInventoryItem_1, BuildItem_1, MoveItemIntoInventory_1, MoveToTarget_1, MoveItem_1, ExecuteAction_1, ReserveItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                let runes = context.utilities.item.getBaseItems(context).filter(item => item.isInGroup(IItem_1.ItemTypeGroup.ArtifactOfInvocation));
                runes = runes.slice(0, 5);
                objectives.push(new ReserveItems_1.default(...runes));
                for (const item of runes) {
                    objectives.push(new MoveItemIntoInventory_1.default(item));
                }
                objectives.push(new MoveToTarget_1.default(context.base.altar[0], true));
                for (const item of runes) {
                    objectives.push(new MoveItem_1.default(item, altar));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVpdHlTYWNyaWZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L0RlaXR5U2FjcmlmaWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQW9CSCxNQUFxQixjQUFlLFNBQVEsbUJBQVM7UUFFcEQsWUFBNkIsS0FBWTtZQUN4QyxLQUFLLEVBQUUsQ0FBQztZQURvQixVQUFLLEdBQUwsS0FBSyxDQUFPO1FBRXpDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sa0JBQWtCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN2QyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sd0JBQXdCLGFBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNwRCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNyQyxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO1lBQy9CLENBQUM7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNyQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxtQkFBUyxFQUFFLEVBQUUsSUFBSSxpQkFBTyxFQUFFLENBQUMsQ0FBQztZQUVwRixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXBDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO2dCQUc1SCxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRTFCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFFNUMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztvQkFDMUIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLCtCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2xELENBQUM7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFL0QsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztvQkFDMUIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGtCQUFRLENBQUMsSUFBSSxFQUFFLEtBQW1CLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxDQUFDO2dCQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG1CQUFTLEVBQUUsR0FBRyxFQUFFO29CQUNqRCxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBd0MsQ0FBQztnQkFDOUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckIsQ0FBQztZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FFRDtJQXBERCxpQ0FvREMifQ==