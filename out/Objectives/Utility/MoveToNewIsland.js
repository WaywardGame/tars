define(["require", "exports", "game/entity/action/IAction", "game/Island", "utilities/math/Direction", "../../IObjective", "../../Objective", "../Core/ExecuteAction", "../Core/MoveToTarget"], function (require, exports, IAction_1, Island_1, Direction_1, IObjective_1, Objective_1, ExecuteAction_1, MoveToTarget_1) {
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
            return unvisitedIslands.map(island => [
                new MoveToTarget_1.default(island.edgePosition, true, { allowBoat: true, disableStaminaCheck: true }),
                new ExecuteAction_1.default(IAction_1.ActionType.Move, (context, action) => {
                    action.execute(context.player, island.direction);
                }),
            ]);
        }
    }
    exports.default = MoveToNewIsland;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvTmV3SXNsYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvVXRpbGl0eS9Nb3ZlVG9OZXdJc2xhbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBVUEsTUFBcUIsZUFBZ0IsU0FBUSxtQkFBUztRQUU5QyxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLENBQUM7UUFDMUIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHdCQUF3QixDQUFDO1FBQ2pDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sZ0JBQWdCLEdBQXVGLEVBQUUsQ0FBQztZQUVoSCxLQUFLLE1BQU0sU0FBUyxJQUFJLHFCQUFTLENBQUMsU0FBUyxFQUFFO2dCQUM1QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELE1BQU0sUUFBUSxHQUFHO29CQUNoQixDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7b0JBQ2pDLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztpQkFDakMsQ0FBQztnQkFFRixNQUFNLFFBQVEsR0FBRyxnQkFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUNoQyxNQUFNLFlBQVksR0FBYTt3QkFDOUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO3dCQUMxRixDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7d0JBQzFGLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ25CLENBQUM7b0JBRUYsZ0JBQWdCLENBQUMsSUFBSSxDQUFDO3dCQUNyQixRQUFRO3dCQUNSLFlBQVk7d0JBQ1osU0FBUztxQkFDVCxDQUFDLENBQUM7aUJBQ0g7YUFDRDtZQUVELElBQUksZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDdEMsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE9BQU8sZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ3JDLElBQUksc0JBQVksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUM7Z0JBQzNGLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDdEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDbEQsQ0FBQyxDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUVEO0lBbERELGtDQWtEQyJ9