define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/entity/player/IPlayer", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "../../core/Lambda", "../../core/MoveToTarget", "../../core/Restart", "../Idle"], function (require, exports, IAction_1, IStats_1, IPlayer_1, IObjective_1, Objective_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, Restart_1, Idle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HuntCreature extends Objective_1.default {
        constructor(creature, track) {
            super();
            this.creature = creature;
            this.track = track;
        }
        getIdentifier() {
            return `HuntCreature:${this.creature}:${this.track}`;
        }
        getStatus() {
            return `Hunting ${this.creature.getName()}`;
        }
        async execute(context) {
            if (this.creature.stat.get(IStats_1.Stat.Health).value <= 0 || !this.creature.isValid() || this.creature.isTamed()) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const isPassable = this.creature.description()?.passable ?? false;
            if (isPassable && context.player.x === this.creature.x && context.player.y === this.creature.y && context.player.z === this.creature.z) {
                return [
                    new Idle_1.default(),
                    new Restart_1.default(),
                ];
            }
            return [
                new MoveToTarget_1.default(this.creature, true).trackCreature(this.track ? this.creature : undefined),
                new Lambda_1.default(async (context) => {
                    if (!this.creature.isValid()) {
                        return IObjective_1.ObjectiveResult.Complete;
                    }
                    const direction = (0, IPlayer_1.getDirectionFromMovement)(this.creature.x - context.player.x, this.creature.y - context.player.y);
                    const objectives = [];
                    if (context.player.facingDirection !== direction) {
                        objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.UpdateDirection, (context, action) => {
                            action.execute(context.player, direction, undefined);
                            return IObjective_1.ObjectiveResult.Complete;
                        }).setStatus(this));
                    }
                    objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Attack, (context, action) => {
                        action.execute(context.player);
                        return IObjective_1.ObjectiveResult.Complete;
                    }).setStatus(this));
                    return objectives;
                }),
                new Restart_1.default(),
            ];
        }
    }
    exports.default = HuntCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHVudENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvY3JlYXR1cmUvSHVudENyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsUUFBa0IsRUFBbUIsS0FBYztZQUM1RSxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQW1CLFVBQUssR0FBTCxLQUFLLENBQVM7UUFFaEYsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxnQkFBZ0IsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDekQsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLFdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ2hELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFRLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUM5RyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRSxRQUFRLElBQUksS0FBSyxDQUFDO1lBQ2xFLElBQUksVUFBVSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFO2dCQUdwSSxPQUFPO29CQUNILElBQUksY0FBSSxFQUFFO29CQUNWLElBQUksaUJBQU8sRUFBRTtpQkFDaEIsQ0FBQzthQUNMO1lBRUQsT0FBTztnQkFDSCxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUMzRixJQUFJLGdCQUFNLENBQUMsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO29CQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRTt3QkFDMUIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztxQkFDbkM7b0JBRUQsTUFBTSxTQUFTLEdBQUcsSUFBQSxrQ0FBd0IsRUFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUluSCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO29CQUVwQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxLQUFLLFNBQVMsRUFBRTt3QkFDOUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7NEJBQzlFLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQ3JELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7d0JBQ3BDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3FCQUN2QjtvQkFZRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTt3QkFDckUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQy9CLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7b0JBQ3BDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUdwQixPQUFPLFVBQVUsQ0FBQztnQkFRdEIsQ0FBQyxDQUFDO2dCQUNGLElBQUksaUJBQU8sRUFBRTthQUNoQixDQUFDO1FBQ04sQ0FBQztLQUNKO0lBN0VELCtCQTZFQyJ9