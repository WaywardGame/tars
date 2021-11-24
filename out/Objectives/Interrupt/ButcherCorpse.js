define(["require", "exports", "game/entity/action/IAction", "language/Dictionary", "language/Translation", "../../IObjective", "../../Objective", "../../utilities/Item", "../core/ExecuteAction", "../core/MoveToTarget"], function (require, exports, IAction_1, Dictionary_1, Translation_1, IObjective_1, Objective_1, Item_1, ExecuteAction_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ButcherCorpse extends Objective_1.default {
        constructor(corpse) {
            super();
            this.corpse = corpse;
        }
        getIdentifier() {
            return `ButcherCorpse:${this.corpse.id}`;
        }
        getStatus() {
            return `Butchering ${Translation_1.default.nameOf(Dictionary_1.default.Creature, this.corpse.type).getString()} corpse`;
        }
        async execute(context) {
            const tool = Item_1.itemUtilities.getBestTool(context, IAction_1.ActionType.Butcher);
            if (tool === undefined) {
                this.log.info("Missing butcher tool for corpse");
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const tile = context.island.getTileFromPoint(this.corpse);
            if (tile.events !== undefined || tile.creature !== undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectives = [];
            objectives.push(new MoveToTarget_1.default(this.corpse, true));
            objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Butcher, (context, action) => {
                action.execute(context.player, tool);
                return IObjective_1.ObjectiveResult.Complete;
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = ButcherCorpse;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnV0Y2hlckNvcnBzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2ludGVycnVwdC9CdXRjaGVyQ29ycHNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVlBLE1BQXFCLGFBQWMsU0FBUSxtQkFBUztRQUVuRCxZQUE2QixNQUFjO1lBQzFDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFdBQU0sR0FBTixNQUFNLENBQVE7UUFFM0MsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMxQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sY0FBYyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7UUFDckcsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxJQUFJLEdBQUcsb0JBQWEsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDcEUsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO2dCQUNqRCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFMUQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtnQkFDN0QsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXJELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUN6RSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3JDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFcEIsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUVEO0lBdkNELGdDQXVDQyJ9