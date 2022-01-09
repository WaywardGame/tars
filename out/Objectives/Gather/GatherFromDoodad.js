define(["require", "exports", "game/item/IItem", "language/Dictionary", "language/Translation", "../../core/objective/Objective", "../core/ExecuteActionForItem", "../core/MoveToTarget"], function (require, exports, IItem_1, Dictionary_1, Translation_1, Objective_1, ExecuteActionForItem_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromDoodad extends Objective_1.default {
        constructor(itemType, doodadSearchMap) {
            super();
            this.itemType = itemType;
            this.doodadSearchMap = doodadSearchMap;
            this.gatherObjectivePriority = 200;
        }
        getIdentifier() {
            return `GatherFromDoodad:${IItem_1.ItemType[this.itemType]}`;
        }
        getStatus() {
            return "Gathering items from doodads";
        }
        canGroupTogether() {
            return true;
        }
        async execute(context) {
            return context.utilities.object.findDoodads(context, `${this.getIdentifier()}|1`, (doodad) => {
                var _a, _b;
                const searchMap = this.doodadSearchMap.get(doodad.type);
                if (!searchMap) {
                    return false;
                }
                const description = doodad.description();
                if (!description) {
                    return false;
                }
                const growingStage = doodad.getGrowingStage();
                if (growingStage === undefined || (((_a = description.gather) === null || _a === void 0 ? void 0 : _a[growingStage]) === undefined && ((_b = description.harvest) === null || _b === void 0 ? void 0 : _b[growingStage]) === undefined)) {
                    return false;
                }
                const difficulty = searchMap.get(growingStage);
                if (difficulty === undefined) {
                    return false;
                }
                return context.utilities.tile.canGather(context, doodad.getTile(), true);
            }, 5)
                .map(target => {
                const objectives = [];
                objectives.push(new MoveToTarget_1.default(target, true));
                objectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Doodad, [this.itemType])
                    .passAcquireData(this)
                    .setStatus(() => `Gathering ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} from ${target.getName()}`));
                return objectives;
            });
        }
        getBaseDifficulty(context) {
            return 20;
        }
    }
    exports.default = GatherFromDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbURvb2RhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBSXRELFlBQTZCLFFBQWtCLEVBQW1CLGVBQWdDO1lBQ2pHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBRmxGLDRCQUF1QixHQUFHLEdBQUcsQ0FBQztRQUk5QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLG9CQUFvQixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyw4QkFBOEIsQ0FBQztRQUN2QyxDQUFDO1FBRWUsZ0JBQWdCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxNQUFjLEVBQUUsRUFBRTs7Z0JBQ3BHLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDZixPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2pCLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDOUMsSUFBSSxZQUFZLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQSxNQUFBLFdBQVcsQ0FBQyxNQUFNLDBDQUFHLFlBQVksQ0FBQyxNQUFLLFNBQVMsSUFBSSxDQUFBLE1BQUEsV0FBVyxDQUFDLE9BQU8sMENBQUcsWUFBWSxDQUFDLE1BQUssU0FBUyxDQUFDLEVBQUU7b0JBQzFJLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQy9DLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtvQkFDN0IsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBSUQsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNILEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDYixNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO2dCQUVwQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFaEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLHdDQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztxQkFDakYsZUFBZSxDQUFDLElBQUksQ0FBQztxQkFDckIsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLGFBQWEscUJBQVcsQ0FBQyxNQUFNLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFM0gsT0FBTyxVQUFVLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRWtCLGlCQUFpQixDQUFDLE9BQWdCO1lBQ3BELE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUVEO0lBL0RELG1DQStEQyJ9