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
define(["require", "exports", "../../../../core/objective/IObjective", "../../../../core/objective/Objective", "../../../acquire/item/specific/AcquireWaterContainer", "../../../core/MoveToTarget", "../../item/UseItem", "../../../analyze/AnalyzeInventory", "../../../../core/ITars", "@wayward/game/game/entity/action/actions/Pour", "../../../acquire/item/specific/AcquireWater", "../../../interrupt/RepairItem"], function (require, exports, IObjective_1, Objective_1, AcquireWaterContainer_1, MoveToTarget_1, UseItem_1, AnalyzeInventory_1, ITars_1, Pour_1, AcquireWater_1, RepairItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StartDripStone extends Objective_1.default {
        constructor(dripStone) {
            super();
            this.dripStone = dripStone;
        }
        getIdentifier() {
            return `StartDripStone:${this.dripStone}`;
        }
        getStatus() {
            return `Starting drip stone process for ${this.dripStone.getName()}`;
        }
        async execute(context) {
            if (this.dripStone.hasWater?.top) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const objectives = [];
            this.log.info("No water at the top");
            let isWaterInContainer = false;
            const availableWaterContainers = AnalyzeInventory_1.default.getItems(context, ITars_1.inventoryItemInfo["waterContainer"]);
            const availableWaterContainer = Array.from(availableWaterContainers).find(waterContainer => !context.utilities.item.isSafeToDrinkItem(context, waterContainer));
            if (availableWaterContainer) {
                isWaterInContainer = context.utilities.item.isDrinkableItem(availableWaterContainer);
                if (availableWaterContainer.durability !== undefined &&
                    availableWaterContainer.durabilityMax !== undefined &&
                    (availableWaterContainer.durability / availableWaterContainer.durabilityMaxWithMagical) < 0.6) {
                    objectives.push(new RepairItem_1.default(availableWaterContainer));
                }
            }
            else {
                objectives.push(new AcquireWaterContainer_1.default().keepInInventory());
            }
            if (!isWaterInContainer) {
                objectives.push(new AcquireWater_1.default({ onlyForDesalination: true }).keepInInventory());
            }
            objectives.push(new MoveToTarget_1.default(this.dripStone, true));
            objectives.push(new UseItem_1.default(Pour_1.default, availableWaterContainer));
            return objectives;
        }
    }
    exports.default = StartDripStone;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnREcmlwU3RvbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9kb29kYWQvd2F0ZXJTb3VyY2UvU3RhcnREcmlwU3RvbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBcUJILE1BQXFCLGNBQWUsU0FBUSxtQkFBUztRQUVqRCxZQUE2QixTQUFpQjtZQUMxQyxLQUFLLEVBQUUsQ0FBQztZQURpQixjQUFTLEdBQVQsU0FBUyxDQUFRO1FBRTlDLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sa0JBQWtCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM5QyxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sbUNBQW1DLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUN6RSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUMvQixPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO1lBQ2xDLENBQUM7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFFckMsSUFBSSxrQkFBa0IsR0FBRyxLQUFLLENBQUM7WUFFL0IsTUFBTSx3QkFBd0IsR0FBRywwQkFBZ0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLHlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUV6RyxNQUFNLHVCQUF1QixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBR2hLLElBQUksdUJBQXVCLEVBQUUsQ0FBQztnQkFDMUIsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHVCQUF1QixDQUFDLENBQUM7Z0JBRXJGLElBQUksdUJBQXVCLENBQUMsVUFBVSxLQUFLLFNBQVM7b0JBQ2hELHVCQUF1QixDQUFDLGFBQWEsS0FBSyxTQUFTO29CQUNuRCxDQUFDLHVCQUF1QixDQUFDLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO29CQUVoRyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksb0JBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7Z0JBQzdELENBQUM7WUFFTCxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLCtCQUFxQixFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztZQUNuRSxDQUFDO1lBRUQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBR3RCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZGLENBQUM7WUFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFeEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLENBQUMsY0FBSSxFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQztZQUU1RCxPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDO0tBRUo7SUF6REQsaUNBeURDIn0=