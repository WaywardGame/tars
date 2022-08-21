define(["require", "exports", "game/doodad/Doodad", "game/entity/creature/corpse/Corpse", "game/entity/creature/Creature", "game/entity/IStats", "game/tile/Terrains", "game/tile/TileEvent", "utilities/game/TileHelpers", "utilities/math/Vector2", "utilities/math/Vector3", "game/entity/action/actions/Paddle", "../../core/context/IContext", "../../core/objective/IObjective", "../../core/objective/Objective", "../../utilities/Movement", "../other/Idle", "../other/item/EquipItem", "../other/item/UseItem", "../other/Rest", "./AddDifficulty"], function (require, exports, Doodad_1, Corpse_1, Creature_1, IStats_1, Terrains_1, TileEvent_1, TileHelpers_1, Vector2_1, Vector3_1, Paddle_1, IContext_1, IObjective_1, Objective_1, Movement_1, Idle_1, EquipItem_1, UseItem_1, Rest_1, AddDifficulty_1) {
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
            if (context.calculatingDifficulty) {
                if (position.x !== context.human.x || position.y !== context.human.y || position.z !== context.human.z) {
                    context.setData(IContext_1.ContextDataType.Position, new Vector3_1.default(this.target.x, this.target.y, this.options?.changeZ ?? this.target.z));
                    const diff = Math.ceil(Vector2_1.default.distance(position, this.target) + (position.z !== this.target.z ? zChangeDifficulty : 0));
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
                                context.log.info(`Going to be swimming for ${swimTiles} tiles soon. Resting first`);
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
                        new UseItem_1.default(Paddle_1.default, context.inventory.sailBoat),
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
                            new UseItem_1.default(Paddle_1.default, context.inventory.sailBoat),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvVGFyZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9Nb3ZlVG9UYXJnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBNkJBLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDO0lBb0I5QixNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFVbEQsWUFDVyxNQUFnQixFQUNQLG9CQUE2QixFQUM3QixPQUF1QztZQUMxRCxLQUFLLEVBQUUsQ0FBQztZQUhFLFdBQU0sR0FBTixNQUFNLENBQVU7WUFDUCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQVM7WUFDN0IsWUFBTyxHQUFQLE9BQU8sQ0FBZ0M7WUFMeEMsOEJBQXlCLEdBQUcsSUFBSSxDQUFDO1lBUW5ELElBQUksQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFO2dCQUM5QixJQUFJLE1BQU0sWUFBWSxrQkFBUSxFQUFFO29CQUMvQixJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQztvQkFDOUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBRXpDO3FCQUFNLElBQUksTUFBTSxZQUFZLGdCQUFNLEVBQUU7b0JBQ3BDLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO2lCQUM1QjthQUNEO1FBQ0YsQ0FBQztRQUVNLGFBQWEsQ0FBQyxPQUE0QjtZQUVoRCxPQUFPLGlCQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsb0JBQW9CLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FB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