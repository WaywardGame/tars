define(["require", "exports", "../../../../core/objective/Objective", "../../../contextData/SetContextData", "../../../core/ReserveItems", "../../../other/item/PlantSeed", "../AcquireItem"], function (require, exports, Objective_1, SetContextData_1, ReserveItems_1, PlantSeed_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireAndPlantSeed extends Objective_1.default {
        constructor(onlyEdiblePlants) {
            super();
            this.onlyEdiblePlants = onlyEdiblePlants;
        }
        getIdentifier() {
            return `AcquireAndPlantSeed:${this.onlyEdiblePlants}`;
        }
        getStatus() {
            return "Acquiring and planting a seed";
        }
        async execute(context) {
            return Array.from(this.onlyEdiblePlants ? context.utilities.item.edibleSeedItemTypes : context.utilities.item.allSeedItemTypes)
                .map(itemType => {
                const objectives = [];
                const hashCode = this.getHashCode(context, true);
                const item = context.utilities.item.getItemInInventory(context, itemType);
                if (item === undefined) {
                    objectives.push(new AcquireItem_1.default(itemType, { requiredMinDur: 1, willDestroyItem: true }).setContextDataKey(hashCode));
                }
                else {
                    objectives.push(new ReserveItems_1.default(item));
                    objectives.push(new SetContextData_1.default(hashCode, item));
                }
                objectives.push(new PlantSeed_1.default(itemType).setContextDataKey(hashCode));
                return objectives;
            });
        }
    }
    exports.default = AcquireAndPlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUFuZFBsYW50U2VlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2FjcXVpcmUvaXRlbS9zcGVjaWZpYy9BY3F1aXJlQW5kUGxhbnRTZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVNBLE1BQXFCLG1CQUFvQixTQUFRLG1CQUFTO1FBRXRELFlBQTZCLGdCQUF5QjtZQUNsRCxLQUFLLEVBQUUsQ0FBQztZQURpQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQVM7UUFFdEQsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyx1QkFBdUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDMUQsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLCtCQUErQixDQUFDO1FBQzNDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztpQkFDMUgsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNaLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7Z0JBRXBDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUdqRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzFFLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtvQkFDcEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsUUFBUSxFQUFFLEVBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUV4SDtxQkFBTTtvQkFDSCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQWMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDdkQ7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFFckUsT0FBTyxVQUFVLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO0tBRUo7SUFyQ0Qsc0NBcUNDIn0=