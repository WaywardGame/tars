define(["require", "exports", "game/entity/IStats", "../../Objective", "../../utilities/Player", "./RecoverHealth", "./RecoverHunger", "./RecoverStamina", "./RecoverThirst"], function (require, exports, IStats_1, Objective_1, Player_1, RecoverHealth_1, RecoverHunger_1, RecoverStamina_1, RecoverThirst_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const poisonHealthPercentThreshold = 0.85;
    class Recover extends Objective_1.default {
        constructor(onlyUseAvailableItems) {
            super();
            this.onlyUseAvailableItems = onlyUseAvailableItems;
        }
        getIdentifier() {
            return `Recover:${this.onlyUseAvailableItems}`;
        }
        getStatus() {
            return "Recovering stats";
        }
        async execute(context) {
            const health = context.player.stat.get(IStats_1.Stat.Health);
            const needsHealthRecovery = health.value <= Player_1.playerUtilities.getRecoverThreshold(context, IStats_1.Stat.Health) ||
                context.player.status.Bleeding ||
                (context.player.status.Poisoned && (health.value / health.max) <= poisonHealthPercentThreshold);
            const exceededThirstThreshold = context.player.stat.get(IStats_1.Stat.Thirst).value <= Player_1.playerUtilities.getRecoverThreshold(context, IStats_1.Stat.Thirst);
            const exceededHungerThreshold = context.player.stat.get(IStats_1.Stat.Hunger).value <= Player_1.playerUtilities.getRecoverThreshold(context, IStats_1.Stat.Hunger);
            const exceededStaminaThreshold = context.player.stat.get(IStats_1.Stat.Stamina).value <= Player_1.playerUtilities.getRecoverThreshold(context, IStats_1.Stat.Stamina);
            const objectives = [];
            if (needsHealthRecovery) {
                objectives.push(new RecoverHealth_1.default(this.onlyUseAvailableItems));
            }
            objectives.push(new RecoverThirst_1.default(this.onlyUseAvailableItems, exceededThirstThreshold));
            objectives.push(new RecoverHunger_1.default(this.onlyUseAvailableItems, exceededHungerThreshold));
            if (exceededStaminaThreshold) {
                objectives.push(new RecoverStamina_1.default());
            }
            return objectives;
        }
    }
    exports.default = Recover;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3Zlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3JlY292ZXIvUmVjb3Zlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFNLDRCQUE0QixHQUFHLElBQUksQ0FBQztJQUUxQyxNQUFxQixPQUFRLFNBQVEsbUJBQVM7UUFFMUMsWUFBNkIscUJBQThCO1lBQ3ZELEtBQUssRUFBRSxDQUFDO1lBRGlCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBUztRQUUzRCxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLFdBQVcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDbkQsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLGtCQUFrQixDQUFDO1FBQzlCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUQsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsS0FBSyxJQUFJLHdCQUFlLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLGFBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ2pHLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVE7Z0JBQzlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksNEJBQTRCLENBQUMsQ0FBQztZQUVwRyxNQUFNLHVCQUF1QixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLHdCQUFlLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvSSxNQUFNLHVCQUF1QixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLHdCQUFlLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvSSxNQUFNLHdCQUF3QixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBUSxhQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxJQUFJLHdCQUFlLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLGFBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVsSixNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLElBQUksbUJBQW1CLEVBQUU7Z0JBQ3JCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7YUFDbEU7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO1lBRXhGLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFFeEYsSUFBSSx3QkFBd0IsRUFBRTtnQkFDMUIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLEVBQUUsQ0FBQyxDQUFDO2FBQ3pDO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQztLQUVKO0lBekNELDBCQXlDQyJ9