/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "@wayward/game/game/island/IIsland", "@wayward/game/utilities/math/Direction", "@wayward/game/utilities/math/Vector2", "../../../core/objective/Objective", "./MoveToIsland"], function (require, exports, IIsland_1, Direction_1, Vector2_1, Objective_1, MoveToIsland_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvTmV3SXNsYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9tb3ZlVG8vTW92ZVRvTmV3SXNsYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQVdILE1BQXFCLGVBQWdCLFNBQVEsbUJBQVM7UUFFOUMsYUFBYTtZQUNuQixPQUFPLGlCQUFpQixDQUFDO1FBQzFCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyx3QkFBd0IsQ0FBQztRQUNqQyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGdCQUFnQixHQUFlLEVBQUUsQ0FBQztZQUV4QyxLQUFLLE1BQU0sU0FBUyxJQUFJLHFCQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzdDLE1BQU0sUUFBUSxHQUFHLGlCQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUUvQyxNQUFNLFFBQVEsR0FBRztvQkFDaEIsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztvQkFDekMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztpQkFDekMsQ0FBQztnQkFFRixNQUFNLFFBQVEsR0FBRyx3QkFBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7b0JBQ2pDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDakMsQ0FBQztZQUNGLENBQUM7WUFFRCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscURBQXFELENBQUMsQ0FBQztnQkFFckUsS0FBSyxNQUFNLFNBQVMsSUFBSSxxQkFBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUM3QyxNQUFNLFFBQVEsR0FBRyxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFFL0MsTUFBTSxRQUFRLEdBQUc7d0JBQ2hCLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7d0JBQ3pDLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7cUJBQ3pDLENBQUM7b0JBRUYsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLHdCQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELENBQUM7WUFDRixDQUFDO1lBRUQsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLEtBQUssTUFBTSxRQUFRLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztnQkFDekMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxzQkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2RCxDQUFDO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBRUQ7SUFuREQsa0NBbURDIn0=