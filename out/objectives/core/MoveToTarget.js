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
define(["require", "exports", "@wayward/game/game/entity/action/actions/Ride", "@wayward/game/game/entity/creature/corpse/Corpse", "@wayward/game/game/entity/creature/Creature", "@wayward/game/game/entity/IStats", "@wayward/game/game/tile/Tile", "@wayward/game/utilities/math/Vector2", "../../core/context/IContext", "../../core/objective/IObjective", "../../core/objective/Objective", "../../utilities/MovementUtilities", "../other/Idle", "../other/item/EquipItem", "../other/item/UseItem", "../other/Rest", "./AddDifficulty"], function (require, exports, Ride_1, Corpse_1, Creature_1, IStats_1, Tile_1, Vector2_1, IContext_1, IObjective_1, Objective_1, MovementUtilities_1, Idle_1, EquipItem_1, UseItem_1, Rest_1, AddDifficulty_1) {
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
                    this.trackedPosition = target.point;
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
            let status = `Moving to ${this.target.getName()}`;
            if (!Tile_1.default.is(this.target)) {
                status += ` (${this.target.x},${this.target.y},${this.target.z})`;
            }
            return status;
        }
        getPosition() {
            return this.target;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            const tile = context.getTile();
            if (!context.options.allowCaves && tile.z !== this.target.z) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const endPositions = context.utilities.movement.getMovementEndPositions(context, this.target, this.moveAdjacentToTarget);
            if (endPositions.length === 0) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const defaultEndPosition = endPositions[0];
            if (context.calculatingDifficulty) {
                if (tile.x !== context.human.x || tile.y !== context.human.y || tile.z !== context.human.z) {
                    context.setData(IContext_1.ContextDataType.Tile, context.island.getTile(defaultEndPosition.x, defaultEndPosition.y, this.options?.changeZ ?? defaultEndPosition.z));
                    const diff = Math.ceil(Vector2_1.default.distance(tile, defaultEndPosition) + (tile.z !== defaultEndPosition.z ? zChangeDifficulty : 0));
                    return diff;
                }
            }
            if (this.options?.changeZ === tile.z) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            if (!this.options?.skipZCheck && tile.z !== this.target.z) {
                const origin = context.utilities.navigation.getOrigin();
                const oppositeZOrigin = context.utilities.navigation.getOppositeOrigin();
                if (!origin || !oppositeZOrigin) {
                    return IObjective_1.ObjectiveResult.Impossible;
                }
                switch (this.target.z) {
                    case oppositeZOrigin.z:
                        return [
                            new AddDifficulty_1.default(zChangeDifficulty),
                            new MoveToTarget(context.island.getTile(oppositeZOrigin.x, oppositeZOrigin.y, tile.z), false, { ...this.options, idleIfAlreadyThere: true, changeZ: this.target.z }).passOverriddenDifficulty(this),
                            new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options, skipZCheck: true }).passOverriddenDifficulty(this),
                        ];
                    case origin.z:
                        return IObjective_1.ObjectiveResult.Impossible;
                    default:
                        return IObjective_1.ObjectiveResult.Impossible;
                }
            }
            if (this.trackedCreature && !this.trackedCreature.isValid) {
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
                    const decay = this.trackedCorpse?.decay ?? this.trackedItem?.getDecayTime();
                    if (decay !== undefined && decay <= movementPath.path.length) {
                        return IObjective_1.ObjectiveResult.Impossible;
                    }
                }
                if (this.options?.reverse) {
                    const origin = context.utilities.navigation.getOrigin();
                    const oppositeZOrigin = context.utilities.navigation.getOppositeOrigin();
                    if (origin && origin.z === this.target.z) {
                        context.setData(IContext_1.ContextDataType.Tile, context.island.getTile(origin.x, origin.y, this.options?.changeZ ?? origin.z));
                    }
                    else if (oppositeZOrigin) {
                        context.setData(IContext_1.ContextDataType.Tile, context.island.getTile(oppositeZOrigin.x, oppositeZOrigin.y, this.options?.changeZ ?? oppositeZOrigin.z));
                    }
                }
                else {
                    const realEndPosition = movementPath.path[movementPath.path.length - 1];
                    context.setData(IContext_1.ContextDataType.Tile, context.island.getTile(realEndPosition.x, realEndPosition.y, this.options?.changeZ ?? realEndPosition.z));
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
                        const terrainDescription = tile.description;
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
            if (this.options?.allowBoat && context.inventory.sailboat && !context.human.vehicleItemReference) {
                const tile = context.human.tile;
                const terrainDescription = tile.description;
                if (terrainDescription && terrainDescription.water) {
                    return [
                        new UseItem_1.default(Ride_1.default, context.inventory.sailboat),
                        new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options, allowBoat: false }),
                    ];
                }
                if (path) {
                    let firstWaterTile;
                    for (let i = 0; i < path.length - 1; i++) {
                        const point = path[i];
                        const tile = context.island.getTile(point.x, point.y, this.target.z);
                        const terrainDescription = tile.description;
                        if (terrainDescription && terrainDescription.water) {
                            firstWaterTile = tile;
                            break;
                        }
                    }
                    if (firstWaterTile) {
                        return [
                            new MoveToTarget(firstWaterTile, false),
                            new UseItem_1.default(Ride_1.default, context.inventory.sailboat),
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
                case MovementUtilities_1.MoveResult.NoTarget:
                    this.log.info("No target to move to");
                    return IObjective_1.ObjectiveResult.Complete;
                case MovementUtilities_1.MoveResult.NoPath:
                    this.log.info(`No path to target ${this.target}`);
                    return IObjective_1.ObjectiveResult.Complete;
                case MovementUtilities_1.MoveResult.Moving:
                    this.log.info(`Moving to target (${this.target.x},${this.target.y},${this.target.z})`);
                    return IObjective_1.ObjectiveResult.Pending;
                case MovementUtilities_1.MoveResult.Complete:
                    this.log.info(`Finished moving to target (${this.target.x},${this.target.y},${this.target.z})`);
                    context.setData(IContext_1.ContextDataType.Tile, context.human.tile);
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
            const trackedCreature = this.trackedCreature;
            if (trackedCreature && this.trackedPosition) {
                if (!trackedCreature.isValid) {
                    this.log.info("Creature died");
                    return true;
                }
                if (trackedCreature.isTamed) {
                    this.log.info("Creature became tamed");
                    return true;
                }
                if (Vector2_1.default.distance(context.human, trackedCreature) > 5) {
                    return false;
                }
                if (this.options?.equipWeapons && !context.options.lockEquipment) {
                    const handEquipmentChange = context.utilities.item.updateHandEquipment(context);
                    if (handEquipmentChange) {
                        this.log.info(`Should equip ${handEquipmentChange.item} before attacking`);
                        return new EquipItem_1.default(handEquipmentChange.equipType, handEquipmentChange.item);
                    }
                }
                if (trackedCreature.x !== this.trackedPosition.x ||
                    trackedCreature.y !== this.trackedPosition.y ||
                    trackedCreature.z !== this.trackedPosition.z) {
                    this.log.info("Moving with tracked creature");
                    this.trackedPosition = trackedCreature.point;
                    context.utilities.movement.clearCache();
                    const moveResult = await context.utilities.movement.move(context, trackedCreature, this.moveAdjacentToTarget, true, true);
                    switch (moveResult) {
                        case MovementUtilities_1.MoveResult.NoTarget:
                            this.log.info("No target to move to");
                            return true;
                        case MovementUtilities_1.MoveResult.NoPath:
                            this.log.info(`No path to target ${trackedCreature}`);
                            return true;
                        case MovementUtilities_1.MoveResult.Moving:
                            return false;
                        case MovementUtilities_1.MoveResult.Complete:
                            this.log.info("Finished moving to target");
                            return false;
                    }
                }
            }
            if (this.options?.allowBoat && context.inventory.sailboat && !context.human.vehicleItemReference) {
                const tile = context.human.tile;
                const terrainDescription = tile.description;
                if (terrainDescription && terrainDescription.water) {
                    this.log.warn("Interrupting to use sail boat");
                    return true;
                }
            }
            const range = this.options?.range;
            if (range !== undefined && this.options?.stopWhenWithinRange && Vector2_1.default.isDistanceWithin(context.human, this.target, range)) {
                this.log.info("Within range of the target");
                return true;
            }
            return super.onMove(context, this.trackedCreature);
        }
    }
    exports.default = MoveToTarget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvVGFyZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9Nb3ZlVG9UYXJnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBNkJILE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDO0lBdUI5QixNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFVbEQsWUFDVyxNQUE2RCxFQUNwRCxvQkFBNkIsRUFDN0IsT0FBdUM7WUFDMUQsS0FBSyxFQUFFLENBQUM7WUFIRSxXQUFNLEdBQU4sTUFBTSxDQUF1RDtZQUNwRCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQVM7WUFDN0IsWUFBTyxHQUFQLE9BQU8sQ0FBZ0M7WUFMbEMsOEJBQXlCLEdBQVksSUFBSSxDQUFDO1lBUWxFLElBQUksQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLENBQUM7Z0JBQy9CLElBQUksTUFBTSxZQUFZLGtCQUFRLEVBQUUsQ0FBQztvQkFDaEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7b0JBQzlCLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFFckMsQ0FBQztxQkFBTSxJQUFJLE1BQU0sWUFBWSxnQkFBTSxFQUFFLENBQUM7b0JBQ3JDLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO2dCQUM3QixDQUFDO1lBQ0YsQ0FBQztRQUNGLENBQUM7UUFFTSxhQUFhLENBQUMsT0FBNEI7WUFFaEQsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLG9CQUFvQixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyUSxDQUFDO1FBRU0sU0FBUyxDQUFDLE9BQWdCO1lBQ2hDLElBQUksTUFBTSxHQUFHLGFBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1lBRWxELElBQUksQ0FBQyxjQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUMzQixNQUFNLElBQUksS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ25FLENBQUM7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQixDQUFDO1FBRWUsU0FBUztZQUN4QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUUvQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM3RCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO1lBQ25DLENBQUM7WUFPRCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUN6SCxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQy9CLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7WUFDbkMsQ0FBQztZQUVELE1BQU0sa0JBQWtCLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTNDLElBQUksT0FBTyxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQ25DLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDNUYsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBR3pKLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRS9ILE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sS0FBSyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBRXRDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVUsSUFBSSxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQzNELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUN4RCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUN6RSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7b0JBQ2pDLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7Z0JBQ25DLENBQUM7Z0JBRUQsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUN2QixLQUFLLGVBQWUsQ0FBQyxDQUFDO3dCQU1yQixPQUFPOzRCQUNOLElBQUksdUJBQWEsQ0FBQyxpQkFBaUIsQ0FBQzs0QkFHcEMsSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDOzRCQUduTSxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUM7eUJBQzlILENBQUM7b0JBRUgsS0FBSyxNQUFNLENBQUMsQ0FBQzt3QkFDWixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO29CQW1CbkM7d0JBQ0MsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQztnQkFDcEMsQ0FBQztZQUNGLENBQUM7WUFFRCxJQUFJLElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMzRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7WUFFRCxNQUFNLFlBQVksR0FBRyxNQUFNLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUU5SSxNQUFNLElBQUksR0FBRyxDQUFDLFlBQVksS0FBSyw0QkFBZSxDQUFDLFFBQVEsSUFBSSxZQUFZLEtBQUssNEJBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBRXhJLElBQUksT0FBTyxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQ25DLElBQUksWUFBWSxLQUFLLDRCQUFlLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQ2pELE9BQU8sWUFBWSxDQUFDO2dCQUNyQixDQUFDO2dCQUVELElBQUksWUFBWSxLQUFLLDRCQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBRS9DLE9BQU8sWUFBWSxDQUFDO2dCQUNyQixDQUFDO2dCQUVELElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQzVDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLENBQUM7b0JBQzVFLElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFFOUQsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQztvQkFDbkMsQ0FBQztnQkFDRixDQUFDO2dCQUVELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQztvQkFDM0IsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ3hELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUM7b0JBQ3pFLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFFMUMsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRXRILENBQUM7eUJBQU0sSUFBSSxlQUFlLEVBQUUsQ0FBQzt3QkFFNUIsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pKLENBQUM7Z0JBRUYsQ0FBQztxQkFBTSxDQUFDO29CQUNQLE1BQU0sZUFBZSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3hFLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqSixDQUFDO2dCQUVELE9BQU8sWUFBWSxDQUFDLEtBQUssQ0FBQztZQUMzQixDQUFDO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixJQUFJLElBQUksRUFBRSxDQUFDO2dCQUV2RixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3ZDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztvQkFFbEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDdEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN0QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDdkUsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO3dCQUM1QyxJQUFJLGtCQUFrQixJQUFJLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDOzRCQUNwRCxTQUFTLEVBQUUsQ0FBQzt3QkFDYixDQUFDO29CQUNGLENBQUM7b0JBRUQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBRW5CLElBQUksT0FBTyxDQUFDLEtBQUssR0FBRyxTQUFTLElBQUksRUFBRSxFQUFFLENBQUM7NEJBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDRCQUE0QixTQUFTLDRCQUE0QixDQUFDLENBQUM7NEJBRXBGLE9BQU87Z0NBQ04sSUFBSSxjQUFJLEVBQUU7Z0NBQ1YsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUM7NkJBQ3hHLENBQUM7d0JBQ0gsQ0FBQztvQkFDRixDQUFDO2dCQUNGLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFDbEcsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQ2hDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDNUMsSUFBSSxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDcEQsT0FBTzt3QkFDTixJQUFJLGlCQUFPLENBQUMsY0FBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO3dCQUM3QyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUM7cUJBQy9GLENBQUM7Z0JBQ0gsQ0FBQztnQkFFRCxJQUFJLElBQUksRUFBRSxDQUFDO29CQUNWLElBQUksY0FBZ0MsQ0FBQztvQkFFckMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzFDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDdEIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3JFLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzt3QkFDNUMsSUFBSSxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs0QkFDcEQsY0FBYyxHQUFHLElBQUksQ0FBQzs0QkFDdEIsTUFBTTt3QkFDUCxDQUFDO29CQUNGLENBQUM7b0JBRUQsSUFBSSxjQUFjLEVBQUUsQ0FBQzt3QkFDcEIsT0FBTzs0QkFDTixJQUFJLFlBQVksQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDOzRCQUN2QyxJQUFJLGlCQUFPLENBQUMsY0FBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDOzRCQUM3QyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO3lCQUM3RSxDQUFDO29CQUNILENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUM7WUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQztZQUNsQyxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksaUJBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDeEYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztnQkFDNUMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFMUcsUUFBUSxVQUFVLEVBQUUsQ0FBQztnQkFDcEIsS0FBSyw4QkFBVSxDQUFDLFFBQVE7b0JBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7b0JBQ3RDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7Z0JBRWpDLEtBQUssOEJBQVUsQ0FBQyxNQUFNO29CQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7b0JBRWxELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7Z0JBRWpDLEtBQUssOEJBQVUsQ0FBQyxNQUFNO29CQUVyQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN2RixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2dCQUVoQyxLQUFLLDhCQUFVLENBQUMsUUFBUTtvQkFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsOEJBQThCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDaEcsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUUxRCxJQUFJLFlBQVksS0FBSyw0QkFBZSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLGtCQUFrQixJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUNuSixPQUFPLElBQUksY0FBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztvQkFDeEQsQ0FBQztvQkFFRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ2xDLENBQUM7UUFDRixDQUFDO1FBS00sU0FBUyxDQUFDLElBQXNCO1lBQ3RDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBRXhCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLGFBQWEsQ0FBQyxPQUFnQixFQUFFLElBQVU7WUFDaEQsT0FBTyxJQUFJLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQztRQUNsQyxDQUFDO1FBRU0saUJBQWlCLENBQUMsT0FBZ0IsRUFBRSxRQUFrQjtZQUM1RCxPQUFPLElBQUksQ0FBQyxlQUFlLEtBQUssUUFBUSxDQUFDO1FBQzFDLENBQUM7UUFFTSxlQUFlLENBQUMsT0FBZ0IsRUFBRSxNQUFjO1lBQ3RELE9BQU8sSUFBSSxDQUFDLGFBQWEsS0FBSyxNQUFNLENBQUM7UUFDdEMsQ0FBQztRQUtlLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBZ0I7WUFDNUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUM3QyxJQUFJLGVBQWUsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUMvQixPQUFPLElBQUksQ0FBQztnQkFDYixDQUFDO2dCQUVELElBQUksZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO29CQUN2QyxPQUFPLElBQUksQ0FBQztnQkFDYixDQUFDO2dCQUVELElBQUksaUJBQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFFMUQsT0FBTyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQztnQkFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDbEUsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDaEYsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO3dCQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsbUJBQW1CLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDO3dCQUUzRSxPQUFPLElBQUksbUJBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBSy9FLENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxJQUFJLGVBQWUsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUMvQyxlQUFlLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDNUMsZUFBZSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUMvQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO29CQUU5QyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUM7b0JBRzdDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUd4QyxNQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBRTFILFFBQVEsVUFBVSxFQUFFLENBQUM7d0JBQ3BCLEtBQUssOEJBQVUsQ0FBQyxRQUFROzRCQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOzRCQUN0QyxPQUFPLElBQUksQ0FBQzt3QkFFYixLQUFLLDhCQUFVLENBQUMsTUFBTTs0QkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLGVBQWUsRUFBRSxDQUFDLENBQUM7NEJBQ3RELE9BQU8sSUFBSSxDQUFDO3dCQUViLEtBQUssOEJBQVUsQ0FBQyxNQUFNOzRCQUVyQixPQUFPLEtBQUssQ0FBQzt3QkFFZCxLQUFLLDhCQUFVLENBQUMsUUFBUTs0QkFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQzs0QkFDM0MsT0FBTyxLQUFLLENBQUM7b0JBQ2YsQ0FBQztnQkFDRixDQUFDO1lBQ0YsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQ2xHLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNoQyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBQzVDLElBQUksa0JBQWtCLElBQUksa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ3BELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7b0JBQy9DLE9BQU8sSUFBSSxDQUFDO2dCQUNiLENBQUM7WUFDRixDQUFDO1lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUM7WUFDbEMsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLElBQUksaUJBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDN0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQztnQkFDNUMsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDO1lBRUQsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDcEQsQ0FBQztLQUNEO0lBOVhELCtCQThYQyJ9