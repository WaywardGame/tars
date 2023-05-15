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
define(["require", "exports", "./BaseMode", "../objectives/other/tile/Fish"], function (require, exports, BaseMode_1, Fish_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AnglerMode = void 0;
    class AnglerMode extends BaseMode_1.BaseMode {
        async initialize(_, finished) {
        }
        async determineObjectives(context) {
            const objectives = [];
            objectives.push(...await this.getBuildAnotherChestObjectives(context));
            objectives.push(new Fish_1.default());
            return objectives;
        }
    }
    exports.AnglerMode = AnglerMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5nbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL0FuZ2xlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBV0gsTUFBYSxVQUFXLFNBQVEsbUJBQVE7UUFFaEMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7UUFDeEUsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjtZQUNoRCxNQUFNLFVBQVUsR0FBcUMsRUFBRSxDQUFDO1lBRXhELFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBRXZFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxjQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRTVCLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FDRDtJQWRELGdDQWNDIn0=