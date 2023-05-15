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
define(["require", "exports", "../../../core/objective/Objective", "./TameCreature"], function (require, exports, Objective_1, TameCreature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TameCreatures extends Objective_1.default {
        constructor(creatures) {
            super();
            this.creatures = creatures;
        }
        getIdentifier() {
            return `TameCreatures:${this.creatures.map(creature => creature.toString()).join(",")}`;
        }
        getStatus() {
            return "Looking for creature to tame";
        }
        async execute(context) {
            const objectivePipelines = [];
            for (const creature of this.creatures) {
                objectivePipelines.push([new TameCreature_1.default(creature)]);
            }
            return objectivePipelines;
        }
    }
    exports.default = TameCreatures;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFtZUNyZWF0dXJlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2NyZWF0dXJlL1RhbWVDcmVhdHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBU0gsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRWhELFlBQTZCLFNBQXFCO1lBQzlDLEtBQUssRUFBRSxDQUFDO1lBRGlCLGNBQVMsR0FBVCxTQUFTLENBQVk7UUFFbEQsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUM1RixDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sOEJBQThCLENBQUM7UUFDMUMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLEtBQUssTUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbkMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxzQkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN6RDtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDOUIsQ0FBQztLQUVKO0lBeEJELGdDQXdCQyJ9