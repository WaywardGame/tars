define(["require", "exports", "game/item/IItem", "language/Dictionary", "language/Translation", "../../core/objective/Objective", "../core/ExecuteActionForItem", "../core/MoveToTarget"], function (require, exports, IItem_1, Dictionary_1, Translation_1, Objective_1, ExecuteActionForItem_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromDoodad extends Objective_1.default {
        constructor(itemType, doodadSearchMap) {
            super();
            this.itemType = itemType;
            this.doodadSearchMap = doodadSearchMap;
        }
        getIdentifier() {
            return `GatherFromDoodad:${IItem_1.ItemType[this.itemType]}`;
        }
        getStatus() {
            return `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} from a doodad`;
        }
        canGroupTogether() {
            return true;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            return context.utilities.object.findDoodads(context, this.getIdentifier(), (doodad) => {
                const searchMap = this.doodadSearchMap.get(doodad.type);
                if (!searchMap) {
                    return false;
                }
                const description = doodad.description;
                if (!description) {
                    return false;
                }
                const growingStage = doodad.growth;
                if (growingStage === undefined || (description.gather?.[growingStage] === undefined && description.harvest?.[growingStage] === undefined)) {
                    return false;
                }
                const difficulty = searchMap.get(growingStage);
                if (difficulty === undefined) {
                    return false;
                }
                return context.utilities.tile.canGather(context, doodad.tile, true);
            }, 5)
                .map(target => ([
                new MoveToTarget_1.default(target, true),
                new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Doodad, [this.itemType])
                    .passAcquireData(this)
                    .setStatus(() => `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} from ${target.getName()}`),
            ]));
        }
        getBaseDifficulty(context) {
            return 20;
        }
    }
    exports.default = GatherFromDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbURvb2RhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBRXRELFlBQTZCLFFBQWtCLEVBQW1CLGVBQWdDO1lBQ2pHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBRWxHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sb0JBQW9CLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDdEQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQztRQUNwRyxDQUFDO1FBRWUsZ0JBQWdCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVlLFNBQVM7WUFLeEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsTUFBYyxFQUFFLEVBQUU7Z0JBQzdGLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDZixPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNqQixPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFFRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNuQyxJQUFJLFlBQVksS0FBSyxTQUFTLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsWUFBWSxDQUFDLEtBQUssU0FBUyxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsS0FBSyxTQUFTLENBQUMsRUFBRTtvQkFDMUksT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO29CQUM3QixPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFJRCxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNILEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2YsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7Z0JBQzlCLElBQUksOEJBQW9CLENBQUMsd0NBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUNqRSxlQUFlLENBQUMsSUFBSSxDQUFDO3FCQUNyQixTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7YUFDekgsQ0FBQyxDQUFDLENBQUM7UUFDTixDQUFDO1FBRWtCLGlCQUFpQixDQUFDLE9BQWdCO1lBQ3BELE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUVEO0lBaEVELG1DQWdFQyJ9