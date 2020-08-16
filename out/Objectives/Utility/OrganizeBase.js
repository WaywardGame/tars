define(["require", "exports", "entity/action/IAction", "../../IObjective", "../../Objective", "../Core/ExecuteAction", "../Core/MoveToTarget"], function (require, exports, IAction_1, IObjective_1, Objective_1, ExecuteAction_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OrganizeBase extends Objective_1.default {
        constructor(tiles) {
            super();
            this.tiles = tiles;
        }
        getIdentifier() {
            return "OrganizeBase";
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return true;
        }
        async execute(context) {
            if (this.tiles.length === 0) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const chests = context.base.chest.slice().sort((a, b) => itemManager.computeContainerWeight(a) > itemManager.computeContainerWeight(b) ? 1 : -1);
            if (chests.length === 0) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectives = [];
            for (const position of this.tiles) {
                const tile = game.getTileFromPoint(position);
                if (tile.containedItems && tile.containedItems.length > 0) {
                    objectives.push(new MoveToTarget_1.default(position, true));
                    for (const item of tile.containedItems) {
                        objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                            action.execute(context.player, item, context.player.inventory);
                        }));
                    }
                    objectives.push(new MoveToTarget_1.default(chests[0], true));
                    for (const item of tile.containedItems) {
                        objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                            action.execute(context.player, item, chests[0]);
                        }));
                    }
                }
            }
            return objectives;
        }
        static moveIntoChestObjectives(chest, itemsToMove) {
            const targetContainer = chest;
            const weight = itemManager.computeContainerWeight(targetContainer);
            if (weight + itemsToMove[0].getTotalWeight() <= targetContainer.weightCapacity) {
                const objectives = [];
                objectives.push(new MoveToTarget_1.default(chest, true));
                for (const item of itemsToMove) {
                    objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                        action.execute(context.player, item, targetContainer);
                    }));
                }
                return objectives;
            }
            return undefined;
        }
    }
    exports.default = OrganizeBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3JnYW5pemVCYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvVXRpbGl0eS9Pcmdhbml6ZUJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV0EsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBRWxELFlBQTZCLEtBQWlCO1lBQzdDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFVBQUssR0FBTCxLQUFLLENBQVk7UUFFOUMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxjQUFjLENBQUM7UUFDdkIsQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUNuRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUM1QixPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBR0QsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQWUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdLLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLEtBQUssTUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDbEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUkxRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFFbEQsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO3dCQUN2QyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTs0QkFDMUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNoRSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNKO29CQUdELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUVuRCxLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7d0JBQ3ZDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFOzRCQUMxRSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQWUsQ0FBQyxDQUFDO3dCQUMvRCxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNKO2lCQUdEO2FBQ0Q7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO1FBRU0sTUFBTSxDQUFDLHVCQUF1QixDQUFDLEtBQWEsRUFBRSxXQUFtQjtZQUN2RSxNQUFNLGVBQWUsR0FBRyxLQUFtQixDQUFDO1lBQzVDLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNuRSxJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLElBQUksZUFBZSxDQUFDLGNBQWUsRUFBRTtnQkFFaEYsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztnQkFFcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRS9DLEtBQUssTUFBTSxJQUFJLElBQUksV0FBVyxFQUFFO29CQUMvQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTt3QkFDMUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztvQkFDdkQsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDSjtnQkFFRCxPQUFPLFVBQVUsQ0FBQzthQUNsQjtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7S0FFRDtJQWxGRCwrQkFrRkMifQ==