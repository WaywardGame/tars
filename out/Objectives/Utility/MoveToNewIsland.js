define(["require", "exports", "game/entity/action/IAction", "game/Island", "utilities/math/Direction", "game/item/IItem", "../../IObjective", "../../Objective", "../acquire/item/AcquireItem", "../core/ExecuteAction", "../core/MoveToTarget", "../analyze/AnalyzeInventory", "./MoveToWater"], function (require, exports, IAction_1, Island_1, Direction_1, IItem_1, IObjective_1, Objective_1, AcquireItem_1, ExecuteAction_1, MoveToTarget_1, AnalyzeInventory_1, MoveToWater_1) {
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
                const objectives = [];
                if (!context.inventory.sailBoat || !itemManager.isContainableInContainer(context.inventory.sailBoat, context.player.inventory)) {
                    objectives.push(new AcquireItem_1.default(IItem_1.ItemType.Sailboat), new AnalyzeInventory_1.default());
                }
                objectives.push(new MoveToWater_1.default(true));
                objectives.push(new MoveToTarget_1.default(unvisitedIsland.edgePosition, true, { allowBoat: true, disableStaminaCheck: true }));
                objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Move, (context, action) => {
                    action.execute(context.player, unvisitedIsland.direction);
                }));
                objectivePipelines.push(objectives);
            }
            return objectivePipelines;
        }
    }
    exports.default = MoveToNewIsland;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvTmV3SXNsYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9Nb3ZlVG9OZXdJc2xhbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZUEsTUFBcUIsZUFBZ0IsU0FBUSxtQkFBUztRQUU5QyxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLENBQUM7UUFDMUIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHdCQUF3QixDQUFDO1FBQ2pDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sZ0JBQWdCLEdBQXVGLEVBQUUsQ0FBQztZQUVoSCxLQUFLLE1BQU0sU0FBUyxJQUFJLHFCQUFTLENBQUMsU0FBUyxFQUFFO2dCQUM1QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELE1BQU0sUUFBUSxHQUFHO29CQUNoQixDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7b0JBQ2pDLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztpQkFDakMsQ0FBQztnQkFFRixNQUFNLFFBQVEsR0FBRyxnQkFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUNoQyxNQUFNLFlBQVksR0FBYTt3QkFDOUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO3dCQUMxRixDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7d0JBQzFGLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ25CLENBQUM7b0JBRUYsZ0JBQWdCLENBQUMsSUFBSSxDQUFDO3dCQUNyQixRQUFRO3dCQUNSLFlBQVk7d0JBQ1osU0FBUztxQkFDVCxDQUFDLENBQUM7aUJBQ0g7YUFDRDtZQUVELElBQUksZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDdEMsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxLQUFLLE1BQU0sZUFBZSxJQUFJLGdCQUFnQixFQUFFO2dCQUMvQyxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO2dCQUVwQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLElBQUksQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFFL0gsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLENBQUMsQ0FBQztpQkFDNUU7Z0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdkMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDdEgsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQ3RFLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzNELENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRUosa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBRUQ7SUFoRUQsa0NBZ0VDIn0=