define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/entity/player/IPlayer", "../../IObjective", "../../Objective", "../../Utilities/Creature", "../Core/ExecuteAction", "../Core/Lambda", "../Core/MoveToTarget", "../Core/Restart", "../Other/RunAwayFromTarget"], function (require, exports, IAction_1, IStats_1, IPlayer_1, IObjective_1, Objective_1, Creature_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, Restart_1, RunAwayFromTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DefendAgainstCreature extends Objective_1.default {
        constructor(creature) {
            super();
            this.creature = creature;
        }
        getIdentifier() {
            return `DefendAgainstCreature:${this.creature}`;
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
            if (context.player.getWeightStatus() !== IPlayer_1.WeightStatus.Overburdened) {
                const health = context.player.stat.get(IStats_1.Stat.Health);
                const stamina = context.player.stat.get(IStats_1.Stat.Stamina);
                if ((health.value / health.max) <= 0.15 || Creature_1.isScaredOfCreature(context, creature) || stamina.value <= 2) {
                    this.log.info("Running away from target");
                    objectivePipelines.push([new RunAwayFromTarget_1.default(creature)]);
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmZW5kQWdhaW5zdENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvSW50ZXJydXB0L0RlZmVuZEFnYWluc3RDcmVhdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFlQSxNQUFxQixxQkFBc0IsU0FBUSxtQkFBUztRQUUzRCxZQUE2QixRQUFrQjtZQUM5QyxLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8seUJBQXlCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqRCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8scUJBQXFCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUN2RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQy9CLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVEsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNsRyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBSUQsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsS0FBSyxzQkFBWSxDQUFDLFlBQVksRUFBRTtnQkFDbkUsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDOUQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLGFBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSw2QkFBa0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUU7b0JBQ3ZHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7b0JBQzFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksMkJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMzRDthQUNEO1lBRUQsa0JBQWtCLENBQUMsSUFBSSxDQUFDO2dCQUN2QixJQUFJLHNCQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQztnQkFDaEMsSUFBSSxnQkFBTSxDQUFDLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtvQkFDMUIsTUFBTSxTQUFTLEdBQUcsa0NBQXdCLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRXpHLE9BQU8sSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO3dCQUM3RCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQzNDLENBQUMsQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQztnQkFDRixJQUFJLGlCQUFPLEVBQUU7YUFDYixDQUFDLENBQUM7WUFFSCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FDRDtJQS9DRCx3Q0ErQ0MifQ==