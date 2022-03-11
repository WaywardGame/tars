define(["require", "exports", "game/doodad/Doodad", "game/entity/action/IAction", "game/entity/creature/corpse/Corpse", "game/entity/creature/Creature", "game/entity/IStats", "game/tile/Terrains", "game/tile/TileEvent", "utilities/game/TileHelpers", "utilities/math/Vector2", "utilities/math/Vector3", "../../core/context/IContext", "../../core/objective/IObjective", "../../core/objective/Objective", "../../utilities/Logger", "../../utilities/Movement", "../other/Idle", "../other/item/EquipItem", "../other/item/UseItem", "../other/Rest"], function (require, exports, Doodad_1, IAction_1, Corpse_1, Creature_1, IStats_1, Terrains_1, TileEvent_1, TileHelpers_1, Vector2_1, Vector3_1, IContext_1, IObjective_1, Objective_1, Logger_1, Movement_1, Idle_1, EquipItem_1, UseItem_1, Rest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const zChangeDifficulty = 500;
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
        getIdentifier(context) {
            return `MoveToTarget:(${this.target.x},${this.target.y},${this.target.z}):${this.moveAdjacentToTarget}:${this.options?.disableStaminaCheck ? true : false}:${this.options?.range ?? 0}:${this.options?.reverse ?? false}:${this.options?.changeZ ?? this.target.z}`;
        }
        getStatus(context) {
            let status = `Moving to`;
            if (Doodad_1.default.is(this.target) || Creature_1.default.is(this.target) || TileEvent_1.default.is(this.target) || Corpse_1.default.is(this.target)) {
                status += ` ${this.target.getName()}`;
            }
            status += ` (${this.target.x},${this.target.y},${this.target.z})`;
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
            if (!context.options.allowCaves && position.z !== this.target.z) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            if (context.options.fasterPlanning && context.calculatingDifficulty) {
                if (position.x !== context.human.x || position.y !== context.human.y || position.z !== context.human.z) {
                    context.setData(IContext_1.ContextDataType.Position, new Vector3_1.default(this.target.x, this.target.y, this.options?.changeZ ?? this.target.z));
                    const diff = Vector2_1.default.squaredDistance(position, this.target) + (position.z !== this.target.z ? zChangeDifficulty : 0);
                    return diff;
                }
            }
            if (this.options?.changeZ === position.z) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            if (!this.options?.skipZCheck && position.z !== this.target.z) {
                const origin = context.utilities.navigation.getOrigin();
                const oppositeZOrigin = context.utilities.navigation.getOppositeOrigin();
                if (!origin || !oppositeZOrigin) {
                    return IObjective_1.ObjectiveResult.Impossible;
                }
                switch (this.target.z) {
                    case oppositeZOrigin.z:
                        return [
                            new MoveToTarget({ x: oppositeZOrigin.x, y: oppositeZOrigin.y, z: position.z }, false, { ...this.options, idleIfAlreadyThere: true, changeZ: this.target.z }).passOverriddenDifficulty(this).addDifficulty(zChangeDifficulty),
                            new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options }).passOverriddenDifficulty(this),
                        ];
                    case origin.z:
                        return IObjective_1.ObjectiveResult.Impossible;
                    default:
                        return IObjective_1.ObjectiveResult.Impossible;
                }
            }
            if (this.trackedCreature && !this.trackedCreature.isValid()) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const movementPath = await context.utilities.movement.getMovementPath(context, this.target, this.moveAdjacentToTarget, this.options?.reverse);
            if (context.calculatingDifficulty) {
                if (movementPath.difficulty !== IObjective_1.ObjectiveResult.Impossible) {
                    if (movementPath.path && (this.trackedCorpse || this.trackedItem)) {
                        const decay = this.trackedCorpse?.decay ?? this.trackedItem?.decay;
                        if (decay !== undefined && decay <= movementPath.path?.length) {
                            return IObjective_1.ObjectiveResult.Impossible;
                        }
                    }
                    if (this.target.x === 83 && this.target.y === 311 && this.target.z === 1) {
                    }
                    if (this.options?.reverse) {
                        const origin = context.utilities.navigation.getOrigin();
                        const oppositeZOrigin = context.utilities.navigation.getOppositeOrigin();
                        if (origin && origin.z === this.target.z) {
                            context.setData(IContext_1.ContextDataType.Position, new Vector3_1.default(origin.x, origin.y, this.options?.changeZ ?? origin.z));
                        }
                        else if (oppositeZOrigin) {
                            context.setData(IContext_1.ContextDataType.Position, new Vector3_1.default(oppositeZOrigin.x, oppositeZOrigin.y, this.options?.changeZ ?? oppositeZOrigin.z));
                        }
                    }
                    else {
                        context.setData(IContext_1.ContextDataType.Position, new Vector3_1.default(this.target.x, this.target.y, this.options?.changeZ ?? this.target.z));
                    }
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
                            new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options }),
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
                    this.log.info(`Finished moving to target (${this.target.x},${this.target.y},${this.target.z})`);
                    context.setData(IContext_1.ContextDataType.Position, new Vector3_1.default(this.target));
                    if (movementPath.difficulty === 0 && this.options?.idleIfAlreadyThere && context.human.z !== (this.options?.changeZ ?? this.target.z)) {
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
        onCreatureRemoved(context, creature) {
            return this.trackedCreature === creature;
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
                if (this.options?.equipWeapons) {
                    const handEquipmentChange = context.utilities.item.updateHandEquipment(context);
                    if (handEquipmentChange) {
                        this.log.warn(`Should equip ${handEquipmentChange.item} before attacking`);
                        return new EquipItem_1.default(handEquipmentChange.equipType, handEquipmentChange.item);
                    }
                }
                const trackedCreaturePosition = this.trackedCreature.getPoint();
                if (trackedCreaturePosition.x !== this.trackedPosition.x ||
                    trackedCreaturePosition.y !== this.trackedPosition.y ||
                    trackedCreaturePosition.z !== this.trackedPosition.z) {
                    this.log.info("Moving with tracked creature");
                    this.trackedPosition = trackedCreaturePosition;
                    context.utilities.movement.clearCache();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvVGFyZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9Nb3ZlVG9UYXJnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBNEJBLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDO0lBb0I5QixNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFRbEQsWUFDVyxNQUFnQixFQUNQLG9CQUE2QixFQUM3QixPQUF1QztZQUMxRCxLQUFLLEVBQUUsQ0FBQztZQUhFLFdBQU0sR0FBTixNQUFNLENBQVU7WUFDUCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQVM7WUFDN0IsWUFBTyxHQUFQLE9BQU8sQ0FBZ0M7WUFHMUQsSUFBSSxDQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUU7Z0JBQzlCLElBQUksTUFBTSxZQUFZLGtCQUFRLEVBQUU7b0JBQy9CLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO29CQUM5QixJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztpQkFFekM7cUJBQU0sSUFBSSxNQUFNLFlBQVksZ0JBQU0sRUFBRTtvQkFDcEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7aUJBQzVCO2FBQ0Q7UUFDRixDQUFDO1FBRU0sYUFBYSxDQUFDLE9BQTRCO1lBRWhELE9BQU8saUJBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDclEsQ0FBQztRQUVNLFNBQVMsQ0FBQyxPQUFnQjtZQUNoQyxJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUM7WUFFekIsSUFBSSxnQkFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksa0JBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLG1CQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxnQkFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzlHLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQzthQUN0QztZQUVELE1BQU0sSUFBSSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFFbEUsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEIsQ0FBQztRQUVlLFNBQVM7WUFDeEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLFFBQVEsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hFLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFRRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtnQkFDcEUsSUFBSSxRQUFRLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDdkcsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3SCxNQUFNLElBQUksR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQU1ySCxPQUFPLElBQUksQ0FBQztpQkFDWjthQVFEO1lBUUQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sS0FBSyxRQUFRLENBQUMsQ0FBQyxFQUFFO2dCQUV6QyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxJQUFJLFFBQVEsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7Z0JBQzlELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUN4RCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUN6RSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFO29CQUNoQyxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2lCQUNsQztnQkFFRCxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO29CQUN0QixLQUFLLGVBQWUsQ0FBQyxDQUFDO3dCQU1yQixPQUFPOzRCQUVOLElBQUksWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDOzRCQUc3TixJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBd0IsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQzt5QkFDbEksQ0FBQztvQkFFSCxLQUFLLE1BQU0sQ0FBQyxDQUFDO3dCQUNaLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7b0JBbUJuQzt3QkFNQyxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2lCQUNuQzthQUNEO1lBRUQsSUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDNUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRTlJLElBQUksT0FBTyxDQUFDLHFCQUFxQixFQUFFO2dCQUNsQyxJQUFJLFlBQVksQ0FBQyxVQUFVLEtBQUssNEJBQWUsQ0FBQyxVQUFVLEVBQUU7b0JBQzNELElBQUksWUFBWSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFO3dCQUNsRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQzt3QkFDbkUsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTs0QkFFOUQsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzt5QkFDbEM7cUJBQ0Q7b0JBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtxQkFFekU7b0JBTUQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRTt3QkFDMUIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7d0JBQ3hELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUM7d0JBQ3pFLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7NEJBRXpDLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFFOUc7NkJBQU0sSUFBSSxlQUFlLEVBQUU7NEJBRTNCLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDekk7cUJBRUQ7eUJBQU07d0JBQ04sT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUM3SDtpQkFDRDtnQkFFRCxPQUFPLFlBQVksQ0FBQyxVQUFVLENBQUM7YUFDL0I7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzlFLE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQy9CLElBQUksSUFBSSxFQUFFO29CQUVULE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQy9ELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ3RDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQzt3QkFFbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7NEJBQ3JDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDdEIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZFLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUMzQyxNQUFNLGtCQUFrQixHQUFHLGtCQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDOzRCQUN6RCxJQUFJLGtCQUFrQixJQUFJLGtCQUFrQixDQUFDLEtBQUssRUFBRTtnQ0FDbkQsU0FBUyxFQUFFLENBQUM7NkJBQ1o7eUJBQ0Q7d0JBRUQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFOzRCQUVsQixJQUFJLE9BQU8sQ0FBQyxLQUFLLEdBQUcsU0FBUyxJQUFJLEVBQUUsRUFBRTtnQ0FDcEMsWUFBRyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsU0FBUyw0QkFBNEIsQ0FBQyxDQUFDO2dDQUU1RSxPQUFPO29DQUNOLElBQUksY0FBSSxFQUFFO29DQUNWLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxDQUFDO2lDQUN4RyxDQUFDOzZCQUNGO3lCQUNEO3FCQUNEO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRTtnQkFDakcsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDckMsTUFBTSxRQUFRLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sa0JBQWtCLEdBQUcsa0JBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3pELElBQUksa0JBQWtCLElBQUksa0JBQWtCLENBQUMsS0FBSyxFQUFFO29CQUNuRCxPQUFPO3dCQUNOLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQzt3QkFDMUQsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDO3FCQUMvRixDQUFDO2lCQUNGO2dCQUVELE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQy9CLElBQUksSUFBSSxFQUFFO29CQUNULElBQUksY0FBb0MsQ0FBQztvQkFFekMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUN6QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3RCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN2RSxNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDM0MsTUFBTSxrQkFBa0IsR0FBRyxrQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDekQsSUFBSSxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxLQUFLLEVBQUU7NEJBQ25ELGNBQWMsR0FBRyxLQUFLLENBQUM7NEJBQ3ZCLE1BQU07eUJBQ047cUJBQ0Q7b0JBRUQsSUFBSSxjQUFjLEVBQUU7d0JBQ25CLE9BQU87NEJBQ04sSUFBSSxZQUFZLENBQUMsRUFBRSxHQUFHLGNBQWMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUM7NEJBQ2hFLElBQUksaUJBQU8sQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQzs0QkFDMUQsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzt5QkFDN0UsQ0FBQztxQkFDRjtpQkFDRDthQUNEO1lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUM7WUFDbEMsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLGlCQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFO2dCQUN2RixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFMUcsUUFBUSxVQUFVLEVBQUU7Z0JBQ25CLEtBQUsscUJBQVUsQ0FBQyxRQUFRO29CQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO29CQUN0QyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUVqQyxLQUFLLHFCQUFVLENBQUMsTUFBTTtvQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO29CQUVsRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUVqQyxLQUFLLHFCQUFVLENBQUMsTUFBTTtvQkFFckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDdkYsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztnQkFFaEMsS0FBSyxxQkFBVSxDQUFDLFFBQVE7b0JBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDhCQUE4QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2hHLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUVwRSxJQUFJLFlBQVksQ0FBQyxVQUFVLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUN0SSxPQUFPLElBQUksY0FBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3FCQUN2QjtvQkFFRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2pDO1FBQ0YsQ0FBQztRQUtNLFNBQVMsQ0FBQyxJQUFzQjtZQUN0QyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUV4QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxhQUFhLENBQUMsT0FBZ0IsRUFBRSxJQUFVO1lBQ2hELE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUM7UUFDbEMsQ0FBQztRQUVNLGlCQUFpQixDQUFDLE9BQWdCLEVBQUUsUUFBa0I7WUFDNUQsT0FBTyxJQUFJLENBQUMsZUFBZSxLQUFLLFFBQVEsQ0FBQztRQUMxQyxDQUFDO1FBRU0sZUFBZSxDQUFDLE9BQWdCLEVBQUUsTUFBYztZQUN0RCxPQUFPLElBQUksQ0FBQyxhQUFhLEtBQUssTUFBTSxDQUFDO1FBQ3RDLENBQUM7UUFLZSxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQWdCO1lBQzVDLElBQUksSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQy9CLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztvQkFDdkMsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBRUQsSUFBSSxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBRTlELE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUU7b0JBQy9CLE1BQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ2hGLElBQUksbUJBQW1CLEVBQUU7d0JBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixtQkFBbUIsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLENBQUM7d0JBRTNFLE9BQU8sSUFBSSxtQkFBUyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFLOUU7aUJBQ0Q7Z0JBRUQsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUVoRSxJQUFJLHVCQUF1QixDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQ3ZELHVCQUF1QixDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQ3BELHVCQUF1QixDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRTtvQkFDdEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztvQkFFOUMsSUFBSSxDQUFDLGVBQWUsR0FBRyx1QkFBdUIsQ0FBQztvQkFHL0MsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBR3hDLE1BQU0sVUFBVSxHQUFHLE1BQU0sT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUVsSSxRQUFRLFVBQVUsRUFBRTt3QkFDbkIsS0FBSyxxQkFBVSxDQUFDLFFBQVE7NEJBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7NEJBQ3RDLE9BQU8sSUFBSSxDQUFDO3dCQUViLEtBQUsscUJBQVUsQ0FBQyxNQUFNOzRCQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7NEJBQ3RFLE9BQU8sSUFBSSxDQUFDO3dCQUViLEtBQUsscUJBQVUsQ0FBQyxNQUFNOzRCQUVyQixPQUFPLEtBQUssQ0FBQzt3QkFFZCxLQUFLLHFCQUFVLENBQUMsUUFBUTs0QkFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQzs0QkFDM0MsT0FBTyxLQUFLLENBQUM7cUJBQ2Q7aUJBQ0Q7YUFDRDtZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFO2dCQUNqRyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNyQyxNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDM0MsTUFBTSxrQkFBa0IsR0FBRyxrQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDekQsSUFBSSxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxLQUFLLEVBQUU7b0JBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7b0JBQy9DLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2FBQ0Q7WUFFRCxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNwRCxDQUFDO0tBQ0Q7SUEzWUQsK0JBMllDIn0=