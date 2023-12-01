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
define(["require", "exports", "../objectives/other/doodad/HarvestDoodads", "./BaseMode"], function (require, exports, HarvestDoodads_1, BaseMode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HarvesterMode = void 0;
    class HarvesterMode extends BaseMode_1.BaseMode {
        async initialize(_, finished) {
        }
        async determineObjectives(context) {
            const objectives = [];
            const doodads = context.utilities.object.findDoodads(context, "Harvester", doodad => doodad.canHarvest(), 10);
            if (doodads.length > 0) {
                objectives.push(...await this.getBuildAnotherChestObjectives(context));
                objectives.push(new HarvestDoodads_1.default(doodads));
            }
            return objectives;
        }
    }
    exports.HarvesterMode = HarvesterMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFydmVzdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL0hhcnZlc3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBUUgsTUFBYSxhQUFjLFNBQVEsbUJBQVE7UUFJbkMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7UUFFeEUsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjtZQUNoRCxNQUFNLFVBQVUsR0FBcUMsRUFBRSxDQUFDO1lBRXhELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlHLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLDhCQUE4QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx3QkFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDOUMsQ0FBQztZQWNELE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FDRDtJQS9CRCxzQ0ErQkMifQ==