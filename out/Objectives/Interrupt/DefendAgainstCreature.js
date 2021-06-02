define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/entity/player/IPlayer", "../../IObjective", "../../Objective", "../core/ExecuteAction", "../core/Lambda", "../core/MoveToTarget", "../core/Restart", "../other/RunAwayFromTarget"], function (require, exports, IAction_1, IStats_1, IPlayer_1, IObjective_1, Objective_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, Restart_1, RunAwayFromTarget_1) {
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
            objectivePipelines.push([
                new MoveToTarget_1.default(creature, true),
                new Lambda_1.default(async (context) => {
                    const direction = IPlayer_1.getDirectionFromMovement(creature.x - context.player.x, creature.y - context.player.y);
                    return new ExecuteAction_1.default(IAction_1.ActionType.Move, (context, action) => {
                        action.execute(context.player, direction);
                    });
                }),
                new Restart_1.default(),
            ]);
            return objectivePipelines;
        }
    }
    exports.default = DefendAgainstCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmZW5kQWdhaW5zdENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvaW50ZXJydXB0L0RlZmVuZEFnYWluc3RDcmVhdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFxQixxQkFBc0IsU0FBUSxtQkFBUztRQUUzRCxZQUE2QixRQUFrQixFQUFtQixhQUFzQjtZQUN2RixLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQW1CLGtCQUFhLEdBQWIsYUFBYSxDQUFTO1FBRXhGLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8seUJBQXlCLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3ZFLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3ZELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDL0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2xHLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFJRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO2dCQUNqRSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDJCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMzRDtZQUVELGtCQUFrQixDQUFDLElBQUksQ0FBQztnQkFDdkIsSUFBSSxzQkFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUM7Z0JBQ2hDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLEVBQUMsT0FBTyxFQUFDLEVBQUU7b0JBQzFCLE1BQU0sU0FBUyxHQUFHLGtDQUF3QixDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUV6RyxPQUFPLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTt3QkFDN0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUMzQyxDQUFDLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUM7Z0JBQ0YsSUFBSSxpQkFBTyxFQUFFO2FBQ2IsQ0FBQyxDQUFDO1lBRUgsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUEzQ0Qsd0NBMkNDIn0=