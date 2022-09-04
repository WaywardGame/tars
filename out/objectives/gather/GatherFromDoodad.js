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
            return "Gathering items from doodads";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbURvb2RhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJGcm9tRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLE1BQXFCLGdCQUFpQixTQUFRLG1CQUFTO1FBRXRELFlBQTZCLFFBQWtCLEVBQW1CLGVBQWdDO1lBQ2pHLEtBQUssRUFBRSxDQUFDO1lBRG9CLGFBQVEsR0FBUixRQUFRLENBQVU7WUFBbUIsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBRWxHLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sb0JBQW9CLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDdEQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLDhCQUE4QixDQUFDO1FBQ3ZDLENBQUM7UUFFZSxnQkFBZ0I7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRWUsU0FBUztZQUt4QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxNQUFjLEVBQUUsRUFBRTtnQkFDN0YsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUNmLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDakIsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLFlBQVksS0FBSyxTQUFTLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsWUFBWSxDQUFDLEtBQUssU0FBUyxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsS0FBSyxTQUFTLENBQUMsRUFBRTtvQkFDMUksT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO29CQUM3QixPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFJRCxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ0gsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDZixJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQztnQkFDOUIsSUFBSSw4QkFBb0IsQ0FBQyx3Q0FBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQ2pFLGVBQWUsQ0FBQyxJQUFJLENBQUM7cUJBQ3JCLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQzthQUN6SCxDQUFDLENBQUMsQ0FBQztRQUNOLENBQUM7UUFFa0IsaUJBQWlCLENBQUMsT0FBZ0I7WUFDcEQsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO0tBRUQ7SUFoRUQsbUNBZ0VDIn0=