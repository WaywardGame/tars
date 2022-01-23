import { ActionType } from "game/entity/action/IAction";
import { getDirectionFromMovement } from "game/entity/player/IPlayer";
import type { IOverlayInfo, ITile } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import { RenderSource } from "renderer/IRenderer";
import PathOverlayFootPrints from "ui/screen/screens/game/util/movement/PathOverlayFootPrints";
import TileHelpers from "utilities/game/TileHelpers";
import { Direction } from "utilities/math/Direction";
import type { IVector2, IVector3 } from "utilities/math/IVector";

import type Context from "../core/context/Context";
import { ObjectiveResult } from "../core/objective/IObjective";
import type { NavigationPath } from "../core/navigation/INavigation";
import { log } from "./Logger";

export interface IMovementPath {
    difficulty: number;
    path?: IVector2[];
}

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

    private readonly cachedPaths: Map<string, NavigationPath | undefined> = new Map();

    public clearCache() {
        this.cachedPaths.clear();
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

    public updateOverlay(path: IVector2[]) {
        this.resetMovementOverlays();

        for (let i = 1; i < path.length; i++) {
            const lastPos = path[i - 1];
            const pos = path[i];
            const nextPos: IVector2 | undefined = path[i + 1];

            const tile = localIsland.getTile(pos.x, pos.y, localPlayer.z);

            const overlay = PathOverlayFootPrints(i, path.length, pos, lastPos, nextPos, false);
            if (overlay) {
                TileHelpers.Overlay.add(tile, overlay);
                this.movementOverlays.push({
                    tile: tile,
                    overlay: overlay,
                });
            }
        }
    }

    public async getMovementPath(context: Context, target: IVector3, moveAdjacentToTarget: boolean): Promise<IMovementPath> {
        if (context.player.x === target.x && context.player.y === target.y && context.player.z === target.z && !moveAdjacentToTarget) {
            return {
                difficulty: 0,
            };
        }

        const pathId = `${target.x},${target.y},${target.z}:${moveAdjacentToTarget ? "A" : "O"}`;

        let movementPath: NavigationPath | undefined;

        if (this.cachedPaths.has(pathId)) {
            movementPath = this.cachedPaths.get(pathId);

        } else {
            const navigation = context.utilities.navigation;

            // ensure sailing mode is up to date
            await context.utilities.ensureSailingMode(!!context.player.vehicleItemReference);

            const ends = navigation.getValidPoints(target, !moveAdjacentToTarget);
            if (ends.length === 0) {
                return {
                    difficulty: ObjectiveResult.Impossible,
                };
            }

            for (const end of ends) {
                if (context.player.x === end.x && context.player.y === end.y && context.player.z === end.z) {
                    return {
                        difficulty: 0,
                    };
                }
            }

            const origin = navigation.getOrigin();
            if (!origin || (origin.x !== context.player.x || origin.y !== context.player.y || origin.z !== context.player.z)) {
                log.warn("Updating origin immediately due to mismatch", origin, context.player.getPoint());
                navigation.updateOrigin(context.player);
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
                movementPath = results[0];
            }

            this.cachedPaths.set(pathId, movementPath);
        }

        if (movementPath) {
            // log.info("getMovementPath", movementPath.path.length, movementPath.score);

            return {
                difficulty: movementPath.score,
                path: movementPath.path,
            };
        }

        return {
            difficulty: ObjectiveResult.Impossible,
        };
    }

    public async moveToFaceTarget(context: Context, target: IVector3): Promise<MoveResult> {
        return this.move(context, target, true);
    }

    public async moveToTarget(context: Context, target: IVector3): Promise<MoveResult> {
        return this.move(context, target, false);
    }

    public async move(context: Context, target: IVector3, moveAdjacentToTarget: boolean, force?: boolean, walkOnce?: boolean): Promise<MoveResult> {
        const movementPath = await this.getMovementPath(context, target, moveAdjacentToTarget);

        if (movementPath.difficulty !== 0) {
            if (!movementPath.path) {
                return MoveResult.NoPath;
            }

            const pathLength = movementPath.path.length;

            const end = movementPath.path[pathLength - 1];
            if (!end) {
                log.info("Broken path!", pathLength, movementPath.path, target.x, target.y, target.z, context.player.x, context.player.y, context.player.z);
                return MoveResult.NoPath;
            }

            const atEnd = context.player.x === end.x && context.player.y === end.y;
            if (!atEnd) {
                const nextPosition: IVector2 | undefined = movementPath.path[1];
                if (nextPosition) {
                    const direction = getDirectionFromMovement(nextPosition.x - context.player.x, nextPosition.y - context.player.y);

                    const nextTile = context.player.island.getTile(nextPosition.x, nextPosition.y, target.z);
                    const doodad = nextTile.doodad;
                    const tileType = TileHelpers.getType(nextTile);
                    const terrainDescription = Terrains[tileType];

                    if (terrainDescription && !terrainDescription.passable && !terrainDescription.water) {
                        // some terrain is blocking our path
                        if (terrainDescription.gather) {
                            if (direction !== context.player.facingDirection) {
                                await context.utilities.action.executeAction(context, ActionType.UpdateDirection, (context, action) => {
                                    action.execute(context.player, direction, undefined);
                                    return ObjectiveResult.Complete;
                                });
                            }

                            const actionType = terrainDescription.gather ? ActionType.Mine : ActionType.Dig;

                            await context.utilities.action.executeAction(context, actionType, (context, action) => {
                                action.execute(context.player, context.utilities.item.getBestToolForTerrainGather(context, tileType));
                                return ObjectiveResult.Complete;
                            });

                            return MoveResult.Moving;
                        }

                        log.info("Terrain is blocking movement", TerrainType[tileType]);
                        return MoveResult.NoPath;

                    } else if (doodad?.blocksMove()) {
                        // doodad is blocking our path

                        // face it
                        if (direction !== context.player.facingDirection) {
                            await context.utilities.action.executeAction(context, ActionType.UpdateDirection, (context, action) => {
                                action.execute(context.player, direction, undefined);
                                return ObjectiveResult.Complete;
                            });
                        }

                        if (doodad.canPickup(context.player)) {
                            const doodadDescription = doodad.description();
                            if (doodadDescription && (doodadDescription.isDoor || doodadDescription.isGate) && doodadDescription.isClosed) {
                                log.info("Opening doodad blocking the path", Direction[direction]);

                                await context.utilities.action.executeAction(context, ActionType.OpenDoor, (context, action) => {
                                    action.execute(context.player);
                                    return ObjectiveResult.Complete;
                                });

                            } else {
                                log.info("Picking up doodad blocking the path", Direction[direction]);

                                await context.utilities.action.executeAction(context, ActionType.Pickup, (context, action) => {
                                    action.execute(context.player);
                                    return ObjectiveResult.Complete;
                                });
                            }

                        } else if (context.utilities.tile.hasCorpses(nextTile)) {
                            log.info("Carving corpse on top of doodad blocking the path", Direction[direction]);

                            const tool = context.utilities.item.getBestTool(context, ActionType.Butcher);
                            if (!tool) {
                                log.info("Missing butchering tool");
                                return MoveResult.NoPath;
                            }

                            await context.utilities.action.executeAction(context, ActionType.Butcher, (context, action) => {
                                action.execute(context.player, tool);
                                return ObjectiveResult.Complete;
                            });

                        } else {
                            log.info("Gathering from doodad blocking the path", Direction[direction]);

                            await context.utilities.action.executeAction(context, ActionType.Chop, (context, action) => {
                                action.execute(context.player, context.utilities.item.getBestToolForDoodadGather(context, doodad));
                                return ObjectiveResult.Complete;
                            });
                        }

                        return MoveResult.Moving;

                    } else if (nextTile.creature) {
                        // walking into a creature
                        await context.utilities.action.executeAction(context, ActionType.Move, (context, action) => {
                            action.execute(context.player, direction);
                            return ObjectiveResult.Complete;
                        });

                        return MoveResult.Moving;

                    } else if (nextTile.npc) {
                        log.info("No path through npc");
                        return MoveResult.NoPath;
                    }
                }

                if (force || !context.player.hasWalkPath()) {
                    // walk along the path up to the first obstacle. we don't want to let the Move action automatically gather (it uses tools poorly)
                    this.updateOverlay(movementPath.path);

                    let path = movementPath.path;
                    for (let i = 2; i < path.length; i++) {
                        const position = path[i];
                        const tile = context.player.island.getTile(position.x, position.y, target.z);
                        const tileType = TileHelpers.getType(tile);
                        const terrainDescription = Terrains[tileType];

                        if (tile.doodad?.blocksMove() || (terrainDescription && !terrainDescription.passable && !terrainDescription.water)) {
                            path = path.slice(0, i);
                            break;
                        }
                    }

                    if (walkOnce) {
                        if (!nextPosition) {
                            log.info("No nextPosition");
                            return MoveResult.NoPath;
                        }

                        context.player.walkAlongPath([nextPosition], true);

                    } else {
                        context.player.walkAlongPath(path, true);
                    }
                }

                return MoveResult.Moving;
            }
        }

        if (moveAdjacentToTarget) {
            const direction = getDirectionFromMovement(target.x - context.player.x, target.y - context.player.y);
            if (direction !== context.player.facingDirection) {
                await context.utilities.action.executeAction(context, ActionType.UpdateDirection, (context, action) => {
                    action.execute(context.player, direction, undefined);
                    return ObjectiveResult.Complete;
                });
            }
        }

        return MoveResult.Complete;
    }

}
