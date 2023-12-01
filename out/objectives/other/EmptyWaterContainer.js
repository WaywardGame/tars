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
define(["require", "exports", "@wayward/game/game/entity/action/actions/Pour", "../../core/navigation/INavigation", "../../core/objective/Objective", "../core/MoveToTarget", "./item/UseItem"], function (require, exports, Pour_1, INavigation_1, Objective_1, MoveToTarget_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class EmptyWaterContainer extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getIdentifier() {
            return `EmptyWaterContainer:${this.item}`;
        }
        getStatus() {
            return `Emptying ${this.item?.getName()}`;
        }
        async execute(context) {
            const objectivePipelines = [];
            const targets = context.utilities.tile.getNearestTileLocation(context, INavigation_1.anyWaterTileLocation);
            for (const { tile } of targets) {
                const objectives = [];
                objectives.push(new MoveToTarget_1.default(tile, true));
                objectives.push(new UseItem_1.default(Pour_1.default, this.item));
                objectivePipelines.push(objectives);
            }
            return objectivePipelines;
        }
    }
    exports.default = EmptyWaterContainer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW1wdHlXYXRlckNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL0VtcHR5V2F0ZXJDb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBZ0JILE1BQXFCLG1CQUFvQixTQUFRLG1CQUFTO1FBRXpELFlBQTZCLElBQVU7WUFDdEMsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUV2QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHVCQUF1QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDM0MsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFlBQVksSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzNDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsa0NBQW9CLENBQUMsQ0FBQztZQUU3RixLQUFLLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDaEMsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztnQkFFcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRTlDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLGNBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFOUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3JDLENBQUM7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FDRDtJQS9CRCxzQ0ErQkMifQ==