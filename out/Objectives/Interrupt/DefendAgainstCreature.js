define(["require", "exports", "game/entity/IStats", "../../core/objective/IObjective", "../../core/objective/Objective", "../other/creature/HuntCreature", "../other/RunAwayFromTarget"], function (require, exports, IStats_1, IObjective_1, Objective_1, HuntCreature_1, RunAwayFromTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DefendAgainstCreature extends Objective_1.default {
        constructor(creature, shouldRunAway) {
            super();
            this.creature = creature;
            this.shouldRunAway = shouldRunAway;
        }
        getIdentifier() {
            return `DefendAgainstCreature:${this.creature}:${this.shouldRunAway}`;
        }
        getStatus() {
            return `Defending against ${this.creature.getName()}`;
        }
        async execute(context) {
            const creature = this.creature;
            if (creature.stat.get(IStats_1.Stat.Health).value <= 0 || !creature.isValid() || creature.isTamed()) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const objectivePipelines = [];
            if (this.shouldRunAway) {
                this.log.info("Running away from creature instead of defending");
                objectivePipelines.push([new RunAwayFromTarget_1.default(creature)]);
            }
            objectivePipelines.push([new HuntCreature_1.default(creature, false)]);
            return objectivePipelines;
        }
    }
    exports.default = DefendAgainstCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmZW5kQWdhaW5zdENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvaW50ZXJydXB0L0RlZmVuZEFnYWluc3RDcmVhdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTQSxNQUFxQixxQkFBc0IsU0FBUSxtQkFBUztRQUUzRCxZQUE2QixRQUFrQixFQUFtQixhQUFzQjtZQUN2RixLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQW1CLGtCQUFhLEdBQWIsYUFBYSxDQUFTO1FBRXhGLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8seUJBQXlCLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3ZFLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3ZELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDL0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2xHLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFJRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO2dCQUNqRSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDJCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMzRDtZQUVELGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksc0JBQVksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTdELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztLQUNEO0lBakNELHdDQWlDQyJ9