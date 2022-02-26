define(["require", "exports", "game/doodad/Doodad", "game/entity/action/IAction", "game/entity/creature/corpse/Corpse", "game/entity/creature/Creature", "game/entity/IStats", "game/tile/Terrains", "game/tile/TileEvent", "utilities/game/TileHelpers", "utilities/math/Vector2", "utilities/math/Vector3", "../../core/context/IContext", "../../core/objective/IObjective", "../../core/objective/Objective", "../../utilities/Logger", "../../utilities/Movement", "../other/Idle", "../other/item/UseItem", "../other/Rest"], function (require, exports, Doodad_1, IAction_1, Corpse_1, Creature_1, IStats_1, Terrains_1, TileEvent_1, TileHelpers_1, Vector2_1, Vector3_1, IContext_1, IObjective_1, Objective_1, Logger_1, Movement_1, Idle_1, UseItem_1, Rest_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvVGFyZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9Nb3ZlVG9UYXJnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBMkJBLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDO0lBZTlCLE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQVFsRCxZQUNXLE1BQWdCLEVBQ1Asb0JBQTZCLEVBQzdCLE9BQXVDO1lBQzFELEtBQUssRUFBRSxDQUFDO1lBSEUsV0FBTSxHQUFOLE1BQU0sQ0FBVTtZQUNQLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBUztZQUM3QixZQUFPLEdBQVAsT0FBTyxDQUFnQztZQUcxRCxJQUFJLENBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRTtnQkFDOUIsSUFBSSxNQUFNLFlBQVksa0JBQVEsRUFBRTtvQkFDL0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7b0JBQzlCLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUV6QztxQkFBTSxJQUFJLE1BQU0sWUFBWSxnQkFBTSxFQUFFO29CQUNwQyxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztpQkFDNUI7YUFDRDtRQUNGLENBQUM7UUFFTSxhQUFhLENBQUMsT0FBNEI7WUFFaEQsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLG9CQUFvQixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sSUFBSSxLQUFLLElB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