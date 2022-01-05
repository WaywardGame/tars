define(["require", "exports", "game/island/IIsland", "utilities/math/Direction", "utilities/math/Vector2", "../../../core/objective/Objective", "./MoveToIsland"], function (require, exports, IIsland_1, Direction_1, Vector2_1, Objective_1, MoveToIsland_1) {
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
                const movement = Vector2_1.default.DIRECTIONS[direction];
                const position = {
                    x: context.island.position.x + movement.x,
                    y: context.island.position.y + movement.y,
                };
                const islandId = IIsland_1.IslandPosition.toId(position);
                if (!game.islands.has(islandId)) {
                    unvisitedIslands.push(islandId);
                }
            }
            if (unvisitedIslands.length === 0) {
                this.log.info("No unvisited islands. Going to visit a previous one");
                for (const direction of Direction_1.Direction.CARDINALS) {
                    const movement = Vector2_1.default.DIRECTIONS[direction];
                    const position = {
                        x: context.island.position.x + movement.x,
                        y: context.island.position.y + movement.y,
                    };
                    unvisitedIslands.push(IIsland_1.IslandPosition.toId(position));
                }
            }
            const objectivePipelines = [];
            for (const islandId of unvisitedIslands) {
                objectivePipelines.push([new MoveToIsland_1.default(islandId)]);
            }
            return objectivePipelines;
        }
    }
    exports.default = MoveToNewIsland;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvTmV3SXNsYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9tb3ZlVG8vTW92ZVRvTmV3SXNsYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLE1BQXFCLGVBQWdCLFNBQVEsbUJBQVM7UUFFOUMsYUFBYTtZQUNuQixPQUFPLGlCQUFpQixDQUFDO1FBQzFCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyx3QkFBd0IsQ0FBQztRQUNqQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGdCQUFnQixHQUFlLEVBQUUsQ0FBQztZQUV4QyxLQUFLLE1BQU0sU0FBUyxJQUFJLHFCQUFTLENBQUMsU0FBUyxFQUFFO2dCQUM1QyxNQUFNLFFBQVEsR0FBRyxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFL0MsTUFBTSxRQUFRLEdBQUc7b0JBQ2hCLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7b0JBQ3pDLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7aUJBQ3pDLENBQUM7Z0JBRUYsTUFBTSxRQUFRLEdBQUcsd0JBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDaEMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNoQzthQUNEO1lBRUQsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO2dCQUVyRSxLQUFLLE1BQU0sU0FBUyxJQUFJLHFCQUFTLENBQUMsU0FBUyxFQUFFO29CQUM1QyxNQUFNLFFBQVEsR0FBRyxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFFL0MsTUFBTSxRQUFRLEdBQUc7d0JBQ2hCLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7d0JBQ3pDLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7cUJBQ3pDLENBQUM7b0JBRUYsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLHdCQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7aUJBQ3JEO2FBQ0Q7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsS0FBSyxNQUFNLFFBQVEsSUFBSSxnQkFBZ0IsRUFBRTtnQkFDeEMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxzQkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN0RDtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztLQUVEO0lBbkRELGtDQW1EQyJ9