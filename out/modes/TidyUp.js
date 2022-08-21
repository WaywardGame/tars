define(["require", "exports", "game/entity/action/IAction", "game/entity/IEntity", "../core/objective/IObjective", "../objectives/acquire/item/AcquireItemForAction", "../objectives/other/item/BuildItem", "../objectives/other/ReturnToBase", "../objectives/utility/OrganizeBase", "../objectives/utility/OrganizeInventory", "../objectives/core/Lambda", "../objectives/acquire/item/AcquireInventoryItem"], function (require, exports, IAction_1, IEntity_1, IObjective_1, AcquireItemForAction_1, BuildItem_1, ReturnToBase_1, OrganizeBase_1, OrganizeInventory_1, Lambda_1, AcquireInventoryItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TidyUpMode = void 0;
    class TidyUpMode {
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
                const chopItem = context.utilities.item.getBestTool(context, IAction_1.ActionType.Chop, IEntity_1.DamageType.Slashing);
                if (chopItem === undefined) {
                    objectives.push([new AcquireItemForAction_1.default(IAction_1.ActionType.Chop)]);
                }
                objectives.push(new AcquireInventoryItem_1.default("shovel"));
                objectives.push(new AcquireInventoryItem_1.default("knife"));
                objectives.push(new AcquireInventoryItem_1.default("axe"));
                objectives.push([new AcquireInventoryItem_1.default("chest"), new BuildItem_1.default()]);
            }
            const tiles = context.utilities.base.getTilesWithItemsNearBase(context);
            if (tiles.totalCount > 0) {
                objectives.push(new OrganizeBase_1.default(tiles.tiles));
            }
            objectives.push(new ReturnToBase_1.default());
            objectives.push(new OrganizeInventory_1.default());
            objectives.push(new Lambda_1.default(async () => IObjective_1.ObjectiveResult.Complete).setStatus("Waiting"));
            return objectives;
        }
    }
    exports.TidyUpMode = TidyUpMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlkeVVwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVzL1RpZHlVcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBa0JBLE1BQWEsVUFBVTtRQUlmLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9DO1FBRXhFLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDaEQsTUFBTSxVQUFVLEdBQXFDLEVBQUUsQ0FBQztZQUV4RCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7Z0JBRXRDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDbEMsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFlLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFFLENBQUMsR0FBRyxHQUFHLEVBQUU7NEJBQ2xJLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDOzRCQUN2QyxNQUFNO3lCQUNOO3FCQUNEO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO2dCQU01RSxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztnQkFFdEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLElBQUksRUFBRSxvQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNuRyxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7b0JBQzNCLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUM3RDtnQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDcEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ25ELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLG1CQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDdEU7WUFFRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4RSxJQUFJLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFO2dCQUN6QixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUMvQztZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxFQUFFLENBQUMsQ0FBQztZQUVwQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksMkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBRXpDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsNEJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQWF2RixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBQ0Q7SUFuRUQsZ0NBbUVDIn0=