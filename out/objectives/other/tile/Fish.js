define(["require", "exports", "game/entity/action/actions/Cast", "game/entity/IHuman", "game/magic/MagicalPropertyType", "../../../core/objective/Objective", "../item/UseItem", "../../acquire/item/AcquireInventoryItem", "../../utility/moveTo/MoveToWater"], function (require, exports, Cast_1, IHuman_1, MagicalPropertyType_1, Objective_1, UseItem_1, AcquireInventoryItem_1, MoveToWater_1) {
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
            const ranged = context.inventory.fishing?.description()?.ranged;
            if (ranged !== undefined) {
                const itemRange = ranged.range + (context.inventory.fishing.magic.get(MagicalPropertyType_1.MagicalPropertyType.Range) ?? 0);
                const range = context.island.rangeFinder(itemRange, context.human.skill.get(IHuman_1.SkillType.Fishing), true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL3RpbGUvRmlzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixJQUFLLFNBQVEsbUJBQVM7UUFFaEMsYUFBYTtZQUNoQixPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sU0FBUyxDQUFDO1FBQ3JCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFckQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLEVBQUUsTUFBTSxDQUFDO1lBQ2hFLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDdEIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMseUNBQW1CLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3hHLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsa0JBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFdEcsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQzNCLDZCQUFlLENBQUMsYUFBYSxFQUM3QjtvQkFDSSxZQUFZLEVBQUUsS0FBSztvQkFDbkIsa0JBQWtCLEVBQUUsSUFBSTtvQkFFeEIsYUFBYSxFQUFFLElBQUk7aUJBQ3RCLENBQUMsQ0FBQyxDQUFDO2dCQUVSLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLGNBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO2FBQ2pEO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQztLQUVKO0lBbkNELHVCQW1DQyJ9