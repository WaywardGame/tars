define(["require", "exports", "game/entity/action/IAction", "language/Dictionaries", "language/Translation", "../../IObjective", "../../Objective", "../../utilities/Item", "../core/ExecuteAction", "../core/MoveToTarget"], function (require, exports, IAction_1, Dictionaries_1, Translation_1, IObjective_1, Objective_1, Item_1, ExecuteAction_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CarveCorpse extends Objective_1.default {
        constructor(corpse) {
            super();
            this.corpse = corpse;
        }
        getIdentifier() {
            return `CarveCorpse:${this.corpse.id}`;
        }
        getStatus() {
            return `Carving ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Creature, this.corpse.type).getString()} corpse`;
        }
        async execute(context) {
            const carveTool = Item_1.itemUtilities.getBestTool(context, IAction_1.ActionType.Carve);
            if (carveTool === undefined) {
                this.log.info("Missing carve tool for corpse");
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const tile = game.getTileFromPoint(this.corpse);
            if (tile.events !== undefined || tile.creature !== undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectives = [];
            objectives.push(new MoveToTarget_1.default(this.corpse, true));
            objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Carve, (context, action) => {
                action.execute(context.player, carveTool);
                return IObjective_1.ObjectiveResult.Complete;
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = CarveCorpse;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FydmVDb3Jwc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9pbnRlcnJ1cHQvQ2FydmVDb3Jwc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBRWpELFlBQTZCLE1BQWM7WUFDMUMsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUUzQyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUN4QyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sV0FBVyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyx5QkFBVSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7UUFDbEcsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxTQUFTLEdBQUcsb0JBQWEsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkUsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFO2dCQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2dCQUMvQyxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVoRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO2dCQUM3RCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFckQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ3ZFLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDMUMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVwQixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUF2Q0QsOEJBdUNDIn0=