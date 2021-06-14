define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/entity/player/IPlayer", "../../../IObjective", "../../../Objective", "../../core/ExecuteAction", "../../core/Lambda", "../../core/MoveToTarget", "../../core/Restart", "../Idle"], function (require, exports, IAction_1, IStats_1, IPlayer_1, IObjective_1, Objective_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, Restart_1, Idle_1) {
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
                    const direction = IPlayer_1.getDirectionFromMovement(this.creature.x - context.player.x, this.creature.y - context.player.y);
                    let objectives = [];
                    if (context.player.facingDirection !== direction) {
                        objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.UpdateDirection, (context, action) => {
                            action.execute(context.player, direction, undefined);
                        }));
                    }
                    objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Attack, (context, action) => {
                        action.execute(context.player);
                    }));
                    return objectives;
                }),
                new Restart_1.default(),
            ];
        }
    }
    exports.default = HuntCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHVudENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvY3JlYXR1cmUvSHVudENyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWNBLE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixRQUFrQixFQUFtQixLQUFjO1lBQzVFLEtBQUssRUFBRSxDQUFDO1lBRGlCLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsVUFBSyxHQUFMLEtBQUssQ0FBUztRQUVoRixDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLGdCQUFnQixJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN6RCxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sV0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDaEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ2pDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFRLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUM5RyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxVQUFVLEdBQUcsTUFBQSxNQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLDBDQUFFLFFBQVEsbUNBQUksS0FBSyxDQUFDO1lBQ2xFLElBQUksVUFBVSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFO2dCQUdwSSxPQUFPO29CQUNILElBQUksY0FBSSxFQUFFO29CQUNWLElBQUksaUJBQU8sRUFBRTtpQkFDaEIsQ0FBQzthQUNMO1lBRUQsT0FBTztnQkFDSCxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUMzRixJQUFJLGdCQUFNLENBQUMsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO29CQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRTt3QkFDMUIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztxQkFDbkM7b0JBRUQsTUFBTSxTQUFTLEdBQUcsa0NBQXdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFJbkgsSUFBSSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztvQkFFbEMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsS0FBSyxTQUFTLEVBQUU7d0JBQzlDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFOzRCQUM5RSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO3dCQUN6RCxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNQO29CQVlELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO3dCQUNyRSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFHSixPQUFPLFVBQVUsQ0FBQztnQkFRdEIsQ0FBQyxDQUFDO2dCQUNGLElBQUksaUJBQU8sRUFBRTthQUNoQixDQUFDO1FBQ04sQ0FBQztLQUNKO0lBM0VELCtCQTJFQyJ9