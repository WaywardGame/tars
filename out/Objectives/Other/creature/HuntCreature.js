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
            var _a, _b;
            if (this.creature.stat.get(IStats_1.Stat.Health).value <= 0 || !this.creature.isValid() || this.creature.isTamed()) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const isPassable = (_b = (_a = this.creature.description()) === null || _a === void 0 ? void 0 : _a.passable) !== null && _b !== void 0 ? _b : false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHVudENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvY3JlYXR1cmUvSHVudENyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsUUFBa0IsRUFBbUIsS0FBYztZQUM1RSxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQW1CLFVBQUssR0FBTCxLQUFLLENBQVM7UUFFaEYsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxnQkFBZ0IsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDekQsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLFdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ2hELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCOztZQUNqQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDOUcsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUNsQztZQUVELE1BQU0sVUFBVSxHQUFHLE1BQUEsTUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSwwQ0FBRSxRQUFRLG1DQUFJLEtBQUssQ0FBQztZQUNsRSxJQUFJLFVBQVUsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtnQkFHcEksT0FBTztvQkFDSCxJQUFJLGNBQUksRUFBRTtvQkFDVixJQUFJLGlCQUFPLEVBQUU7aUJBQ2hCLENBQUM7YUFDTDtZQUVELE9BQU87Z0JBQ0gsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFDM0YsSUFBSSxnQkFBTSxDQUFDLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtvQkFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUU7d0JBQzFCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7cUJBQ25DO29CQUVELE1BQU0sU0FBUyxHQUFHLElBQUEsa0NBQXdCLEVBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFJbkgsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztvQkFFcEMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsS0FBSyxTQUFTLEVBQUU7d0JBQzlDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFOzRCQUM5RSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDOzRCQUNyRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO3dCQUNwQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFDdkI7b0JBWUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7d0JBQ3JFLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUMvQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO29CQUNwQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFHcEIsT0FBTyxVQUFVLENBQUM7Z0JBUXRCLENBQUMsQ0FBQztnQkFDRixJQUFJLGlCQUFPLEVBQUU7YUFDaEIsQ0FBQztRQUNOLENBQUM7S0FDSjtJQTdFRCwrQkE2RUMifQ==