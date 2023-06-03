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
define(["require", "exports", "../../../core/objective/Objective", "game/doodad/IDoodad", "./waterSource/StartDripStone", "./waterSource/StartSolarStill", "./waterSource/StartWaterStillDesalination"], function (require, exports, Objective_1, IDoodad_1, StartDripStone_1, StartSolarStill_1, StartWaterStillDesalination_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StartWaterSourceDoodad extends Objective_1.default {
        constructor(doodad) {
            super();
            this.doodad = doodad;
        }
        getIdentifier() {
            return `StartWaterSourceDoodad:${this.doodad}`;
        }
        getStatus() {
            return `Starting ${this.doodad.getName()}`;
        }
        async execute(context) {
            if (this.doodad.isInGroup(IDoodad_1.DoodadTypeGroup.Dripstone)) {
                return new StartDripStone_1.default(this.doodad);
            }
            if (this.doodad.type === IDoodad_1.DoodadType.SolarStill) {
                return new StartSolarStill_1.default(this.doodad);
            }
            return new StartWaterStillDesalination_1.default(this.doodad);
        }
    }
    exports.default = StartWaterSourceDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRXYXRlclNvdXJjZURvb2RhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2Rvb2RhZC9TdGFydFdhdGVyU291cmNlRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQVlILE1BQXFCLHNCQUF1QixTQUFRLG1CQUFTO1FBRXpELFlBQTZCLE1BQWM7WUFDdkMsS0FBSyxFQUFFLENBQUM7WUFEaUIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUUzQyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLDBCQUEwQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkQsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLFlBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQy9DLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMseUJBQWUsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDbEQsT0FBTyxJQUFJLHdCQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzFDO1lBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxvQkFBVSxDQUFDLFVBQVUsRUFBRTtnQkFDNUMsT0FBTyxJQUFJLHlCQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzNDO1lBRUQsT0FBTyxJQUFJLHFDQUEyQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4RCxDQUFDO0tBRUo7SUExQkQseUNBMEJDIn0=