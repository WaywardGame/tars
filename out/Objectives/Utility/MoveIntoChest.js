define(["require", "exports", "game/doodad/IDoodad", "utilities/math/Vector2", "language/Translation", "../../IContext", "../../IObjective", "../../Objective", "../acquire/item/AcquireItemForDoodad", "../analyze/AnalyzeBase", "../core/MoveToTarget", "../other/item/BuildItem", "../other/item/MoveItem"], function (require, exports, IDoodad_1, Vector2_1, Translation_1, IContext_1, IObjective_1, Objective_1, AcquireItemForDoodad_1, AnalyzeBase_1, MoveToTarget_1, BuildItem_1, MoveItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveIntoChest extends Objective_1.default {
        constructor(itemsToMove, maxChestDistance) {
            super();
            this.itemsToMove = itemsToMove;
            this.maxChestDistance = maxChestDistance;
        }
        getIdentifier() {
            return `MoveIntoChest:${this.itemsToMove ? this.itemsToMove.join(", ") : undefined}`;
        }
        getStatus() {
            if (!this.itemsToMove) {
                return "Moving items into chests";
            }
            const translation = Stream.values(this.itemsToMove.map(item => item.getName()))
                .collect(Translation_1.default.formatList, Translation_1.ListEnder.And);
            return `Moving ${translation.getString()} into chests`;
        }
        async execute(context) {
            const itemsToMove = this.itemsToMove || [context.getData(IContext_1.ContextDataType.LastAcquiredItem)];
            const firstItem = itemsToMove[0];
            if (!firstItem) {
                this.log.error("Invalid item to move");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const objectivePipelines = [];
            const chests = context.base.chest
                .slice()
                .sort((a, b) => itemManager.computeContainerWeight(a) - itemManager.computeContainerWeight(b));
            for (const chest of chests) {
                if (this.maxChestDistance !== undefined && Vector2_1.default.distance(context.player, chest) > this.maxChestDistance) {
                    continue;
                }
                const targetContainer = chest;
                const weight = itemManager.computeContainerWeight(targetContainer);
                if (weight + firstItem.getTotalWeight() <= itemManager.getWeightCapacity(targetContainer)) {
                    const objectives = [];
                    objectives.push(new MoveToTarget_1.default(chest, true));
                    for (const item of itemsToMove) {
                        objectives.push(new MoveItem_1.default(item, targetContainer, chest));
                    }
                    objectivePipelines.push(objectives);
                }
            }
            if (objectivePipelines.length === 0) {
                this.log.info("Build another chest");
                objectivePipelines.push([new AcquireItemForDoodad_1.default(IDoodad_1.DoodadType.WoodenChest), new BuildItem_1.default(), new AnalyzeBase_1.default()]);
            }
            return objectivePipelines;
        }
    }
    exports.default = MoveIntoChest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUludG9DaGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvTW92ZUludG9DaGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFnQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLFdBQW9CLEVBQW1CLGdCQUF5QjtZQUM1RixLQUFLLEVBQUUsQ0FBQztZQURvQixnQkFBVyxHQUFYLFdBQVcsQ0FBUztZQUFtQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQVM7UUFFN0YsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RGLENBQUM7UUFFTSxTQUFTO1lBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3RCLE9BQU8sMEJBQTBCLENBQUM7YUFDbEM7WUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7aUJBQzdFLE9BQU8sQ0FBQyxxQkFBVyxDQUFDLFVBQVUsRUFBRSx1QkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWpELE9BQU8sVUFBVSxXQUFXLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQztRQUN4RCxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUM1RixNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDZixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUN2QyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSztpQkFDL0IsS0FBSyxFQUFFO2lCQUNQLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFlLENBQUMsR0FBRyxXQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBZSxDQUFDLENBQUMsQ0FBQztZQUM1SCxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtnQkFDM0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEtBQUssU0FBUyxJQUFJLGlCQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFO29CQUMzRyxTQUFTO2lCQUNUO2dCQUVELE1BQU0sZUFBZSxHQUFHLEtBQW1CLENBQUM7Z0JBQzVDLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDbkUsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUUsRUFBRTtvQkFFM0YsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztvQkFFcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBRS9DLEtBQUssTUFBTSxJQUFJLElBQUksV0FBVyxFQUFFO3dCQUMvQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksa0JBQVEsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7cUJBQzVEO29CQUVELGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDcEM7YUFDRDtZQUVELElBQUksa0JBQWtCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFFckMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksbUJBQVMsRUFBRSxFQUFFLElBQUkscUJBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNoSDtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztLQUNEO0lBL0RELGdDQStEQyJ9