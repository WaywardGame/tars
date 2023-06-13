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
define(["require", "exports", "../../../core/objective/Objective", "./HarvestDoodad"], function (require, exports, Objective_1, HarvestDoodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HarvestDoodads extends Objective_1.default {
        constructor(doodads) {
            super();
            this.doodads = doodads;
        }
        getIdentifier() {
            return `HarvestDoodads:${this.doodads.map(doodad => doodad.toString()).join(",")}`;
        }
        getStatus() {
            return `Harvesting from ${this.doodads.length} objects`;
        }
        async execute(context) {
            const objectivePipelines = [];
            for (const doodad of this.doodads) {
                objectivePipelines.push([new HarvestDoodad_1.default(doodad)]);
            }
            return objectivePipelines;
        }
    }
    exports.default = HarvestDoodads;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFydmVzdERvb2RhZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9kb29kYWQvSGFydmVzdERvb2RhZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBU0gsTUFBcUIsY0FBZSxTQUFRLG1CQUFTO1FBRWpELFlBQTZCLE9BQWlCO1lBQzFDLEtBQUssRUFBRSxDQUFDO1lBRGlCLFlBQU8sR0FBUCxPQUFPLENBQVU7UUFFOUMsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxrQkFBa0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUN2RixDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sbUJBQW1CLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxVQUFVLENBQUM7UUFDNUQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDL0Isa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSx1QkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN4RDtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDOUIsQ0FBQztLQUVKO0lBeEJELGlDQXdCQyJ9