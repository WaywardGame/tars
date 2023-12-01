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
define(["require", "exports", "@wayward/game/game/entity/IStats", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/entity/action/actions/Cure", "@wayward/game/game/entity/action/actions/Eat", "@wayward/game/game/entity/action/actions/Heal", "@wayward/game/game/entity/player/IPlayer", "@wayward/game/game/item/IItem", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireItemForAction", "../other/item/UseItem", "../utility/OrganizeInventory"], function (require, exports, IStats_1, IAction_1, Cure_1, Eat_1, Heal_1, IPlayer_1, IItem_1, IObjective_1, Objective_1, AcquireItemForAction_1, UseItem_1, OrganizeInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverHealth extends Objective_1.default {
        constructor(onlyUseAvailableItems) {
            super();
            this.onlyUseAvailableItems = onlyUseAvailableItems;
            this.saveChildObjectives = false;
        }
        getIdentifier() {
            return `RecoverHealth:${this.onlyUseAvailableItems}`;
        }
        getStatus() {
            return "Recovering health";
        }
        canSaveChildObjectives() {
            return this.saveChildObjectives;
        }
        async execute(context) {
            const healItems = context.utilities.item.getInventoryItemsWithUse(context, IAction_1.ActionType.Heal);
            if (healItems.length > 0) {
                this.log.info(`Healing with ${healItems[0].getName().getString()}`);
                return new UseItem_1.default(Heal_1.default, healItems[0]);
            }
            const health = context.human.stat.get(IStats_1.Stat.Health);
            if (health.value <= 10) {
                const healthRecoveryFoodItems = Array.from(context.utilities.item.foodItemTypes)
                    .map(foodItemType => context.utilities.item.getItemsInContainerByType(context, context.human.inventory, foodItemType))
                    .flat()
                    .sort((a, b) => (IItem_1.ConsumeItemStats.resolve(b.description?.onUse?.[IAction_1.ActionType.Eat]).get(IStats_1.Stat.Health) ?? -99) - (IItem_1.ConsumeItemStats.resolve(a.description?.onUse?.[IAction_1.ActionType.Eat]).get(IStats_1.Stat.Health) ?? -99));
                if (healthRecoveryFoodItems.length > 0) {
                    return new UseItem_1.default(Eat_1.default, healthRecoveryFoodItems[0]);
                }
            }
            if (this.onlyUseAvailableItems) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const isThirsty = context.human.stat.get(IStats_1.Stat.Thirst).value <= 0;
            const isHungry = !context.human.status.Bleeding && context.human.stat.get(IStats_1.Stat.Hunger).value <= 0;
            const hasWeightProblems = context.human.getWeightStatus() !== IPlayer_1.WeightStatus.None;
            this.saveChildObjectives = !hasWeightProblems;
            const objectives = [];
            if (context.human.status.Bleeding && context.inventory.bandage) {
                objectives.push(new UseItem_1.default(Heal_1.default, "bandage"));
            }
            if (context.human.status.Poisoned && context.inventory.curePoison) {
                objectives.push(new UseItem_1.default(Cure_1.default, "curePoison"));
            }
            if (hasWeightProblems) {
                this.log.info("Reduce weight before finding a health item");
                objectives.push(new OrganizeInventory_1.default({ allowChests: false }));
            }
            else if (!isThirsty && !isHungry) {
                this.log.info("Acquire a Health item");
                objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Heal).keepInInventory());
                objectives.push(new UseItem_1.default(Heal_1.default));
            }
            return objectives;
        }
    }
    exports.default = RecoverHealth;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlckhlYWx0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3ZlckhlYWx0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFtQkgsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBSW5ELFlBQTZCLHFCQUE4QjtZQUMxRCxLQUFLLEVBQUUsQ0FBQztZQURvQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQVM7WUFGbkQsd0JBQW1CLEdBQUcsS0FBSyxDQUFDO1FBSXBDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRWUsc0JBQXNCO1lBQ3JDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO1FBQ2pDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVGLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3BFLE9BQU8sSUFBSSxpQkFBTyxDQUFDLGNBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBRUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxN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