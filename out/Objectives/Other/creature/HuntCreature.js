define(["require", "exports", "game/entity/IStats", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget", "../../core/Restart", "../Idle"], function (require, exports, IStats_1, IObjective_1, Objective_1, MoveToTarget_1, Restart_1, Idle_1) {
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
            if (!this.creature.isValid() || this.creature.stat.get(IStats_1.Stat.Health).value <= 0 || this.creature.isTamed()) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const isPassable = this.creature.description()?.passable ?? false;
            if (isPassable && context.human.x === this.creature.x && context.human.y === this.creature.y && context.human.z === this.creature.z) {
                return [
                    new Idle_1.default(),
                    new Restart_1.default(),
                ];
            }
            return new MoveToTarget_1.default(this.creature, false, this.track ? undefined : { disableTracking: true });
        }
    }
    exports.default = HuntCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHVudENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvY3JlYXR1cmUvSHVudENyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVlBLE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixRQUFrQixFQUFtQixLQUFjO1lBQzVFLEtBQUssRUFBRSxDQUFDO1lBRGlCLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsVUFBSyxHQUFMLEtBQUssQ0FBUztRQUVoRixDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLGdCQUFnQixJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN6RCxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sV0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDaEQsQ0FBQztRQU9NLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFRLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQzlHLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDbkM7WUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxFQUFFLFFBQVEsSUFBSSxLQUFLLENBQUM7WUFDbEUsSUFBSSxVQUFVLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7Z0JBR2pJLE9BQU87b0JBQ0gsSUFBSSxjQUFJLEVBQUU7b0JBQ1YsSUFBSSxpQkFBTyxFQUFFO2lCQUNoQixDQUFDO2FBQ0w7WUFHRCxPQUFPLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDdEcsQ0FBQztLQUNKO0lBckNELCtCQXFDQyJ9