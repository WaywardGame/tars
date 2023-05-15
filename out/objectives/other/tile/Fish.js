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
define(["require", "exports", "game/entity/action/actions/Cast", "game/entity/IHuman", "game/magic/MagicalPropertyType", "../../../core/objective/Objective", "../../acquire/item/AcquireInventoryItem", "../../utility/moveTo/MoveToWater", "../item/UseItem"], function (require, exports, Cast_1, IHuman_1, MagicalPropertyType_1, Objective_1, AcquireInventoryItem_1, MoveToWater_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Fish extends Objective_1.default {
        getIdentifier() {
            return "Fish";
        }
        getStatus() {
            return "Fishing";
        }
        async execute(context) {
            const objectives = [];
            objectives.push(new AcquireInventoryItem_1.default("fishing"));
            const ranged = context.inventory.fishing?.description?.ranged;
            if (ranged !== undefined) {
                const itemRange = ranged.range + (context.inventory.fishing.magic?.get(MagicalPropertyType_1.MagicalPropertyType.Range) ?? 0);
                const range = context.island.rangeFinder(itemRange, context.human.skill.get(IHuman_1.SkillType.Fishing), "max");
                objectives.push(new MoveToWater_1.default(MoveToWater_1.MoveToWaterType.FishableWater, {
                    fishingRange: range,
                    moveToAdjacentTile: true,
                    disallowBoats: true
                }));
                objectives.push(new UseItem_1.default(Cast_1.default, "fishing"));
            }
            return objectives;
        }
    }
    exports.default = Fish;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL3RpbGUvRmlzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFjSCxNQUFxQixJQUFLLFNBQVEsbUJBQVM7UUFFaEMsYUFBYTtZQUNoQixPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sU0FBUyxDQUFDO1FBQ3JCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFckQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQztZQUM5RCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3RCLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQVEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLHlDQUFtQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN6RyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGtCQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRXZHLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUMzQiw2QkFBZSxDQUFDLGFBQWEsRUFDN0I7b0JBQ0ksWUFBWSxFQUFFLEtBQUs7b0JBQ25CLGtCQUFrQixFQUFFLElBQUk7b0JBRXhCLGFBQWEsRUFBRSxJQUFJO2lCQUN0QixDQUFDLENBQUMsQ0FBQztnQkFFUixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxjQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUNqRDtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7S0FFSjtJQW5DRCx1QkFtQ0MifQ==