define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/entity/player/IPlayer", "game/entity/action/actions/Heal", "game/entity/action/actions/Cure", "game/entity/action/actions/Eat", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireItemForAction", "../other/item/UseItem", "../utility/OrganizeInventory"], function (require, exports, IAction_1, IStats_1, IPlayer_1, Heal_1, Cure_1, Eat_1, IObjective_1, Objective_1, AcquireItemForAction_1, UseItem_1, OrganizeInventory_1) {
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
                    .sort((a, b) => (b.description?.onUse?.[IAction_1.ActionType.Eat]?.[0] ?? -99) - (a.description?.onUse?.[IAction_1.ActionType.Eat]?.[0] ?? -99));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlckhlYWx0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3ZlckhlYWx0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFnQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBSW5ELFlBQTZCLHFCQUE4QjtZQUMxRCxLQUFLLEVBQUUsQ0FBQztZQURvQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQVM7WUFGbkQsd0JBQW1CLEdBQUcsS0FBSyxDQUFDO1FBSXBDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxtQkFBbUIsQ0FBQztRQUM1QixDQUFDO1FBRWUsc0JBQXNCO1lBQ3JDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO1FBQ2pDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVGLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRSxPQUFPLElBQUksaUJBQU8sQ0FBQyxjQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdkM7WUFFRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdELElBQUksTUFB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