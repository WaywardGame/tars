import { ActionType } from "game/entity/action/IAction";
import { getDirectionFromMovement } from "game/entity/player/IPlayer";
import type { IOverlayInfo, ITile } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import { RenderSource } from "renderer/IRenderer";
import PathOverlayFootPrints from "ui/screen/screens/game/util/movement/PathOverlayFootPrints";
import TileHelpers from "utilities/game/TileHelpers";
import { Direction } from "utilities/math/Direction";
import type { IVector3 } from "utilities/math/IVector";
import Dig from "game/entity/action/actions/Dig";
import Mine from "game/entity/action/actions/Mine";
import UpdateDirection from "game/entity/action/actions/UpdateDirection";
import Move from "game/entity/action/actions/Move";
import OpenDoor from "game/entity/action/actions/OpenDoor";

import type Context from "../core/context/Context";
import { ObjectiveResult } from "../core/objective/IObjective";
import type { NavigationPath } from "../core/navigation/INavigation";
import Butcher from "game/entity/action/actions/Butcher";
import PickUp from "game/entity/action/actions/PickUp";
import Chop from "game/entity/action/actions/Chop";
import Equip from "game/entity/action/actions/Equip";

export enum MoveResult {
    NoTarget,
    NoPath,
    Moving,
    Complete,
}

interface ITrackedOverlay {
    tile: ITile;
    overlay: IOverlayInfo;
}

export class MovementUtilities {

    private movementOverlays: ITrackedOverlay[] = [];

    private readonly cachedPaths: Map<string, NavigationPath | ObjectiveResult.Complete | ObjectiveResult.Impossible> = new Map();
    private readonly cachedEnds: Map<string, IVector3[]> = new Map();

    public clearCache() {
        this.cachedPaths.clear();
        this.cachedEnds.clear();
    }

    public resetMovementOverlays() {
        for (const trackedOverlay of this.movementOverlays) {
            TileHelpers.Overlay.remove(trackedOverlay.tile, trackedOverlay.overlay);
        }

        this.movementOverlays.length = 0;

        if (game.playing) {
            game.updateView(RenderSource.Mod, false);
        }
    }

    public clearOverlay(tile: ITile) {
        const trackedOverlay = this.movementOverlays.find(tracked => tracked.tile === tile);
        if (trackedOverlay !== undefined) {
            TileHelpers.Overlay.remove(tile, trackedOverlay.overlay);
        }
    }

    public updateOverlay(path: IVector3[]) {
        this.resetMovementOverlays();

        for (let i = 1; i < path.length; i++) {
            const lastPos = path[i - 1];
            const pos = path[i];
            const nextPos: IVector3 | undefined = path[i + 1];

            if (localPlayer.z !== pos.z) {
                continue;
            }

            const overlay = PathOverlayFootPrints(i, path.length, pos, lastPos, nextPos, false);
            if (overlay) {
                const tile = localIsland.getTile(pos.x, pos.y, pos.z);

                TileHelpers.Overlay.add(tile, overlay);
                this.movementOverlays.push({
                    tile,
                    overlay,
                });
            }
        }
    }

    public async ensureOrigin(context: Context) {
        const navigation = context.utilities.navigation;

        const origin = navigation.getOrigin();
        if (!origin || (origin.x !== context.human.x || origin.y !== context.human.y || origin.z !== context.human.z)) {
            context.log.warn("Updating origin immediately due to mismatch", origin, context.human.getPoint());
            await navigation.updateOrigin(context.human);
        }
    }

    public getMovementEndPositions(context: Context, target: IVector3, moveAdjacentToTarget: boolean): IVector3[] {
        const pathId = `${target.x},${target.y},${target.z}:${moveAdjacentToTarget ? "A" : "O"}`;

        let ends = this.cachedEnds.get(pathId);
        if (ends === undefined) {
            ends = context.utilities.navigation.getValidPoints(target, moveAdjacentToTarget);
            this.cachedEnds.set(pathId, ends);
        }

        return ends;
    }

    public async getMovementPath(context: Context, target: IVector3, moveAdjacentToTarget: boolean, reverse: boolean = false): Promise<NavigationPath | ObjectiveResult.Complete | ObjectiveResult.Impossible> {
        if (context.human.x === target.x && context.human.y === target.y && context.human.z === target.z && !moveAdjacentToTarget && !reverse) {
            return ObjectiveResult.Complete;
        }

        const pathId = `${target.x},${target.y},${target.z}:${moveAdjacentToTarget ? "A" : "O"}:${reverse ? "R" : "N"}`;

        let movementPath = this.cachedPaths.get(pathId);
        if (movementPath === undefined) {
            movementPath = await this._getMovementPath(context, target, moveAdjacentToTarget);

            if (reverse && typeof (movementPath) === "object") {
                movementPath.path = movementPath.path.reverse();
            }

            this.cachedPaths.set(pathId, movementPath);
        }

        return movementPath;
    }

    private async _getMovementPath(context: Context, target: IVector3, moveAdjacentToTarget: boolean): Promise<NavigationPath | ObjectiveResult.Complete | ObjectiveResult.Impossible> {
        const navigation = context.utilities.navigation;

        await this.ensureOrigin(context);

        // ensure sailing mode is up to date
        await context.utilities.ensureSailingMode(!!context.human.vehicleItemReference);

        const ends = this.getMovementEndPositions(context, target, moveAdjacentToTarget);
        if (ends.length === 0) {
            return ObjectiveResult.Impossible;
        }

        for (const end of ends) {
            if (context.human.x === end.x && context.human.y === end.y && context.human.z === end.z) {
                return ObjectiveResult.Complete;
            }
        }

        // pick the easiest path
        let results = (await Promise.all(ends.map(async end => navigation.findPath(end))))
            .filter(result => result !== undefined) as NavigationPath[];

        for (const result of results) {
            const pathLength = result.path.length;

            // the score is length of path + penalty per node
            // remove the base difficulty and add in our own
            // take into account that longer paths are worse
            result.score = Math.round(result.score - pathLength + Math.pow(pathLength, 1.1));
        }

        results = results.sort((a, b) => a.score - b.score);

        if (results.length > 0) {
            return results[0];
        }

        return ObjectiveResult.Impossible;
    }

    public async move(context: Context, target: IVector3, moveAdjacentToTarget: boolean, force?: boolean, walkOnce?: boolean): Promise<MoveResult> {
        const movementPath = await this.getMovementPath(context, target, moveAdjacentToTarget);
        if (movementPath === ObjectiveResult.Impossible) {
            return MoveResult.NoPath;
        }

        if (movementPath !== ObjectiveResult.Complete) {
            const pathLength = movementPath.path.length;

            const end = movementPath.path[pathLength - 1];
            if (!end) {
                context.log.info("Broken path!", pathLength, movementPath.path, target.x, target.y, target.z, context.human.x, context.human.y, context.human.z);
                return MoveResult.NoPath;
            }

            const atEnd = context.human.x === end.x && context.human.y === end.y;
            if (!atEnd) {
                const nextPosition: IVector3 | undefined = movementPath.path[1];
                if (nextPosition) {
                    const direction = getDirectionFromMovement(nextPosition.x - context.human.x, nextPosition.y - context.human.y);

                    const nextTile = context.human.island.getTile(nextPosition.x, nextPosition.y, target.z);
                    const doodad = nextTile.doodad;
                    const tileType = TileHelpers.getType(nextTile);
                    const terrainDescription = Terrains[tileType];

                    if (nextTile.creature) {
                        // walking into a creature

                        // ensure we are wearing the correct equipment
                        const handEquipmentChange = context.utilities.item.updateHandEquipment(context);
                        if (handEquipmentChange) {
                            context.log.info(`Going to equip ${handEquipmentChange.item} before attacking`);

                            await context.utilities.action.executeAction(context, Equip, [handEquipmentChange.item, handEquipmentChange.equipType]);
                        }

                        context.log.info("Walking into a creature");

                        await context.utilities.action.executeAction(context, Move, [direction]);

                        return MoveResult.Moving;

                    } else if (terrainDescription && !terrainDescription.passable && !terrainDescription.water) {
                        // some terrain is blocking our path
                        if (terrainDescription.gather) {
                            if (direction !== context.human.facingDirection) {
                                await context.utilities.action.executeAction(context, UpdateDirection, [direction]);
                            }

                            const actionType = terrainDescription.gather ? Mine : Dig;

                            await context.utilities.action.executeAction(context, actionType, [context.utilities.item.getBestToolForTerrainGather(context, tileType)]);

                            context.log.debug("Gathering from terrain that is blocking movement", TerrainType[tileType]);
                            return MoveResult.Moving;
                        }

                        context.log.info("Terrain is blocking movement", TerrainType[tileType]);
                        return MoveResult.NoPath;

                    } else if (doodad?.blocksMove() && !doodad.isVehicle()) {
                        // doodad is blocking our path
                        context.log.debug("Doodad is blocking path");

                        // face it
                        if (direction !== context.human.facingDirection) {
                            await context.utilities.action.executeAction(context, UpdateDirection, [direction]);
                        }

                        if (doodad.canPickUp(context.human)) {
                            const doodadDescription = doodad.description();
                            if (doodadDescription && (doodadDescription.isDoor || doodadDescription.isGate) && doodadDescription.isClosed) {
                                context.log.info("Opening doodad blocking the path", Direction[direction]);

                                await context.utilities.action.executeAction(context, OpenDoor, []);

                            } else {
                                context.log.info("Picking up doodad blocking the path", Direction[direction]);

                                await context.utilities.action.executeAction(context, PickUp, []);
                            }

                        } else if (context.utilities.tile.hasCorpses(nextTile)) {
                            context.log.info("Carving corpse on top of doodad blocking the path", Direction[direction]);

                            const tool = context.utilities.item.getBestTool(context, ActionType.Butcher);
                            if (!tool) {
                                context.log.info("Missing butchering tool");
                                return MoveResult.NoPath;
                            }

                            await context.utilities.action.executeAction(context, Butcher, [tool]);

                        } else {
                            context.log.info("Gathering from doodad blocking the path", Direction[direction]);

                            await context.utilities.action.executeAction(context, Chop, [context.utilities.item.getBestToolForDoodadGather(context, doodad)]);
                        }

                        return MoveResult.Moving;

                    } else if (nextTile.npc && nextTile.npc !== context.human) {
                        context.log.warn("No path through npc");
                        return MoveResult.NoPath;
                    }
                }

                if (force || !context.human.hasWalkPath()) {
                    // walk along the path up to the first obstacle. we don't want to let the Move action automatically gather (it uses tools poorly)
                    this.updateOverlay(movementPath.path);

                    let path = movementPath.path;
                    for (let i = 2; i < path.length; i++) {
                        const position = path[i];
                        const tile = context.human.island.getTile(position.x, position.y, target.z);
                        const tileType = TileHelpers.getType(tile);
                        const terrainDescription = Terrains[tileType];

                        if (tile.doodad?.blocksMove() || (terrainDescription && !terrainDescription.passable && !terrainDescription.water)) {
                            path = path.slice(0, i);
                            break;
                        }
                    }

                    if (walkOnce) {
                        if (!nextPosition) {
                            context.log.warn("No nextPosition");
                            return MoveResult.NoPath;
                        }

                        path = [nextPosition];
                    }

                    if (!context.options.freeze) {
                        context.tars.updateWalkPath(path);
                    }
                }

                // context.log.debug("Walk path is", context.human.walkPath);

                return MoveResult.Moving;
            }
        }

        if (moveAdjacentToTarget) {
            const direction = getDirectionFromMovement(target.x - context.human.x, target.y - context.human.y);
            if (direction !== context.human.facingDirection) {
                await context.utilities.action.executeAction(context, UpdateDirection, [direction]);
            }
        }

        return MoveResult.Complete;
    }

}
