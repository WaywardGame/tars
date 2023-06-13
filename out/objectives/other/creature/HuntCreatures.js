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
define(["require", "exports", "../../../core/objective/Objective", "./HuntCreature"], function (require, exports, Objective_1, HuntCreature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HuntCreatures extends Objective_1.default {
        constructor(creatures) {
            super();
            this.creatures = creatures;
        }
        getIdentifier() {
            return `HuntCreatures:${this.creatures.map(creature => creature.toString()).join(",")}`;
        }
        getStatus() {
            return `Hunting ${this.creatures.length} creatures`;
        }
        async execute(context) {
            const objectivePipelines = [];
            for (const creature of this.creatures) {
                objectivePipelines.push([new HuntCreature_1.default(creature, true)]);
            }
            return objectivePipelines;
        }
    }
    exports.default = HuntCreatures;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHVudENyZWF0dXJlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2NyZWF0dXJlL0h1bnRDcmVhdHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBU0gsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRWhELFlBQTZCLFNBQXFCO1lBQzlDLEtBQUssRUFBRSxDQUFDO1lBRGlCLGNBQVMsR0FBVCxTQUFTLENBQVk7UUFFbEQsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM1RixDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sV0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sWUFBWSxDQUFDO1FBQ3hELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxLQUFLLE1BQU0sUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ25DLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksc0JBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQy9EO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUM5QixDQUFDO0tBRUo7SUF4QkQsZ0NBd0JDIn0=