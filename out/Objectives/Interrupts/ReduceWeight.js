define(["require", "exports", "Enums", "../Helpers", "../IObjective", "../Objective", "./ExecuteAction", "./OrganizeInventory"], function (require, exports, Enums_1, Helpers, IObjective_1, Objective_1, ExecuteAction_1, OrganizeInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReduceWeight extends Objective_1.default {
        onExecute(base, inventory) {
            let unusedExtraItems;
            if (localPlayer.getWeightStatus() === Enums_1.WeightStatus.None) {
                const doodadInFront = game.getTileInFrontOfPlayer(localPlayer).doodad;
                const chest = base.chests !== undefined ? base.chests.find((c) => c === doodadInFront) : undefined;
                if (chest) {
                    const container = chest;
                    const containerWeight = itemManager.computeContainerWeight(container);
                    unusedExtraItems = Helpers.getUnusedItems(inventory);
                    unusedExtraItems = unusedExtraItems
                        .filter((item) => (containerWeight + item.weight) <= container.weightCapacity)
                        .filter((item) => unusedExtraItems.filter((i) => i.type === item.type).length >= 4);
                    if (unusedExtraItems.length > 0) {
                        const item = unusedExtraItems[0];
                        this.log(`Moving extra item '${game.getName(item)}' into chest`);
                        return new ExecuteAction_1.default(Enums_1.ActionType.MoveItem, {
                            item: item,
                            targetContainer: container
                        });
                    }
                }
                return IObjective_1.ObjectiveStatus.Complete;
            }
            return new OrganizeInventory_1.default(false);
        }
    }
    exports.default = ReduceWeight;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVkdWNlV2VpZ2h0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvSW50ZXJydXB0cy9SZWR1Y2VXZWlnaHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0Esa0JBQWtDLFNBQVEsbUJBQVM7UUFFM0MsU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQjtZQUN2RCxJQUFJLGdCQUF5QixDQUFDO1lBRTlCLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsS0FBSyxvQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3pELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0JBQ3RFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBQ25HLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ1gsTUFBTSxTQUFTLEdBQUcsS0FBbUIsQ0FBQztvQkFDdEMsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUd0RSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNyRCxnQkFBZ0IsR0FBRyxnQkFBZ0I7eUJBQ2pDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyxjQUFlLENBQUM7eUJBQzlFLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBRXJGLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7d0JBRWpFLE1BQU0sQ0FBQyxJQUFJLHVCQUFhLENBQUMsa0JBQVUsQ0FBQyxRQUFRLEVBQUU7NEJBQzdDLElBQUksRUFBRSxJQUFJOzRCQUNWLGVBQWUsRUFBRSxTQUFTO3lCQUMxQixDQUFDLENBQUM7b0JBQ0osQ0FBQztnQkFDRixDQUFDO2dCQUVELE1BQU0sQ0FBQyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBRUQsTUFBTSxDQUFDLElBQUksMkJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQztLQUVEO0lBcENELCtCQW9DQyJ9