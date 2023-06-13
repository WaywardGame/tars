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
            const itemContextDataKey = this.getUniqueContextDataKey("Seed");
            return Array.from(this.onlyEdiblePlants ? context.utilities.item.edibleSeedItemTypes : context.utilities.item.allSeedItemTypes)
                .map(itemType => {
                const objectives = [];
                const item = context.utilities.item.getItemInInventory(context, itemType);
                if (item) {
                    objectives.push(new ReserveItems_1.default(item).keepInInventory());
                    objectives.push(new SetContextData_1.default(itemContextDataKey, item));
                }
                else {
                    objectives.push(new AcquireItem_1.default(itemType, { requiredMinDur: 1, willDestroyItem: true }).setContextDataKey(itemContextDataKey));
                }
                objectives.push(new PlantSeed_1.default(itemType).setContextDataKey(itemContextDataKey));
                return objectives;
            });
        }
    }
    exports.default = AcquireAndPlantSeed;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUFuZFBsYW50U2VlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2FjcXVpcmUvaXRlbS9zcGVjaWZpYy9BY3F1aXJlQW5kUGxhbnRTZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQVVILE1BQXFCLG1CQUFvQixTQUFRLG1CQUFTO1FBRXRELFlBQTZCLGdCQUF5QjtZQUNsRCxLQUFLLEVBQUUsQ0FBQztZQURpQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQVM7UUFFdEQsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyx1QkFBdUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDMUQsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLCtCQUErQixDQUFDO1FBQzNDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWhFLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztpQkFDMUgsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNaLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7Z0JBR3BDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDMUUsSUFBSSxJQUFJLEVBQUU7b0JBQ04sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztvQkFDMUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFFakU7cUJBQU07b0JBQ0gsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsUUFBUSxFQUFFLEVBQUUsY0FBYyxFQUFFLENBQUMsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7aUJBQ2xJO2dCQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztnQkFFL0UsT0FBTyxVQUFVLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO0tBRUo7SUFyQ0Qsc0NBcUNDIn0=