define(["require", "exports", "game/entity/action/IAction", "game/entity/IStats", "game/entity/player/IPlayer", "game/entity/IHuman", "../../../IObjective", "../../../Objective", "../../core/ExecuteAction", "../../core/Lambda", "../../core/MoveToTarget", "../../core/Restart", "../Idle"], function (require, exports, IAction_1, IStats_1, IPlayer_1, IHuman_1, IObjective_1, Objective_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, Restart_1, Idle_1) {
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
                    var _a;
                    const direction = IPlayer_1.getDirectionFromMovement(this.creature.x - context.player.x, this.creature.y - context.player.y);
                    if ((_a = this.creature.description()) === null || _a === void 0 ? void 0 : _a.passable) {
                        let objectives = [];
                        if (context.player.facingDirection !== direction) {
                            objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.UpdateDirection, (context, action) => {
                                action.execute(context.player, direction, undefined);
                            }));
                        }
                        const leftHandItem = context.player.options.leftHand ? context.player.getEquippedItem(IHuman_1.EquipType.LeftHand) : undefined;
                        const rightHandItem = context.player.options.rightHand ? context.player.getEquippedItem(IHuman_1.EquipType.RightHand) : undefined;
                        const weapon = leftHandItem !== null && leftHandItem !== void 0 ? leftHandItem : rightHandItem;
                        if (weapon) {
                            objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Melee, (context, action) => {
                                action.execute(context.player, weapon);
                            }));
                        }
                        else {
                            objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Attack, (context, action) => {
                                action.execute(context.player);
                            }));
                        }
                        return objectives;
                    }
                    else {
                        return new ExecuteAction_1.default(IAction_1.ActionType.Move, (context, action) => {
                            action.execute(context.player, direction);
                        });
                    }
                }),
                new Restart_1.default(),
            ];
        }
    }
    exports.default = HuntCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHVudENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvY3JlYXR1cmUvSHVudENyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixRQUFrQixFQUFtQixLQUFjO1lBQzVFLEtBQUssRUFBRSxDQUFDO1lBRGlCLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsVUFBSyxHQUFMLEtBQUssQ0FBUztRQUVoRixDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLGdCQUFnQixJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN6RCxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sV0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDaEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ2pDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFRLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUM5RyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxVQUFVLEdBQUcsTUFBQSxNQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLDBDQUFFLFFBQVEsbUNBQUksS0FBSyxDQUFDO1lBQ2xFLElBQUksVUFBVSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FB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