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
define(["require", "exports", "@wayward/game/game/entity/action/actions/AttachContainer", "../../../../core/objective/IObjective", "../../../../core/objective/Objective", "../../../acquire/item/specific/AcquireWaterContainer", "../../../core/MoveToTarget", "../../item/UseItem", "../../tile/PickUpAllTileItems", "../../../analyze/AnalyzeInventory", "../../EmptyWaterContainer", "../../../../core/ITars"], function (require, exports, AttachContainer_1, IObjective_1, Objective_1, AcquireWaterContainer_1, MoveToTarget_1, UseItem_1, PickUpAllTileItems_1, AnalyzeInventory_1, EmptyWaterContainer_1, ITars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StartSolarStill extends Objective_1.default {
        constructor(solarStill) {
            super();
            this.solarStill = solarStill;
        }
        getIdentifier() {
            return `StartSolarStill:${this.solarStill}`;
        }
        getStatus() {
            return `Starting solar still process for ${this.solarStill.getName()}`;
        }
        async execute(context) {
            if (this.solarStill.stillContainer) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const objectives = [];
            this.log.info("No still container");
            const availableWaterContainers = AnalyzeInventory_1.default.getItems(context, ITars_1.inventoryItemInfo["waterContainer"]);
            const availableWaterContainer = Array.from(availableWaterContainers).find(waterContainer => !context.utilities.item.isSafeToDrinkItem(context, waterContainer));
            if (availableWaterContainer === undefined) {
                objectives.push(new AcquireWaterContainer_1.default().keepInInventory());
            }
            if (availableWaterContainer && !context.utilities.item.canGatherWater(availableWaterContainer)) {
                objectives.push(new EmptyWaterContainer_1.default(availableWaterContainer));
            }
            objectives.push(new MoveToTarget_1.default(this.solarStill, true));
            objectives.push(new PickUpAllTileItems_1.default(this.solarStill.tile));
            this.log.info("Moving to attach container");
            objectives.push(new UseItem_1.default(AttachContainer_1.default, availableWaterContainer));
            return objectives;
        }
    }
    exports.default = StartSolarStill;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRTb2xhclN0aWxsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL3dhdGVyU291cmNlL1N0YXJ0U29sYXJTdGlsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFxQkgsTUFBcUIsZUFBZ0IsU0FBUSxtQkFBUztRQUVsRCxZQUE2QixVQUFrQjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURpQixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sbUJBQW1CLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoRCxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sb0NBQW9DLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMzRSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ2pDLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7WUFDbEMsQ0FBQztZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUVwQyxNQUFNLHdCQUF3QixHQUFHLDBCQUFnQixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUseUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBRXpHLE1BQU0sdUJBQXVCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFFaEssSUFBSSx1QkFBdUIsS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDeEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLCtCQUFxQixFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztZQUNuRSxDQUFDO1lBRUQsSUFBSSx1QkFBdUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLENBQUM7Z0JBRzdGLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw2QkFBbUIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDdEUsQ0FBQztZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUV6RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksNEJBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRTlELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7WUFHNUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLENBQUMseUJBQWUsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFFdkUsT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQztLQUVKO0lBakRELGtDQWlEQyJ9