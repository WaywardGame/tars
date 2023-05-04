define(["require", "exports", "@wayward/goodstream/Stream", "language/ITranslation", "language/Translation", "utilities/math/Vector2", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/MoveToTarget", "../other/item/BuildItem", "../other/item/MoveItem", "../acquire/item/AcquireInventoryItem"], function (require, exports, Stream_1, ITranslation_1, Translation_1, Vector2_1, IObjective_1, Objective_1, MoveToTarget_1, BuildItem_1, MoveItem_1, AcquireInventoryItem_1) {
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
            const itemsToMove = this.itemsToMove ?? [this.getAcquiredItem(context)];
            const firstItem = itemsToMove[0];
            if (!firstItem?.isValid()) {
                this.log.warn("Invalid item to move");
                return IObjective_1.ObjectiveResult.Restart;
            }
            const objectivePipelines = [];
            const chests = context.base.chest
                .slice()
                .sort((a, b) => context.island.items.computeContainerWeight(a) - context.island.items.computeContainerWeight(b));
            for (const chest of chests) {
                if (this.maxChestDistance !== undefined && Vector2_1.default.distance(context.human, chest) > this.maxChestDistance) {
                    continue;
                }
                const targetContainer = chest;
                if (context.island.items.hasRoomInContainer(targetContainer, firstItem)) {
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
                objectivePipelines.push([new AcquireInventoryItem_1.default("chest"), new BuildItem_1.default()]);
            }
            return objectivePipelines;
        }
    }
    exports.default = MoveIntoChest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUludG9DaGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvTW92ZUludG9DaGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFnQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLFdBQW9CLEVBQW1CLGdCQUF5QjtZQUM1RixLQUFLLEVBQUUsQ0FBQztZQURvQixnQkFBVyxHQUFYLFdBQVcsQ0FBUztZQUFtQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQVM7UUFFN0YsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RGLENBQUM7UUFFTSxTQUFTO1lBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3RCLE9BQU8sMEJBQTBCLENBQUM7YUFDbEM7WUFFRCxNQUFNLFdBQVcsR0FBRyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2lCQUM3RSxPQUFPLENBQUMscUJBQVcsQ0FBQyxVQUFVLEVBQUUsd0JBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVqRCxPQUFPLFVBQVUsV0FBVyxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUM7UUFDeEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN4RSxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDdEMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUs7aUJBQy9CLEtBQUssRUFBRTtpQkFDUCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFlLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFlLENBQUMsQ0FBQyxDQUFDO1lBQzlJLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO2dCQUMzQixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLElBQUksaUJBQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7b0JBQzFHLFNBQVM7aUJBQ1Q7Z0JBRUQsTUFBTSxlQUFlLEdBQUcsS0FBbUIsQ0FBQztnQkFDNUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLEVBQUU7b0JBRXhFLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7b0JBRXBDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUUvQyxLQUFLLE1BQU0sSUFBSSxJQUFJLFdBQVcsRUFBRTt3QkFDL0IsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGtCQUFRLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO3FCQUM1RDtvQkFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ3BDO2FBQ0Q7WUFFRCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBRXJDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksOEJBQW9CLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxtQkFBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzlFO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUE5REQsZ0NBOERDIn0=