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
            const carveTool = Item_1.getBestTool(context, IAction_1.ActionType.Carve);
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
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = CarveCorpse;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FydmVDb3Jwc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9pbnRlcnJ1cHQvQ2FydmVDb3Jwc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsTUFBcUIsV0FBWSxTQUFRLG1CQUFTO1FBRWpELFlBQTZCLE1BQWM7WUFDMUMsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUUzQyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUN4QyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sV0FBVyxxQkFBVyxDQUFDLE1BQU0sQ0FBQyx5QkFBVSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7UUFDbEcsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxTQUFTLEdBQUcsa0JBQVcsQ0FBQyxPQUFPLEVBQUUsb0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6RCxJQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7Z0JBQy9DLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWhELElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7Z0JBQzdELE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVyRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDdkUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXBCLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FFRDtJQXRDRCw4QkFzQ0MifQ==