var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "Enums", "../IObjective", "../Objective", "../Utilities/Item", "./ExecuteAction", "./OrganizeInventory"], function (require, exports, IAction_1, Enums_1, IObjective_1, Objective_1, Item_1, ExecuteAction_1, OrganizeInventory_1) {
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
                        const targetContainer = chest;
                        const containerWeight = itemManager.computeContainerWeight(targetContainer);
                        let unusedExtraItems = Item_1.getUnusedItems(inventory);
                        unusedExtraItems = unusedExtraItems
                            .filter(item => (containerWeight + item.weight) <= targetContainer.weightCapacity)
                            .filter(item => unusedExtraItems.filter(i => i.type === item.type).length >= 3);
                        if (unusedExtraItems.length > 0) {
                            const item = unusedExtraItems[0];
                            this.log.info(`Moving extra item ${item.getName().getString()} into chest`);
                            return new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, action => action.execute(localPlayer, item, undefined, targetContainer), false);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkdWNlV2VpZ2h0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvUmVkdWNlV2VpZ2h0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBVUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBRTNDLFdBQVc7WUFDakIsT0FBTyxjQUFjLENBQUM7UUFDdkIsQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCOztnQkFDN0QsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUNuRCxJQUFJLFlBQVksS0FBSyxvQkFBWSxDQUFDLElBQUksRUFBRTtvQkFDdkMsTUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDLE1BQU0sQ0FBQztvQkFDekQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7b0JBQ2pHLElBQUksS0FBSyxFQUFFO3dCQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7d0JBRXhDLE1BQU0sZUFBZSxHQUFHLEtBQW1CLENBQUM7d0JBQzVDLE1BQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxlQUFlLENBQUMsQ0FBQzt3QkFHNUUsSUFBSSxnQkFBZ0IsR0FBRyxxQkFBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUVqRCxnQkFBZ0IsR0FBRyxnQkFBZ0I7NkJBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxlQUFlLENBQUMsY0FBZSxDQUFDOzZCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBRWpGLElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTs0QkFDaEMsTUFBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBRWpDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDOzRCQUU1RSxPQUFPLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsZUFBZSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7eUJBQzlIO3FCQUNEO29CQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE9BQU8sSUFBSSwyQkFBaUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxLQUFLLG9CQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEYsQ0FBQztTQUFBO0tBRUQ7SUEzQ0QsK0JBMkNDIn0=