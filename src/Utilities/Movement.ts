import { ActionType } from "game/entity/action/IAction";
import { getDirectionFromMovement } from "game/entity/player/IPlayer";
import { RenderSource } from "game/IGame";
import { IOverlayInfo, ITile, TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import PathOverlayFootPrints from "ui/screen/screens/game/util/movement/PathOverlayFootPrints";
import TileHelpers from "utilities/game/TileHelpers";
import { Direction } from "utilities/math/Direction";
import { IVector2, IVector3 } from "utilities/math/IVector";

import Context from "../Context";
import { ObjectiveResult } from "../IObjective";
import { NavigationPath } from "../navigation//INavigation";
import Navigation from "../navigation/Navigation";

import { actionUtilities } from "./Action";
import { itemUtilities } from "./Item";
import { log } from "./Logger";
import { tileUtilities } from "./Tile";

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

class MovementUtilities {

    private movementOverlays: ITrackedOverlay[] = [];

    private cachedPaths: Map<string, NavigationPath | undefined> = new Map();

    public resetCachedPaths() {
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

            const tile = game.getTile(pos.x, pos.y, localPlayer.z);

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
            const navigation = Navigation.get();

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
            if (origin.x !== context.player.x || origin.y !== context.player.y || origin.z !== context.player.z) {
                log.warn("Updating origin immediately due to mismatch", origin, context.player.getPoint());
                navigation.updateOrigin(context.player);
            }

            // pick the easiest path
            let results = (await Promise.all(ends.map(end => navigation.findPath(end))))
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

    public async move(context: Context, target: IVector3, moveAdjacentToTarget: boolean, force?: boolean): Promise<MoveResult> {
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
                const nextPosition = movementPath.path[1];
                if (nextPosition) {
                    const direction = getDirectionFromMovement(nextPosition.x - context.player.x, nextPosition.y - context.player.y);

                    const nextTile = game.getTile(nextPosition.x, nextPosition.y, target.z);
                    const doodad = nextTile.doodad;
                    const tileType = TileHelpers.getType(nextTile);
                    const terrainDescription = Terrains[tileType];

                    if (terrainDescription && !terrainDescription.passable && !terrainDescription.water) {
                        if (terrainDescription.gather) {
                            if (direction !== context.player.facingDirection) {
                                await actionUtilities.executeAction(context, ActionType.UpdateDirection, (context, action) => {
                                    action.execute(context.player, direction, undefined);
                                });
                            }

                            const actionType = terrainDescription.gather ? ActionType.Gather : ActionType.Dig;

                            await actionUtilities.executeAction(context, actionType, (context, action) => {
                                action.execute(context.player, itemUtilities.getBestToolForTerrainGather(context, tileType));
                            });

                            return MoveResult.Moving;
                        }

                        log.info("Terrain is blocking movement", TerrainType[tileType]);
                        return MoveResult.NoPath;

                    } else if (doodad?.blocksMove()) {
                        // walking into a doodad we can pickup
                        if (direction !== context.player.facingDirection) {
                            await actionUtilities.executeAction(context, ActionType.UpdateDirection, (context, action) => {
                                action.execute(context.player, direction, undefined);
                            });
                        }

                        if (doodad.canPickup(context.player)) {
                            log.info("Picking up doodad", Direction[direction]);

                            await actionUtilities.executeAction(context, ActionType.Pickup, (context, action) => {
                                action.execute(context.player);
                            });

                        } else if (tileUtilities.hasCorpses(nextTile)) {
                            log.info("Carving corpse on top of doodad blocking the path", Direction[direction]);

                            const tool = itemUtilities.getBestTool(context, ActionType.Carve);
                            if (!tool) {
                                log.info("Missing tool for carve");
                                return MoveResult.NoPath;
                            }

                            // todo: what if you don't have a carve item?
                            await actionUtilities.executeAction(context, ActionType.Carve, (context, action) => {
                                action.execute(context.player, tool);
                            });

                        } else {
                            log.info("Gathering from doodad blocking the path", Direction[direction]);

                            await actionUtilities.executeAction(context, ActionType.Gather, (context, action) => {
                                action.execute(context.player, itemUtilities.getBestToolForDoodadGather(context, doodad));
                            });
                        }

                        return MoveResult.Moving;

                    } else if (nextTile.creature) {
                        // walking into a creature
                        await actionUtilities.executeAction(context, ActionType.Move, (context, action) => {
                            action.execute(context.player, direction);
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
                        const tile = game.getTile(position.x, position.y, target.z);
                        const tileType = TileHelpers.getType(tile);
                        const terrainDescription = Terrains[tileType];

                        if (tile.doodad?.blocksMove() || (terrainDescription && !terrainDescription.passable && !terrainDescription.water)) {
                            path = path.slice(0, i);
                            break;
                        }
                    }

                    context.player.walkAlongPath(path, true);
                }

                return MoveResult.Moving;
            }
        }

        if (moveAdjacentToTarget) {
            const direction = getDirectionFromMovement(target.x - context.player.x, target.y - context.player.y);
            if (direction !== context.player.facingDirection) {
                await actionUtilities.executeAction(context, ActionType.UpdateDirection, (context, action) => {
                    action.execute(context.player, direction, undefined);
                });
            }
        }

        return MoveResult.Complete;
    }

}

export const movementUtilities = new MovementUtilities();
