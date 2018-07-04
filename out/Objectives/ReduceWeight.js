var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../IObjective", "../Objective", "./ExecuteAction", "./OrganizeInventory", "../Utilities/Item"], function (require, exports, Enums_1, IObjective_1, Objective_1, ExecuteAction_1, OrganizeInventory_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReduceWeight extends Objective_1.default {
        getHashCode() {
            return "ReduceWeight";
        }
        shouldSaveChildObjectives() {
            return false;
        }
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                const weightStatus = localPlayer.getWeightStatus();
                if (weightStatus === Enums_1.WeightStatus.None) {
                    const doodadInFront = localPlayer.getFacingTile().doodad;
                    const chest = base.chests !== undefined ? base.chests.find(c => c === doodadInFront) : undefined;
                    if (chest) {
                        this.log.info("Still infront of chest");
                        const container = chest;
                        const containerWeight = itemManager.computeContainerWeight(container);
                        let unusedExtraItems = Item_1.getUnusedItems(inventory);
                        unusedExtraItems = unusedExtraItems
                            .filter(item => (containerWeight + item.weight) <= container.weightCapacity)
                            .filter(item => unusedExtraItems.filter(i => i.type === item.type).length >= 3);
                        if (unusedExtraItems.length > 0) {
                            const item = unusedExtraItems[0];
                            this.log.info(`Moving extra item ${game.getName(item)} into chest`);
                            return new ExecuteAction_1.default(Enums_1.ActionType.MoveItem, {
                                item: item,
                                targetContainer: container
                            }, false);
                        }
                    }
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                return new OrganizeInventory_1.default(true, weightStatus !== Enums_1.WeightStatus.Overburdened);
            });
        }
    }
    exports.default = ReduceWeight;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkdWNlV2VpZ2h0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvUmVkdWNlV2VpZ2h0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBU0Esa0JBQWtDLFNBQVEsbUJBQVM7UUFFM0MsV0FBVztZQUNqQixPQUFPLGNBQWMsQ0FBQztRQUN2QixDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7O2dCQUM3RCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ25ELElBQUksWUFBWSxLQUFLLG9CQUFZLENBQUMsSUFBSSxFQUFFO29CQUN2QyxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUMsTUFBTSxDQUFDO29CQUN6RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztvQkFDakcsSUFBSSxLQUFLLEVBQUU7d0JBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQzt3QkFFeEMsTUFBTSxTQUFTLEdBQUcsS0FBbUIsQ0FBQzt3QkFDdEMsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUd0RSxJQUFJLGdCQUFnQixHQUFHLHFCQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBRWpELGdCQUFnQixHQUFHLGdCQUFnQjs2QkFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxjQUFlLENBQUM7NkJBQzVFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFFakYsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFOzRCQUNoQyxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFFakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDOzRCQUVwRSxPQUFPLElBQUksdUJBQWEsQ0FBQyxrQkFBVSxDQUFDLFFBQVEsRUFBRTtnQ0FDN0MsSUFBSSxFQUFFLElBQUk7Z0NBQ1YsZUFBZSxFQUFFLFNBQVM7NkJBQzFCLEVBQUUsS0FBSyxDQUFDLENBQUM7eUJBQ1Y7cUJBQ0Q7b0JBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsT0FBTyxJQUFJLDJCQUFpQixDQUFDLElBQUksRUFBRSxZQUFZLEtBQUssb0JBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNoRixDQUFDO1NBQUE7S0FFRDtJQTlDRCwrQkE4Q0MifQ==