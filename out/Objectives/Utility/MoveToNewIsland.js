define(["require", "exports", "entity/action/IAction", "game/Island", "utilities/math/Direction", "../../IObjective", "../../Objective", "../Core/ExecuteAction", "../Core/MoveToTarget"], function (require, exports, IAction_1, Island_1, Direction_1, IObjective_1, Objective_1, ExecuteAction_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToNewIsland extends Objective_1.default {
        getIdentifier() {
            return "MoveToNewIsland";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvTmV3SXNsYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvVXRpbGl0eS9Nb3ZlVG9OZXdJc2xhbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV0EsTUFBcUIsZUFBZ0IsU0FBUSxtQkFBUztRQUU5QyxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLENBQUM7UUFDMUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxnQkFBZ0IsR0FBOEUsRUFBRSxDQUFDO1lBRXZHLEtBQUssTUFBTSxTQUFTLElBQUkscUJBQVMsQ0FBQyxTQUFTLEVBQUU7Z0JBQzVDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQsTUFBTSxRQUFRLEdBQUc7b0JBQ2hCLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztvQkFDakMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDO2lCQUNqQyxDQUFDO2dCQUVGLE1BQU0sUUFBUSxHQUFHLGdCQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ2hDLE1BQU0sWUFBWSxHQUFhO3dCQUM5QixDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7d0JBQzFGLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQzt3QkFDMUYsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDbkIsQ0FBQztvQkFFRixnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7d0JBQ3JCLFFBQVE7d0JBQ1IsWUFBWTt3QkFDWixTQUFTO3FCQUNULENBQUMsQ0FBQztpQkFDSDthQUNEO1lBRUQsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUN0QyxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsT0FBTyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDckMsSUFBSSxzQkFBWSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsQ0FBQztnQkFDM0YsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUN0RCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNsRCxDQUFDLENBQUM7YUFDRixDQUFDLENBQUM7UUFDSixDQUFDO0tBRUQ7SUE5Q0Qsa0NBOENDIn0=