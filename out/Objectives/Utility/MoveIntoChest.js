define(["require", "exports", "@wayward/goodstream/Stream", "game/doodad/IDoodad", "language/ITranslation", "language/Translation", "utilities/math/Vector2", "../../core/objective/IObjective", "../../core/objective/Objective", "../acquire/item/AcquireItemForDoodad", "../analyze/AnalyzeBase", "../core/MoveToTarget", "../other/item/BuildItem", "../other/item/MoveItem"], function (require, exports, Stream_1, IDoodad_1, ITranslation_1, Translation_1, Vector2_1, IObjective_1, Objective_1, AcquireItemForDoodad_1, AnalyzeBase_1, MoveToTarget_1, BuildItem_1, MoveItem_1) {
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
            const translation = Stream_1.default.values(this.itemsToMove.map(item => item.getName()))
                .collect(Translation_1.default.formatList, ITranslation_1.ListEnder.And);
            return `Moving ${translation.getString()} into chests`;
        }
        async execute(context) {
            var _a;
            const itemsToMove = (_a = this.itemsToMove) !== null && _a !== void 0 ? _a : [this.getAcquiredItem(context)];
            const firstItem = itemsToMove[0];
            if (!(firstItem === null || firstItem === void 0 ? void 0 : firstItem.isValid())) {
                this.log.warn("Invalid item to move");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const objectivePipelines = [];
            const chests = context.base.chest
                .slice()
                .sort((a, b) => context.island.items.computeContainerWeight(a) - context.island.items.computeContainerWeight(b));
            for (const chest of chests) {
                if (this.maxChestDistance !== undefined && Vector2_1.default.distance(context.player, chest) > this.maxChestDistance) {
                    continue;
                }
                const targetContainer = chest;
                const weight = context.island.items.computeContainerWeight(targetContainer);
                if (weight + firstItem.getTotalWeight() <= context.island.items.getWeightCapacity(targetContainer)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUludG9DaGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvTW92ZUludG9DaGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFrQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLFdBQW9CLEVBQW1CLGdCQUF5QjtZQUM1RixLQUFLLEVBQUUsQ0FBQztZQURvQixnQkFBVyxHQUFYLFdBQVcsQ0FBUztZQUFtQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQVM7UUFFN0YsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RGLENBQUM7UUFFTSxTQUFTO1lBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3RCLE9BQU8sMEJBQTBCLENBQUM7YUFDbEM7WUFFRCxNQUFNLFdBQVcsR0FBRyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2lCQUM3RSxPQUFPLENBQUMscUJBQVcsQ0FBQyxVQUFVLEVBQUUsd0JBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVqRCxPQUFPLFVBQVUsV0FBVyxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUM7UUFDeEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ3BDLE1BQU0sV0FBVyxHQUFHLE1BQUEsSUFBSSxDQUFDLFdBQVcsbUNBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDeEUsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxDQUFBLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxPQUFPLEVBQUUsQ0FBQSxFQUFFO2dCQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUN0QyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSztpQkFDL0IsS0FBSyxFQUFFO2lCQUNQLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQWUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQWUsQ0FBQyxDQUFDLENBQUM7WUFDOUksS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7Z0JBQzNCLElBQUksSUFBSSxDQUFDLGdCQUFnQixLQUFLLFNBQVMsSUFBSSxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDM0csU0FBUztpQkFDVDtnQkFFRCxNQUFNLGVBQWUsR0FBRyxLQUFtQixDQUFDO2dCQUM1QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDNUUsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBRSxFQUFFO29CQUVwRyxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO29CQUVwQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFFL0MsS0FBSyxNQUFNLElBQUksSUFBSSxXQUFXLEVBQUU7d0JBQy9CLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxrQkFBUSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztxQkFDNUQ7b0JBRUQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNwQzthQUNEO1lBRUQsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUVyQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxtQkFBUyxFQUFFLEVBQUUsSUFBSSxxQkFBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ2hIO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUEvREQsZ0NBK0RDIn0=