define(["require", "exports", "game/entity/action/IAction", "game/Island", "utilities/math/Direction", "game/item/IItem", "../../IObjective", "../../Objective", "../acquire/item/AcquireItem", "../core/ExecuteAction", "../core/MoveToTarget", "../analyze/AnalyzeInventory", "./MoveToWater", "../other/item/MoveItemIntoInventory"], function (require, exports, IAction_1, Island_1, Direction_1, IItem_1, IObjective_1, Objective_1, AcquireItem_1, ExecuteAction_1, MoveToTarget_1, AnalyzeInventory_1, MoveToWater_1, MoveItemIntoInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToNewIsland extends Objective_1.default {
        getIdentifier() {
            return "MoveToNewIsland";
        }
        getStatus() {
            return "Moving to a new island";
        }
        async execute(context) {
            const unvisitedIslands = [];
            for (const direction of Direction_1.Direction.CARDINALS) {
                const movement = game.directionToMovement(direction);
                const position = {
                    x: island.position.x + movement.x,
                    y: island.position.y + movement.y,
                };
                const islandId = Island_1.default.positionToId(position);
                if (!game.islands.has(islandId)) {
                    const edgePosition = {
                        x: Math.min(Math.max(context.player.x + (movement.x * game.mapSize), 0), game.mapSize - 1),
                        y: Math.min(Math.max(context.player.y + (movement.y * game.mapSize), 0), game.mapSize - 1),
                        z: context.player.z,
                    };
                    unvisitedIslands.push({
                        islandId,
                        edgePosition,
                        direction,
                    });
                }
            }
            if (unvisitedIslands.length === 0) {
                this.log.info("No unvisited islands");
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectivePipelines = [];
            for (const unvisitedIsland of unvisitedIslands) {
                objectivePipelines.push([
                    ...(context.inventory.sailBoat ? [new MoveItemIntoInventory_1.default(context.inventory.sailBoat)] : [new AcquireItem_1.default(IItem_1.ItemType.Sailboat), new AnalyzeInventory_1.default()]),
                    new MoveToWater_1.default(true),
                    new MoveToTarget_1.default(unvisitedIsland.edgePosition, true, { allowBoat: true, disableStaminaCheck: true }),
                    new ExecuteAction_1.default(IAction_1.ActionType.Move, (context, action) => {
                        action.execute(context.player, unvisitedIsland.direction);
                        return IObjective_1.ObjectiveResult.Complete;
                    }).setStatus(this),
                ]);
            }
            return objectivePipelines;
        }
    }
    exports.default = MoveToNewIsland;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvTmV3SXNsYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9Nb3ZlVG9OZXdJc2xhbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0JBLE1BQXFCLGVBQWdCLFNBQVEsbUJBQVM7UUFFOUMsYUFBYTtZQUNuQixPQUFPLGlCQUFpQixDQUFDO1FBQzFCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyx3QkFBd0IsQ0FBQztRQUNqQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGdCQUFnQixHQUF1RixFQUFFLENBQUM7WUFFaEgsS0FBSyxNQUFNLFNBQVMsSUFBSSxxQkFBUyxDQUFDLFNBQVMsRUFBRTtnQkFDNUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVyRCxNQUFNLFFBQVEsR0FBRztvQkFDaEIsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDO29CQUNqQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7aUJBQ2pDLENBQUM7Z0JBRUYsTUFBTSxRQUFRLEdBQUcsZ0JBQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDaEMsTUFBTSxZQUFZLEdBQWE7d0JBQzlCLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQzt3QkFDMUYsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO3dCQUMxRixDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUNuQixDQUFDO29CQUVGLGdCQUFnQixDQUFDLElBQUksQ0FBQzt3QkFDckIsUUFBUTt3QkFDUixZQUFZO3dCQUNaLFNBQVM7cUJBQ1QsQ0FBQyxDQUFDO2lCQUNIO2FBQ0Q7WUFFRCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBQ3RDLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsS0FBSyxNQUFNLGVBQWUsSUFBSSxnQkFBZ0IsRUFBRTtnQkFDL0Msa0JBQWtCLENBQUMsSUFBSSxDQUFDO29CQUN2QixHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSwrQkFBcUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSwwQkFBZ0IsRUFBRSxDQUFDLENBQUM7b0JBQ3hKLElBQUkscUJBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ3JCLElBQUksc0JBQVksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUM7b0JBQ3BHLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTt3QkFDdEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDMUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztvQkFDakMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztpQkFDbEIsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FFRDtJQTNERCxrQ0EyREMifQ==