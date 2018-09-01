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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkdWNlV2VpZ2h0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvUmVkdWNlV2VpZ2h0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBU0EsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBRTNDLFdBQVc7WUFDakIsT0FBTyxjQUFjLENBQUM7UUFDdkIsQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCOztnQkFDN0QsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUNuRCxJQUFJLFlBQVksS0FBSyxvQkFBWSxDQUFDLElBQUksRUFBRTtvQkFDdkMsTUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDLE1BQU0sQ0FBQztvQkFDekQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7b0JBQ2pHLElBQUksS0FBSyxFQUFFO3dCQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7d0JBRXhDLE1BQU0sU0FBUyxHQUFHLEtBQW1CLENBQUM7d0JBQ3RDLE1BQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFHdEUsSUFBSSxnQkFBZ0IsR0FBRyxxQkFBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUVqRCxnQkFBZ0IsR0FBRyxnQkFBZ0I7NkJBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUMsY0FBZSxDQUFDOzZCQUM1RSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBRWpGLElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTs0QkFDaEMsTUFBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBRWpDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzs0QkFFcEUsT0FBTyxJQUFJLHVCQUFhLENBQUMsa0JBQVUsQ0FBQyxRQUFRLEVBQUU7Z0NBQzdDLElBQUksRUFBRSxJQUFJO2dDQUNWLGVBQWUsRUFBRSxTQUFTOzZCQUMxQixFQUFFLEtBQUssQ0FBQyxDQUFDO3lCQUNWO3FCQUNEO29CQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE9BQU8sSUFBSSwyQkFBaUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxLQUFLLG9CQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEYsQ0FBQztTQUFBO0tBRUQ7SUE5Q0QsK0JBOENDIn0=