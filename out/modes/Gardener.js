define(["require", "exports", "../objectives/other/item/BuildItem", "../objectives/core/Restart", "../objectives/acquire/item/specific/AcquireAndPlantSeed", "../objectives/acquire/item/AcquireInventoryItem"], function (require, exports, BuildItem_1, Restart_1, AcquireAndPlantSeed_1, AcquireInventoryItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GardenerMode = void 0;
    class GardenerMode {
        async initialize(_, finished) {
        }
        async determineObjectives(context) {
            const objectives = [];
            if (!context.base.buildAnotherChest) {
                context.base.buildAnotherChest = true;
                if (context.base.chest.length > 0) {
                    for (const c of context.base.chest) {
                        if ((context.human.island.items.computeContainerWeight(c) / context.human.island.items.getWeightCapacity(c)) < 0.9) {
                            context.base.buildAnotherChest = false;
                            break;
                        }
                    }
                }
            }
            if (context.base.buildAnotherChest && context.inventory.chest === undefined) {
                context.base.buildAnotherChest = true;
                objectives.push(new AcquireInventoryItem_1.default("shovel"));
                objectives.push(new AcquireInventoryItem_1.default("knife"));
                objectives.push(new AcquireInventoryItem_1.default("axe"));
                objectives.push([new AcquireInventoryItem_1.default("chest"), new BuildItem_1.default()]);
            }
            objectives.push([new AcquireAndPlantSeed_1.default(context.options.gardenerOnlyEdiblePlants), new Restart_1.default()]);
            return objectives;
        }
    }
    exports.GardenerMode = GardenerMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FyZGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvR2FyZGVuZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVVBLE1BQWEsWUFBWTtRQUlqQixLQUFLLENBQUMsVUFBVSxDQUFDLENBQVUsRUFBRSxRQUFvQztRQUV4RSxDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWdCO1lBQ2hELE1BQU0sVUFBVSxHQUFxQyxFQUFFLENBQUM7WUFFeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO2dCQUV0QyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ2xDLEtBQUssTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBZSxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBRSxDQUFDLEdBQUcsR0FBRyxFQUFFOzRCQUNsSSxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQzs0QkFDdkMsTUFBTTt5QkFDTjtxQkFDRDtpQkFDRDthQUNEO1lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtnQkFNNUUsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7Z0JBRXRDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNwRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDbkQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2pELFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDhCQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksbUJBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN0RTtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDZCQUFtQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsRUFBRSxJQUFJLGlCQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFjcEcsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUNEO0lBdERELG9DQXNEQyJ9