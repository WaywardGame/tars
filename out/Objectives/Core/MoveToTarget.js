define(["require", "exports", "game/doodad/Doodad", "game/entity/action/IAction", "game/entity/creature/corpse/Corpse", "game/entity/creature/Creature", "game/entity/IStats", "game/tile/Terrains", "game/tile/TileEvent", "utilities/game/TileHelpers", "utilities/math/Vector2", "../../core/context/IContext", "../../core/objective/IObjective", "../../core/objective/Objective", "../../utilities/Logger", "../../utilities/Movement", "../other/Idle", "../other/item/UseItem", "../other/Rest"], function (require, exports, Doodad_1, IAction_1, Corpse_1, Creature_1, IStats_1, Terrains_1, TileEvent_1, TileHelpers_1, Vector2_1, IContext_1, IObjective_1, Objective_1, Logger_1, Movement_1, Idle_1, UseItem_1, Rest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToTarget extends Objective_1.default {
        constructor(target, moveAdjacentToTarget, options) {
            super();
            this.target = target;
            this.moveAdjacentToTarget = moveAdjacentToTarget;
            this.options = options;
            if (!options?.disableTracking) {
                if (target instanceof Creature_1.default) {
                    this.trackedCreature = target;
                    this.trackedPosition = target.getPoint();
                }
                else if (target instanceof Corpse_1.default) {
                    this.trackedCorpse = target;
                }
            }
        }
        getIdentifier() {
            return `MoveToTarget:(${this.target.x},${this.target.y},${this.target.z}):${this.moveAdjacentToTarget}:${this.options?.disableStaminaCheck ? true : false}:${this.options?.range ?? 0}`;
        }
        getStatus() {
            let status = `Moving to `;
            if (Doodad_1.default.is(this.target) || Creature_1.default.is(this.target) || TileEvent_1.default.is(this.target) || Corpse_1.default.is(this.target)) {
                status += `${this.target.getName()} `;
            }
            status += `(${this.target.x},${this.target.y},${this.target.z})`;
            return status;
        }
        getPosition() {
            return this.target;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            const position = context.getPosition();
            if (!this.options?.skipZCheck && position.z !== this.target.z) {
                const oppositeZOrigin = context.utilities.navigation.getOppositeOrigin();
                if (!oppositeZOrigin || oppositeZOrigin.z !== this.target.z) {
                    return IObjective_1.ObjectiveResult.Impossible;
                }
                return [
                    new MoveToTarget({ x: oppositeZOrigin.x, y: oppositeZOrigin.y, z: position.z }, false, { ...this.options, idleIfAlreadyThere: true, changeZ: this.target.z }),
                    new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options }),
                ];
            }
            const movementPath = await context.utilities.movement.getMovementPath(context, this.target, this.moveAdjacentToTarget);
            if (context.calculatingDifficulty) {
                if (movementPath.difficulty !== IObjective_1.ObjectiveResult.Impossible) {
                    if (movementPath.path && (this.trackedCorpse || this.trackedItem)) {
                        const decay = this.trackedCorpse?.decay ?? this.trackedItem?.decay;
                        if (decay !== undefined && decay <= movementPath.path?.length) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                    }
                    context.setData(IContext_1.ContextDataType.Position, { x: this.target.x, y: this.target.y, z: this.options?.changeZ ?? this.target.z });
                }
                return movementPath.difficulty;
            }
            if (!this.options?.disableStaminaCheck && !context.human.vehicleItemReference) {
                const path = movementPath.path;
                if (path) {
                    const stamina = context.human.stat.get(IStats_1.Stat.Stamina);
                    if ((stamina.max - stamina.value) > 2) {
                        let swimTiles = 0;
                        for (let i = 4; i < path.length; i++) {
                            const point = path[i];
                            const tile = context.island.getTile(point.x, point.y, context.human.z);
                            const tileType = TileHelpers_1.default.getType(tile);
                            const terrainDescription = Terrains_1.default[tileType];
                            if (terrainDescription && terrainDescription.water) {
                                swimTiles++;
                            }
                        }
                        if (swimTiles > 0) {
                            if (stamina.value - swimTiles <= 10) {
                                Logger_1.log.info(`Going to be swimming for ${swimTiles} tiles soon. Resting first`);
                                return [
                                    new Rest_1.default(),
                                    new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options, disableStaminaCheck: true }),
                                ];
                            }
                        }
                    }
                }
            }
            if (this.options?.allowBoat && context.inventory.sailBoat && !context.human.vehicleItemReference) {
                const tile = context.human.getTile();
                const tileType = TileHelpers_1.default.getType(tile);
                const terrainDescription = Terrains_1.default[tileType];
                if (terrainDescription && terrainDescription.water) {
                    return [
                        new UseItem_1.default(IAction_1.ActionType.Paddle, context.inventory.sailBoat),
                        new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options, allowBoat: false }),
                    ];
                }
                const path = movementPath.path;
                if (path) {
                    let firstWaterTile;
                    for (let i = 0; i < path.length - 1; i++) {
                        const point = path[i];
                        const tile = context.island.getTile(point.x, point.y, context.human.z);
                        const tileType = TileHelpers_1.default.getType(tile);
                        const terrainDescription = Terrains_1.default[tileType];
                        if (terrainDescription && terrainDescription.water) {
                            firstWaterTile = point;
                            break;
                        }
                    }
                    if (firstWaterTile) {
                        return [
                            new MoveToTarget({ ...firstWaterTile, z: this.target.z }, false),
                            new UseItem_1.default(IAction_1.ActionType.Paddle, context.inventory.sailBoat),
                            new MoveToTarget(this.target, this.moveAdjacentToTarget, this.options),
                        ];
                    }
                }
            }
            const range = this.options?.range;
            if (range !== undefined && Vector2_1.default.isDistanceWithin(context.human, this.target, range)) {
                this.log.info("Within range of the target");
                return IObjective_1.ObjectiveResult.Complete;
            }
            const moveResult = await context.utilities.movement.move(context, this.target, this.moveAdjacentToTarget);
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
                    context.setData(IContext_1.ContextDataType.Position, { x: this.target.x, y: this.target.y, z: this.target.z });
                    if (this.options?.idleIfAlreadyThere && movementPath.difficulty === 0) {
                        return new Idle_1.default(false);
                    }
                    return IObjective_1.ObjectiveResult.Complete;
            }
        }
        trackItem(item) {
            this.trackedItem = item;
            return this;
        }
        onItemRemoved(context, item) {
            return this.trackedItem === item;
        }
        onCorpseRemoved(context, corpse) {
            return this.trackedCorpse === corpse;
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
                if (Vector2_1.default.distance(context.human, this.trackedCreature) > 5) {
                    return false;
                }
                const trackedCreaturePosition = this.trackedCreature.getPoint();
                if (trackedCreaturePosition.x !== this.trackedPosition.x ||
                    trackedCreaturePosition.y !== this.trackedPosition.y ||
                    trackedCreaturePosition.z !== this.trackedPosition.z) {
                    this.log.info("Moving with tracked creature");
                    this.trackedPosition = trackedCreaturePosition;
                    const moveResult = await context.utilities.movement.move(context, trackedCreaturePosition, this.moveAdjacentToTarget, true, true);
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
            if (this.options?.allowBoat && context.inventory.sailBoat && !context.human.vehicleItemReference) {
                const tile = context.human.getTile();
                const tileType = TileHelpers_1.default.getType(tile);
                const terrainDescription = Terrains_1.default[tileType];
                if (terrainDescription && terrainDescription.water) {
                    this.log.warn("Interrupting to use sail boat");
                    return true;
                }
            }
            return super.onMove(context, this.trackedCreature);
        }
    }
    exports.default = MoveToTarget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvVGFyZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9Nb3ZlVG9UYXJnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBb0NBLE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQVFsRCxZQUNXLE1BQWdCLEVBQ1Asb0JBQTZCLEVBQzdCLE9BQXVDO1lBQzFELEtBQUssRUFBRSxDQUFDO1lBSEUsV0FBTSxHQUFOLE1BQU0sQ0FBVTtZQUNQLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBUztZQUM3QixZQUFPLEdBQVAsT0FBTyxDQUFnQztZQUcxRCxJQUFJLENBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRTtnQkFDOUIsSUFBSSxNQUFNLFlBQVksa0JBQVEsRUFBRTtvQkFDL0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7b0JBQzlCLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUV6QztxQkFBTSxJQUFJLE1BQU0sWUFBWSxnQkFBTSxFQUFFO29CQUNwQyxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztpQkFDNUI7YUFDRDtRQUNGLENBQUM7UUFFTSxhQUFhO1lBRW5CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUN6TCxDQUFDO1FBRU0sU0FBUztZQUNmLElBQUksTUFBTSxHQUFHLFlBQVksQ0FBQztZQUUxQixJQUFJLGdCQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxrQkFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksbUJBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLGdCQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDOUcsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO2FBQ3RDO1lBRUQsTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztZQUVqRSxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQixDQUFDO1FBRWUsU0FBUztZQUN4QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUV2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLElBQUksUUFBUSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtnQkFDOUQsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDekUsSUFBSSxDQUFDLGVBQWUsSUFBSSxlQUFlLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO29CQUM1RCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2lCQUNsQztnQkFFRCxPQUFPO29CQUlOLElBQUksWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUc3SixJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBd0IsQ0FBQztpQkFDbkcsQ0FBQzthQUNGO1lBRUQsTUFBTSxZQUFZLEdBQUcsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFdkgsSUFBSSxPQUFPLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2xDLElBQUksWUFBWSxDQUFDLFVBQVUsS0FBSyw0QkFBZSxDQUFDLFVBQVUsRUFBRTtvQkFDM0QsSUFBSSxZQUFZLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUU7d0JBQ2xFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDO3dCQUNuRSxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFOzRCQUU5RCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO3lCQUNsQztxQkFDRDtvQkFFRCxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUM3SDtnQkFFRCxPQUFPLFlBQVksQ0FBQyxVQUFVLENBQUM7YUFDL0I7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzlFLE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQy9CLElBQUksSUFBSSxFQUFFO29CQUVULE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQy9ELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ3RDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQzt3QkFFbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7NEJBQ3JDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDdEIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZFLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUMzQyxNQUFNLGtCQUFrQixHQUFHLGtCQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDOzRCQUN6RCxJQUFJLGtCQUFrQixJQUFJLGtCQUFrQixDQUFDLEtBQUssRUFBRTtnQ0FDbkQsU0FBUyxFQUFFLENBQUM7NkJBQ1o7eUJBQ0Q7d0JBRUQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFOzRCQUVsQixJQUFJLE9BQU8sQ0FBQyxLQUFLLEdBQUcsU0FBUyxJQUFJLEVBQUUsRUFBRTtnQ0FDcEMsWUFBRyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsU0FBUyw0QkFBNEIsQ0FBQyxDQUFDO2dDQUU1RSxPQUFPO29DQUNOLElBQUksY0FBSSxFQUFFO29DQUNWLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxDQUFDO2lDQUN4RyxDQUFDOzZCQUNGO3lCQUNEO3FCQUNEO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRTtnQkFDakcsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDckMsTUFBTSxRQUFRLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sa0JBQWtCLEdBQUcsa0JBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3pELElBQUksa0JBQWtCLElBQUksa0JBQWtCLENBQUMsS0FBSyxFQUFFO29CQUNuRCxPQUFPO3dCQUNOLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQzt3QkFDMUQsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDO3FCQUMvRixDQUFDO2lCQUNGO2dCQUVELE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQy9CLElBQUksSUFBSSxFQUFFO29CQUNULElBQUksY0FBb0MsQ0FBQztvQkFFekMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUN6QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3RCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN2RSxNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDM0MsTUFBTSxrQkFBa0IsR0FBRyxrQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDekQsSUFBSSxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxLQUFLLEVBQUU7NEJBQ25ELGNBQWMsR0FBRyxLQUFLLENBQUM7NEJBQ3ZCLE1BQU07eUJBQ047cUJBQ0Q7b0JBRUQsSUFBSSxjQUFjLEVBQUU7d0JBQ25CLE9BQU87NEJBQ04sSUFBSSxZQUFZLENBQUMsRUFBRSxHQUFHLGNBQWMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUM7NEJBQ2hFLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQzs0QkFDMUQsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQzt5QkFDdEUsQ0FBQztxQkFDRjtpQkFDRDthQUNEO1lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUM7WUFDbEMsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLGlCQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFO2dCQUN2RixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFMUcsUUFBUSxVQUFVLEVBQUU7Z0JBQ25CLEtBQUsscUJBQVUsQ0FBQyxRQUFRO29CQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO29CQUN0QyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUVqQyxLQUFLLHFCQUFVLENBQUMsTUFBTTtvQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO29CQUVsRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUVqQyxLQUFLLHFCQUFVLENBQUMsTUFBTTtvQkFFckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDdkYsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztnQkFFaEMsS0FBSyxxQkFBVSxDQUFDLFFBQVE7b0JBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7b0JBQzNDLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBRXBHLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxZQUFZLENBQUMsVUFBVSxLQUFLLENBQUMsRUFBRTt3QkFDdEUsT0FBTyxJQUFJLGNBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDdkI7b0JBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNqQztRQUNGLENBQUM7UUFLTSxTQUFTLENBQUMsSUFBc0I7WUFDdEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFFeEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sYUFBYSxDQUFDLE9BQWdCLEVBQUUsSUFBVTtZQUNoRCxPQUFPLElBQUksQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDO1FBQ2xDLENBQUM7UUFFTSxlQUFlLENBQUMsT0FBZ0IsRUFBRSxNQUFjO1lBQ3RELE9BQU8sSUFBSSxDQUFDLGFBQWEsS0FBSyxNQUFNLENBQUM7UUFDdEMsQ0FBQztRQUtlLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBZ0I7WUFDNUMsSUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDL0IsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBRUQsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUNuQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO29CQUN2QyxPQUFPLElBQUksQ0FBQztpQkFDWjtnQkFFRCxJQUFJLGlCQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFFOUQsT0FBTyxLQUFLLENBQUM7aUJBQ2I7Z0JBRUQsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUVoRSxJQUFJLHVCQUF1QixDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQ3ZELHVCQUF1QixDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQ3BELHVCQUF1QixDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRTtvQkFDdEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztvQkFFOUMsSUFBSSxDQUFDLGVBQWUsR0FBRyx1QkFBdUIsQ0FBQztvQkFHL0MsTUFBTSxVQUFVLEdBQUcsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHVCQUF1QixFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBRWxJLFFBQVEsVUFBVSxFQUFFO3dCQUNuQixLQUFLLHFCQUFVLENBQUMsUUFBUTs0QkFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs0QkFDdEMsT0FBTyxJQUFJLENBQUM7d0JBRWIsS0FBSyxxQkFBVSxDQUFDLE1BQU07NEJBQ3JCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQzs0QkFDdEUsT0FBTyxJQUFJLENBQUM7d0JBRWIsS0FBSyxxQkFBVSxDQUFDLE1BQU07NEJBRXJCLE9BQU8sS0FBSyxDQUFDO3dCQUVkLEtBQUsscUJBQVUsQ0FBQyxRQUFROzRCQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDOzRCQUMzQyxPQUFPLEtBQUssQ0FBQztxQkFDZDtpQkFDRDthQUNEO1lBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUU7Z0JBQ2pHLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3JDLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLGtCQUFrQixHQUFHLGtCQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLGtCQUFrQixJQUFJLGtCQUFrQixDQUFDLEtBQUssRUFBRTtvQkFDbkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQztvQkFDL0MsT0FBTyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtZQUVELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3BELENBQUM7S0FDRDtJQWpSRCwrQkFpUkMifQ==