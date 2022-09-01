define(["require", "exports", "game/entity/action/actions/AttachContainer", "../../../core/objective/Objective", "../../acquire/item/specific/AcquireWaterContainer", "../../core/MoveToTarget", "../item/UseItem", "../tile/PickUpAllTileItems", "../../analyze/AnalyzeInventory", "../EmptyWaterContainer", "../../../core/ITars"], function (require, exports, AttachContainer_1, Objective_1, AcquireWaterContainer_1, MoveToTarget_1, UseItem_1, PickUpAllTileItems_1, AnalyzeInventory_1, EmptyWaterContainer_1, ITars_1) {
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
                const availableWaterContainer = Array.from(availableWaterContainers).find(waterContainer => !context.utilities.item.isSafeToDrinkItem(context, waterContainer));
                if (availableWaterContainer === undefined) {
                    objectives.push(new AcquireWaterContainer_1.default().keepInInventory());
                }
                if (availableWaterContainer && !context.utilities.item.canGatherWater(availableWaterContainer)) {
                    objectives.push(new EmptyWaterContainer_1.default(availableWaterContainer));
                }
                objectives.push(new MoveToTarget_1.default(this.solarStill, true));
                objectives.push(new PickUpAllTileItems_1.default(this.solarStill));
                this.log.info("Moving to attach container");
                objectives.push(new UseItem_1.default(AttachContainer_1.default, availableWaterContainer));
            }
            return objectives;
        }
    }
    exports.default = StartSolarStill;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRTb2xhclN0aWxsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvZG9vZGFkL1N0YXJ0U29sYXJTdGlsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFtQkEsTUFBcUIsZUFBZ0IsU0FBUSxtQkFBUztRQUVsRCxZQUE2QixVQUFrQjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURpQixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sbUJBQW1CLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoRCxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sb0NBQW9DLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUMzRSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRTtnQkFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFFcEMsTUFBTSx3QkFBd0IsR0FBRywwQkFBZ0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLHlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQkFFekcsTUFBTSx1QkFBdUIsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFFaEssSUFBSSx1QkFBdUIsS0FBSyxTQUFTLEVBQUU7b0JBQ3ZDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSwrQkFBcUIsRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7aUJBQ2xFO2dCQUVELElBQUksdUJBQXVCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsRUFBRTtvQkFHNUYsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDZCQUFtQixDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztpQkFDckU7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUV6RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksNEJBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBRXpELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7Z0JBRzVDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLHlCQUFlLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO2FBQzFFO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQztLQUVKO0lBL0NELGtDQStDQyJ9