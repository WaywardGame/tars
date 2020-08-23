define(["require", "exports", "entity/IStats", "tile/Terrains", "utilities/math/Vector2", "utilities/TileHelpers", "../../Context", "../../IObjective", "../../Objective", "../../Utilities/Logger", "../../Utilities/Movement", "../Other/Rest"], function (require, exports, IStats_1, Terrains_1, Vector2_1, TileHelpers_1, Context_1, IObjective_1, Objective_1, Logger_1, Movement_1, Rest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToTarget extends Objective_1.default {
        constructor(target, moveAdjacentToTarget, options) {
            super();
            this.target = target;
            this.moveAdjacentToTarget = moveAdjacentToTarget;
            this.options = options;
        }
        getIdentifier() {
            var _a, _b, _c;
            return `MoveToTarget:${this.target}:(${this.target.x},${this.target.y},${this.target.z}):${this.moveAdjacentToTarget}:${((_a = this.options) === null || _a === void 0 ? void 0 : _a.disableStaminaCheck) ? true : false}:${(_c = (_b = this.options) === null || _b === void 0 ? void 0 : _b.range) !== null && _c !== void 0 ? _c : 0}`;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            var _a, _b;
            const position = context.getPosition();
            if (position.z !== this.target.z) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const movementPath = await Movement_1.getMovementPath(context, this.target, this.moveAdjacentToTarget);
            if (context.calculatingDifficulty) {
                context.setData(Context_1.ContextDataType.Position, { x: this.target.x, y: this.target.y, z: this.target.z });
                return movementPath.difficulty;
            }
            if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.disableStaminaCheck)) {
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
            const range = (_b = this.options) === null || _b === void 0 ? void 0 : _b.range;
            if (range !== undefined && Vector2_1.default.isDistanceWithin(context.player, this.target, range)) {
                this.log.info("Within range of the target");
                return IObjective_1.ObjectiveResult.Complete;
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
                    context.setData(Context_1.ContextDataType.Position, { x: this.target.x, y: this.target.y, z: this.target.z });
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
                if (this.trackedCreature.isTamed()) {
                    this.log.info("Creature became tamed");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvVGFyZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvQ29yZS9Nb3ZlVG9UYXJnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBcUJBLE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUtsRCxZQUNXLE1BQWdCLEVBQ1Asb0JBQTZCLEVBQzdCLE9BQThCO1lBQ2pELEtBQUssRUFBRSxDQUFDO1lBSEUsV0FBTSxHQUFOLE1BQU0sQ0FBVTtZQUNQLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBUztZQUM3QixZQUFPLEdBQVAsT0FBTyxDQUF1QjtRQUVsRCxDQUFDO1FBRU0sYUFBYTs7WUFDbkIsT0FBTyxnQkFBZ0IsSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsb0JBQW9CLElBQUksT0FBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxtQkFBbUIsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksWUFBQSxJQUFJLENBQUMsT0FBTywwQ0FBRSxLQUFLLG1DQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3hNLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksUUFBUSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtnQkFDakMsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQVdELE1BQU0sWUFBWSxHQUFHLE1BQU0sMEJBQWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUU1RixJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtnQkFDbEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyx5QkFBZSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDcEcsT0FBTyxZQUFZLENBQUMsVUFBVSxDQUFDO2FBQy9CO1lBRUQsSUFBSSxRQUFDLElBQUksQ0FBQyxPQUFPLDBDQUFFLG1CQUFtQixDQUFBLEVBQUU7Z0JBQ3ZDLE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQy9CLElBQUksSUFBSSxFQUFFO29CQUVULE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ2hFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ3RDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQzt3QkFFbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7NEJBQ3JDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDdEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDOUQsTUFBTSxRQUFRLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQzNDLE1BQU0sa0JBQWtCLEdBQUcsa0JBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7NEJBQ3pELElBQUksa0JBQWtCLElBQUksa0JBQWtCLENBQUMsS0FBSyxFQUFFO2dDQUNuRCxTQUFTLEVBQUUsQ0FBQzs2QkFDWjt5QkFDRDt3QkFFRCxJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUU7NEJBRWxCLElBQUksT0FBTyxDQUFDLEtBQUssR0FBRyxTQUFTLElBQUksRUFBRSxFQUFFO2dDQUNwQyxZQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixTQUFTLDRCQUE0QixDQUFDLENBQUM7Z0NBQzVFLE9BQU8sSUFBSSxjQUFJLEVBQUUsQ0FBQzs2QkFDbEI7eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7YUFDRDtZQUVELE1BQU0sS0FBSyxTQUFHLElBQUksQ0FBQyxPQUFPLDBDQUFFLEtBQUssQ0FBQztZQUNsQyxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksaUJBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQ3hGLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7Z0JBQzVDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLGVBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUUvRSxRQUFRLFVBQVUsRUFBRTtnQkFDbkIsS0FBSyxxQkFBVSxDQUFDLFFBQVE7b0JBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7b0JBQ3RDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7Z0JBRWpDLEtBQUsscUJBQVUsQ0FBQyxNQUFNO29CQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7b0JBQ2xELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7Z0JBRWpDLEtBQUsscUJBQVUsQ0FBQyxNQUFNO29CQUVyQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN2RixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2dCQUVoQyxLQUFLLHFCQUFVLENBQUMsUUFBUTtvQkFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztvQkFDM0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyx5QkFBZSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDcEcsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNqQztRQUNGLENBQUM7UUFFTSxhQUFhLENBQUMsUUFBOEI7WUFDbEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7WUFDaEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBRWxFLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBZ0I7WUFDbkMsSUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDL0IsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBRUQsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUNuQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO29CQUN2QyxPQUFPLElBQUksQ0FBQztpQkFDWjtnQkFFRCxJQUFJLGlCQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFFL0QsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUVoRSxJQUFJLHVCQUF1QixDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQ3ZELHVCQUF1QixDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQ3BELHVCQUF1QixDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRTtvQkFDdEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztvQkFFOUMsSUFBSSxDQUFDLGVBQWUsR0FBRyx1QkFBdUIsQ0FBQztvQkFHL0MsTUFBTSxVQUFVLEdBQUcsTUFBTSxlQUFJLENBQUMsT0FBTyxFQUFFLHVCQUF1QixFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFFakcsUUFBUSxVQUFVLEVBQUU7d0JBQ25CLEtBQUsscUJBQVUsQ0FBQyxRQUFROzRCQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOzRCQUN0QyxPQUFPLElBQUksQ0FBQzt3QkFFYixLQUFLLHFCQUFVLENBQUMsTUFBTTs0QkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDOzRCQUN0RSxPQUFPLElBQUksQ0FBQzt3QkFFYixLQUFLLHFCQUFVLENBQUMsTUFBTTs0QkFFckIsT0FBTyxLQUFLLENBQUM7d0JBRWQsS0FBSyxxQkFBVSxDQUFDLFFBQVE7NEJBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7NEJBQzNDLE9BQU8sS0FBSyxDQUFDO3FCQUNkO2lCQUNEO2FBQ0Q7WUFFRCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNwRCxDQUFDO0tBQ0Q7SUE5SkQsK0JBOEpDIn0=