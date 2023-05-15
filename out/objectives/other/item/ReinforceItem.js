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
define(["require", "exports", "game/entity/action/actions/Reinforce", "game/entity/action/IAction", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItemForAction", "../../contextData/SetContextData", "../../core/ExecuteAction", "../../core/Lambda", "../../core/ReserveItems"], function (require, exports, Reinforce_1, IAction_1, IObjective_1, Objective_1, AcquireItemForAction_1, SetContextData_1, ExecuteAction_1, Lambda_1, ReserveItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReinforceItem extends Objective_1.default {
        constructor(item, options = {}) {
            super();
            this.item = item;
            this.options = options;
        }
        getIdentifier() {
            return `ReinforceItem:${this.item}:${this.options.targetDurabilityMultipler}:${this.options.minWorth}`;
        }
        getStatus() {
            return `Reinforcing ${this.item.getName()}`;
        }
        async execute(context) {
            if (!this.item.isValid()) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (!this.needsReinforcement(context)) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            this.log.info(`Reinforcing item. Current durability: ${this.item.durability}/${this.item.durabilityMax}`);
            const itemContextDataKey = this.getUniqueContextDataKey("ReinforceItem");
            const objectives = [];
            const reinforceItems = context.utilities.item.getInventoryItemsWithUse(context, IAction_1.ActionType.Reinforce);
            if (reinforceItems.length > 0) {
                objectives.push(new ReserveItems_1.default(reinforceItems[0]).keepInInventory());
                objectives.push(new SetContextData_1.default(itemContextDataKey, reinforceItems[0]));
            }
            else {
                objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Reinforce).setContextDataKey(itemContextDataKey));
            }
            objectives.push(new ExecuteAction_1.default(Reinforce_1.default, (context) => {
                const reinforceItem = context.getData(itemContextDataKey);
                if (!reinforceItem) {
                    this.log.error("Invalid reinforce item");
                    return IObjective_1.ObjectiveResult.Restart;
                }
                return [reinforceItem, this.item];
            }).setStatus(this), new Lambda_1.default(async (context) => {
                if (this.needsReinforcement(context)) {
                    this.log.info("Needs more reinforcement");
                    return IObjective_1.ObjectiveResult.Restart;
                }
                return IObjective_1.ObjectiveResult.Complete;
            }).setStatus(this));
            return objectives;
        }
        needsReinforcement(context) {
            const minDur = this.item.durability;
            const maxDur = this.item.durabilityMax;
            if (minDur === undefined || maxDur === undefined) {
                return false;
            }
            if (this.options.minWorth !== undefined) {
                const worth = this.item.description?.worth;
                if (worth === undefined || worth < this.options.minWorth) {
                    return false;
                }
            }
            if (this.options.targetDurabilityMultipler !== undefined) {
                const defaultDurability = context.island.items.getDefaultDurability(context.human, this.item.weight, this.item.type, true);
                if (maxDur / defaultDurability >= this.options.targetDurabilityMultipler) {
                    return false;
                }
            }
            return true;
        }
    }
    exports.default = ReinforceItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVpbmZvcmNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vUmVpbmZvcmNlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFxQkgsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLElBQVUsRUFBbUIsVUFBNEUsRUFBRTtZQUN2SSxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFNO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQXVFO1FBRXhJLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hHLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDekIsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3RDLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBRTFHLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGVBQWUsQ0FBQyxDQUFD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