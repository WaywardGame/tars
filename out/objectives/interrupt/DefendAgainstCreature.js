/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "@wayward/game/game/entity/IStats", "../../core/objective/IObjective", "../../core/objective/Objective", "../other/creature/HuntCreature", "../other/RunAwayFromTarget"], function (require, exports, IStats_1, IObjective_1, Objective_1, HuntCreature_1, RunAwayFromTarget_1) {
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
            if (creature.stat.get(IStats_1.Stat.Health).value <= 0 || !creature.isValid || creature.isTamed) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmZW5kQWdhaW5zdENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvaW50ZXJydXB0L0RlZmVuZEFnYWluc3RDcmVhdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFhSCxNQUFxQixxQkFBc0IsU0FBUSxtQkFBUztRQUUzRCxZQUE2QixRQUFrQixFQUFtQixhQUFzQjtZQUN2RixLQUFLLEVBQUUsQ0FBQztZQURvQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQW1CLGtCQUFhLEdBQWIsYUFBYSxDQUFTO1FBRXhGLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8seUJBQXlCLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3ZFLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3ZELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDL0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLElBQUksUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMvRixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO1lBQ2hDLENBQUM7WUFJRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlEQUFpRCxDQUFDLENBQUM7Z0JBQ2pFLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksMkJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVELENBQUM7WUFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHNCQUFZLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU3RCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FDRDtJQWpDRCx3Q0FpQ0MifQ==