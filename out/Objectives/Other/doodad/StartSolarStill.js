define(["require", "exports", "game/entity/action/IAction", "../../../core/objective/Objective", "../../acquire/item/specific/AcquireWaterContainer", "../../core/MoveToTarget", "../item/UseItem", "../tile/PickUpAllTileItems", "../../analyze/AnalyzeInventory", "../EmptyWaterContainer", "../../../core/ITars"], function (require, exports, IAction_1, Objective_1, AcquireWaterContainer_1, MoveToTarget_1, UseItem_1, PickUpAllTileItems_1, AnalyzeInventory_1, EmptyWaterContainer_1, ITars_1) {
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
            const objectives = [];
            if (!this.solarStill.stillContainer) {
                this.log.info("No still container");
                const availableWaterContainers = AnalyzeInventory_1.default.getItems(context, ITars_1.inventoryItemInfo["waterContainer"]);
                const availableWaterContainer = Array.from(availableWaterContainers).find(waterContainer => !context.utilities.item.isSafeToDrinkItem(waterContainer));
                if (availableWaterContainer === undefined) {
                    objectives.push(new AcquireWaterContainer_1.default().keepInInventory());
                }
                if (availableWaterContainer && !context.utilities.item.canGatherWater(availableWaterContainer)) {
                    objectives.push(new EmptyWaterContainer_1.default(availableWaterContainer));
                }
                objectives.push(new MoveToTarget_1.default(this.solarStill, true));
                objectives.push(new PickUpAllTileItems_1.default(this.solarStill));
                this.log.info("Moving to attach container");
                objectives.push(new UseItem_1.default(IAction_1.ActionType.AttachContainer, availableWaterContainer));
            }
            return objectives;
        }
    }
    exports.default = StartSolarStill;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRTb2xhclN0aWxsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0YXJ0U29sYXJTdGlsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFtQkEsTUFBcUIsZUFBZ0IsU0FBUSxtQkFBUztRQUVsRCxZQUE2QixVQUFrQjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURpQixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sbUJBQW1CLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoRCxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sb0NBQW9DLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMzRSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRTtnQkFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFFcEMsTUFBTSx3QkFBd0IsR0FBRywwQkFBZ0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLHlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQkFFekcsTUFBTSx1QkFBdUIsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUV2SixJQUFJLHVCQUF1QixLQUFLLFNBQVMsRUFBRTtvQkFDdkMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLCtCQUFxQixFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztpQkFDbEU7Z0JBRUQsSUFBSSx1QkFBdUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFO29CQUc1RixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksNkJBQW1CLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO2lCQUNyRTtnQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRXpELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw0QkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFFekQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztnQkFHNUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLENBQUMsb0JBQVUsQ0FBQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO2FBQ3JGO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQztLQUVKO0lBL0NELGtDQStDQyJ9