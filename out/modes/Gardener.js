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
define(["require", "exports", "../objectives/core/Restart", "../objectives/acquire/item/specific/AcquireAndPlantSeed", "./BaseMode"], function (require, exports, Restart_1, AcquireAndPlantSeed_1, BaseMode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GardenerMode = void 0;
    class GardenerMode extends BaseMode_1.BaseMode {
        async initialize(_, finished) {
        }
        async determineObjectives(context) {
            const objectives = [];
            objectives.push(...await this.getBuildAnotherChestObjectives(context));
            objectives.push([new AcquireAndPlantSeed_1.default(context.options.gardenerOnlyEdiblePlants), new Restart_1.default()]);
            return objectives;
        }
    }
    exports.GardenerMode = GardenerMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FyZGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvR2FyZGVuZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQVNILE1BQWEsWUFBYSxTQUFRLG1CQUFRO1FBSWxDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9DO1FBRXhFLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDaEQsTUFBTSxVQUFVLEdBQXFDLEVBQUUsQ0FBQztZQUV4RCxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsOEJBQThCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUV2RSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSw2QkFBbUIsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLEVBQUUsSUFBSSxpQkFBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBY3BHLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FDRDtJQTdCRCxvQ0E2QkMifQ==