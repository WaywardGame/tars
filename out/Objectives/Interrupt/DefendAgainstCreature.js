define(["require", "exports", "entity/action/IAction", "entity/creature/ICreature", "entity/IStats", "entity/player/IPlayer", "../../IObjective", "../../Objective", "../Core/ExecuteAction", "../Core/Lambda", "../Core/MoveToTarget", "../Other/RunAwayFromTarget"], function (require, exports, IAction_1, ICreature_1, IStats_1, IPlayer_1, IObjective_1, Objective_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, RunAwayFromTarget_1) {
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
        async execute(context) {
            const creature = this.creature;
            if (creature.getStat(IStats_1.Stat.Health).value <= 0 || !creature.isValid()) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const objectivePipelines = [];
            if (context.player.getWeightStatus() !== IPlayer_1.WeightStatus.Overburdened) {
                const health = context.player.getStat(IStats_1.Stat.Health);
                const stamina = context.player.getStat(IStats_1.Stat.Stamina);
                if ((health.value / health.max) <= 0.15 || creature.type === ICreature_1.CreatureType.Shark || stamina.value <= 2) {
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
                new Lambda_1.default(async () => IObjective_1.ObjectiveResult.Restart),
            ]);
            return objectivePipelines;
        }
    }
    exports.default = DefendAgainstCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmZW5kQWdhaW5zdENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvSW50ZXJydXB0L0RlZmVuZEFnYWluc3RDcmVhdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFxQixxQkFBc0IsU0FBUSxtQkFBUztRQUUzRCxZQUE2QixRQUFrQjtZQUM5QyxLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8seUJBQXlCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqRCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQy9CLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDM0UsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUlELE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEtBQUssc0JBQVksQ0FBQyxZQUFZLEVBQUU7Z0JBQ25FLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFXLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDN0QsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQVcsYUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssd0JBQVksQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUU7b0JBQ3RHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7b0JBQzFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksMkJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMzRDthQUNEO1lBRUQsa0JBQWtCLENBQUMsSUFBSSxDQUFDO2dCQUN2QixJQUFJLHNCQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQztnQkFDaEMsSUFBSSxnQkFBTSxDQUFDLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtvQkFDMUIsTUFBTSxTQUFTLEdBQUcsa0NBQXdCLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRXpHLE9BQU8sSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO3dCQUM3RCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQzNDLENBQUMsQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQztnQkFDRixJQUFJLGdCQUFNLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQyxDQUFDLENBQUM7WUFFSCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FDRDtJQTNDRCx3Q0EyQ0MifQ==