define(["require", "exports", "game/doodad/Doodad", "game/entity/action/actions/Ride", "game/entity/creature/corpse/Corpse", "game/entity/creature/Creature", "game/entity/IStats", "game/tile/Terrains", "game/tile/TileEvent", "utilities/game/TileHelpers", "utilities/math/Vector2", "utilities/math/Vector3", "../../core/context/IContext", "../../core/objective/IObjective", "../../core/objective/Objective", "../../utilities/Movement", "../other/Idle", "../other/item/EquipItem", "../other/item/UseItem", "../other/Rest", "./AddDifficulty"], function (require, exports, Doodad_1, Ride_1, Corpse_1, Creature_1, IStats_1, Terrains_1, TileEvent_1, TileHelpers_1, Vector2_1, Vector3_1, IContext_1, IObjective_1, Objective_1, Movement_1, Idle_1, EquipItem_1, UseItem_1, Rest_1, AddDifficulty_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const zChangeDifficulty = 500;
    class MoveToTarget extends Objective_1.default {
        constructor(target, moveAdjacentToTarget, options) {
            super();
            this.target = target;
            this.moveAdjacentToTarget = moveAdjacentToTarget;
            this.options = options;
            this.includePositionInHashCode = true;
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
            if (this.options?.skipIfAlreadyThere && this.target.x === position.x && this.target.y === position.y && this.target.z === position.z) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const endPositions = context.utilities.movement.getMovementEndPositions(context, this.target, this.moveAdjacentToTarget);
            if (endPositions.length === 0) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const defaultEndPosition = endPositions[0];
            if (context.calculatingDifficulty) {
                if (position.x !== context.human.x || position.y !== context.human.y || position.z !== context.human.z) {
                    context.setData(IContext_1.ContextDataType.Position, new Vector3_1.default(defaultEndPosition.x, defaultEndPosition.y, this.options?.changeZ ?? defaultEndPosition.z));
                    const diff = Math.ceil(Vector2_1.default.distance(position, defaultEndPosition) + (position.z !== defaultEndPosition.z ? zChangeDifficulty : 0));
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
                            new AddDifficulty_1.default(zChangeDifficulty),
                            new MoveToTarget({ x: oppositeZOrigin.x, y: oppositeZOrigin.y, z: position.z }, false, { ...this.options, idleIfAlreadyThere: true, changeZ: this.target.z }).passOverriddenDifficulty(this),
                            new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options, skipZCheck: true }).passOverriddenDifficulty(this),
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
            const path = (movementPath !== IObjective_1.ObjectiveResult.Complete && movementPath !== IObjective_1.ObjectiveResult.Impossible) ? movementPath.path : undefined;
            if (context.calculatingDifficulty) {
                if (movementPath === IObjective_1.ObjectiveResult.Impossible) {
                    return movementPath;
                }
                if (movementPath === IObjective_1.ObjectiveResult.Complete) {
                    return movementPath;
                }
                if (this.trackedCorpse || this.trackedItem) {
                    const decay = this.trackedCorpse?.decay ?? this.trackedItem?.decay;
                    if (decay !== undefined && decay <= movementPath.path.length) {
                        return IObjective_1.ObjectiveResult.Impossible;
                    }
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
                    const realEndPosition = movementPath.path[movementPath.path.length - 1];
                    context.setData(IContext_1.ContextDataType.Position, new Vector3_1.default(realEndPosition.x, realEndPosition.y, this.options?.changeZ ?? realEndPosition.z));
                }
                return movementPath.score;
            }
            if (!this.options?.disableStaminaCheck && !context.human.vehicleItemReference && path) {
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
                            context.log.info(`Going to be swimming for ${swimTiles} tiles soon. Resting first`);
                            return [
                                new Rest_1.default(),
                                new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options, disableStaminaCheck: true }),
                            ];
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
                        new UseItem_1.default(Ride_1.default, context.inventory.sailBoat),
                        new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options, allowBoat: false }),
                    ];
                }
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
                            new UseItem_1.default(Ride_1.default, context.inventory.sailBoat),
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
                    context.setData(IContext_1.ContextDataType.Position, new Vector3_1.default(context.human.getPoint()));
                    if (movementPath === IObjective_1.ObjectiveResult.Complete && this.options?.idleIfAlreadyThere && context.human.z !== (this.options?.changeZ ?? this.target.z)) {
                        return new Idle_1.default({ force: true, canMoveToIdle: false });
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
                if (this.options?.equipWeapons && !context.options.lockEquipment) {
                    const handEquipmentChange = context.utilities.item.updateHandEquipment(context);
                    if (handEquipmentChange) {
                        this.log.info(`Should equip ${handEquipmentChange.item} before attacking`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvVGFyZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9Nb3ZlVG9UYXJnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBNkJBLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDO0lBcUI5QixNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFVbEQsWUFDVyxNQUFnQixFQUNQLG9CQUE2QixFQUM3QixPQUF1QztZQUMxRCxLQUFLLEVBQUUsQ0FBQztZQUhFLFdBQU0sR0FBTixNQUFNLENBQVU7WUFDUCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQVM7WUFDN0IsWUFBTyxHQUFQLE9BQU8sQ0FBZ0M7WUFMbEMsOEJBQXlCLEdBQVksSUFBSSxDQUFDO1lBUWxFLElBQUksQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFO2dCQUM5QixJQUFJLE1BQU0sWUFBWSxrQkFBUSxFQUFFO29CQUMvQixJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQztvQkFDOUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBRXpDO3FCQUFNLElBQUksTUFBTSxZQUFZLGdCQUFNLEVBQUU7b0JBQ3BDLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO2lCQUM1QjthQUNEO1FBQ0YsQ0FBQztRQUVNLGFBQWEsQ0FBQyxPQUE0QjtZQUVoRCxPQUFPLGlCQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsb0JBQW9CLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FB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