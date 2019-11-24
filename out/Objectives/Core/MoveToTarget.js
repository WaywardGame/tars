define(["require", "exports", "entity/IStats", "tile/Terrains", "utilities/math/Vector2", "utilities/TileHelpers", "../../Context", "../../IObjective", "../../Objective", "../../Utilities/Logger", "../../Utilities/Movement", "../Other/Rest"], function (require, exports, IStats_1, Terrains_1, Vector2_1, TileHelpers_1, Context_1, IObjective_1, Objective_1, Logger_1, Movement_1, Rest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToTarget extends Objective_1.default {
        constructor(target, moveAdjacentToTarget, checkStamina = true) {
            super();
            this.target = target;
            this.moveAdjacentToTarget = moveAdjacentToTarget;
            this.checkStamina = checkStamina;
        }
        getIdentifier() {
            return `MoveToTarget:${this.target}:(${this.target.x},${this.target.y},${this.target.z}):${this.moveAdjacentToTarget}:${this.checkStamina}`;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            const movementPath = await Movement_1.getMovementPath(context, this.target, this.moveAdjacentToTarget);
            if (context.calculatingDifficulty) {
                context.setData(Context_1.ContextDataType.LastKnownPosition, { x: this.target.x, y: this.target.y, z: this.target.z });
                return movementPath.difficulty;
            }
            if (this.checkStamina) {
                const path = movementPath.path;
                if (path) {
                    const stamina = context.player.stat.get(IStats_1.Stat.Stamina);
                    if ((stamina.max - stamina.value) > 2) {
                        let swimTiles = 0;
                        for (let i = 4; i < path.length; i++) {
                            const point = path[i];
                            const tile = game.getTile(point.x, point.y, context.player.z);
                            const tileType = TileHelpers_1.default.getType(tile);
                            const terrainDescription = Terrains_1.default[tileType];
                            if (terrainDescription && terrainDescription.water) {
                                swimTiles++;
                            }
                        }
                        if (swimTiles > 0) {
                            if (stamina.value - swimTiles <= 10) {
                                Logger_1.log.info(`Going to be swimming for ${swimTiles} tiles soon. Resting first`);
                                return new Rest_1.default();
                            }
                        }
                    }
                }
            }
            const moveResult = await Movement_1.move(context, this.target, this.moveAdjacentToTarget);
            switch (moveResult) {
                case Movement_1.MoveResult.NoTarget:
                    this.log.info("No target to move to");
                    return IObjective_1.ObjectiveResult.Complete;
                case Movement_1.MoveResult.NoPath:
                    this.log.info(`No path to target ${this.target}`);
                    return IObjective_1.ObjectiveResult.Complete;
                case Movement_1.MoveResult.Moving:
                    this.log.info(`Moving to target (${this.target.x},${this.target.y},${this.target.z})`);
                    return IObjective_1.ObjectiveResult.Pending;
                case Movement_1.MoveResult.Complete:
                    this.log.info("Finished moving to target");
                    context.setData(Context_1.ContextDataType.LastKnownPosition, { x: this.target.x, y: this.target.y, z: this.target.z });
                    return IObjective_1.ObjectiveResult.Complete;
            }
        }
        trackCreature(creature) {
            this.trackedCreature = creature;
            this.trackedPosition = creature ? creature.getPoint() : undefined;
            return this;
        }
        async onMove(context) {
            if (this.trackedCreature && this.trackedPosition) {
                if (!this.trackedCreature.isValid()) {
                    this.log.info("Creature died");
                    return true;
                }
                if (Vector2_1.default.distance(context.player, this.trackedCreature) > 5) {
                    return false;
                }
                const trackedCreaturePosition = this.trackedCreature.getPoint();
                if (trackedCreaturePosition.x !== this.trackedPosition.x ||
                    trackedCreaturePosition.y !== this.trackedPosition.y ||
                    trackedCreaturePosition.z !== this.trackedPosition.z) {
                    this.log.info("Moving with tracked creature");
                    this.trackedPosition = trackedCreaturePosition;
                    const moveResult = await Movement_1.move(context, trackedCreaturePosition, this.moveAdjacentToTarget, true);
                    switch (moveResult) {
                        case Movement_1.MoveResult.NoTarget:
                            this.log.info("No target to move to");
                            return true;
                        case Movement_1.MoveResult.NoPath:
                            this.log.info(`No path to target ${this.trackedCreature.toString()}`);
                            return true;
                        case Movement_1.MoveResult.Moving:
                            return false;
                        case Movement_1.MoveResult.Complete:
                            this.log.info("Finished moving to target");
                            return false;
                    }
                }
            }
            return super.onMove(context, this.trackedCreature);
        }
    }
    exports.default = MoveToTarget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvVGFyZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvQ29yZS9Nb3ZlVG9UYXJnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBY0EsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBS2xELFlBQ1csTUFBZ0IsRUFDUCxvQkFBNkIsRUFDN0IsZUFBd0IsSUFBSTtZQUMvQyxLQUFLLEVBQUUsQ0FBQztZQUhFLFdBQU0sR0FBTixNQUFNLENBQVU7WUFDUCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQVM7WUFDN0IsaUJBQVksR0FBWixZQUFZLENBQWdCO1FBRWhELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sZ0JBQWdCLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLG9CQUFvQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUM3SSxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxZQUFZLEdBQUcsTUFBTSwwQkFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBRTVGLElBQUksT0FBTyxDQUFDLHFCQUFxQixFQUFFO2dCQUNsQyxPQUFPLENBQUMsT0FBTyxDQUFDLHlCQUFlLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFD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