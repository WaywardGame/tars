define(["require", "exports", "game/entity/action/actions/Cast", "./BaseMode", "../objectives/acquire/item/AcquireInventoryItem", "../objectives/utility/moveTo/MoveToWater", "../objectives/other/item/UseItem", "game/magic/MagicalPropertyType", "game/entity/IHuman"], function (require, exports, Cast_1, BaseMode_1, AcquireInventoryItem_1, MoveToWater_1, UseItem_1, MagicalPropertyType_1, IHuman_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AnglerMode = void 0;
    class AnglerMode extends BaseMode_1.BaseMode {
        async initialize(_, finished) {
        }
        async determineObjectives(context) {
            const objectives = [];
            objectives.push(...await this.getBuildAnotherChestObjectives(context));
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
    exports.AnglerMode = AnglerMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5nbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL0FuZ2xlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBZ0JBLE1BQWEsVUFBVyxTQUFRLG1CQUFRO1FBSWhDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9DO1FBRXhFLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDaEQsTUFBTSxVQUFVLEdBQXFDLEVBQUUsQ0FBQztZQUV4RCxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsOEJBQThCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUV2RSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUVyRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsRUFBRSxNQUFNLENBQUM7WUFDaEUsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN6QixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyx5Q0FBbUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDeEcsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxrQkFBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUV0RyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FDOUIsNkJBQWUsQ0FBQyxhQUFhLEVBQzdCO29CQUNDLFlBQVksRUFBRSxLQUFLO29CQUNuQixrQkFBa0IsRUFBRSxJQUFJO29CQUV4QixhQUFhLEVBQUUsSUFBSTtpQkFDbkIsQ0FBQyxDQUFDLENBQUM7Z0JBRUwsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLENBQUMsY0FBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7YUFDOUM7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBQ0Q7SUFsQ0QsZ0NBa0NDIn0=