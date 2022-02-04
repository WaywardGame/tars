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
                const searchMap = this.doodadSearchMap.get(doodad.type);
                if (!searchMap) {
                    return false;
                }
                const description = doodad.description();
                if (!description) {
                    return false;
                }
                const growingStage = doodad.getGrowingStage();
                if (growingStage === undefined || (description.gather?.[growingStage] === undefined && description.harvest?.[growingStage] === undefined)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbURvb2RhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBSXRELFlBQTZCLFFBQWtCLEVBQW1CLGVBQWdDO1lBQ2pHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBRmxGLDRCQUF1QixHQUFHLEdBQUcsQ0FBQztRQUk5QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLG9CQUFvQixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyw4QkFBOEIsQ0FBQztRQUN2QyxDQUFDO1FBRWUsZ0JBQWdCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxNQUFjLEVBQUUsRUFBRTtnQkFDcEcsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUNmLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDakIsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLFlBQVksS0FBSyxTQUFTLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsWUFBWSxDQUFDLEtBQUssU0FBUyxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsS0FBSyxTQUFTLENBQUMsRUFBRTtvQkFDMUksT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO29CQUM3QixPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFJRCxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ0gsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNiLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7Z0JBRXBDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVoRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQUMsd0NBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUNqRixlQUFlLENBQUMsSUFBSSxDQUFDO3FCQUNyQixTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUUzSCxPQUFPLFVBQVUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFa0IsaUJBQWlCLENBQUMsT0FBZ0I7WUFDcEQsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO0tBRUQ7SUEvREQsbUNBK0RDIn0=