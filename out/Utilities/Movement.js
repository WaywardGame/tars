define(["require", "exports", "game/entity/action/IAction", "game/entity/player/IPlayer", "game/IGame", "game/tile/ITerrain", "game/tile/Terrains", "ui/screen/screens/game/util/movement/PathOverlayFootPrints", "utilities/game/TileHelpers", "utilities/math/Direction", "../IObjective", "../navigation/Navigation", "./Action", "./Item", "./Logger", "./Tile"], function (require, exports, IAction_1, IPlayer_1, IGame_1, ITerrain_1, Terrains_1, PathOverlayFootPrints_1, TileHelpers_1, Direction_1, IObjective_1, Navigation_1, Action_1, Item_1, Logger_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.move = exports.moveToTarget = exports.moveToFaceTarget = exports.getMovementPath = exports.resetCachedPaths = exports.updateOverlay = exports.clearOverlay = exports.resetMovementOverlays = exports.MoveResult = void 0;
    var MoveResult;
    (function (MoveResult) {
        MoveResult[MoveResult["NoTarget"] = 0] = "NoTarget";
        MoveResult[MoveResult["NoPath"] = 1] = "NoPath";
        MoveResult[MoveResult["Moving"] = 2] = "Moving";
        MoveResult[MoveResult["Complete"] = 3] = "Complete";
    })(MoveResult = exports.MoveResult || (exports.MoveResult = {}));
    const movementOverlays = [];
    function resetMovementOverlays() {
        for (const trackedOverlay of movementOverlays) {
            TileHelpers_1.default.Overlay.remove(trackedOverlay.tile, trackedOverlay.overlay);
        }
        movementOverlays.length = 0;
        if (game.playing) {
            game.updateView(IGame_1.RenderSource.Mod, false);
        }
    }
    exports.resetMovementOverlays = resetMovementOverlays;
    function clearOverlay(tile) {
        const trackedOverlay = movementOverlays.find(tracked => tracked.tile === tile);
        if (trackedOverlay !== undefined) {
            TileHelpers_1.default.Overlay.remove(tile, trackedOverlay.overlay);
        }
    }
    exports.clearOverlay = clearOverlay;
    function updateOverlay(path) {
        resetMovementOverlays();
        for (let i = 1; i < path.length; i++) {
            const lastPos = path[i - 1];
            const pos = path[i];
            const nextPos = path[i + 1];
            const tile = game.getTile(pos.x, pos.y, localPlayer.z);
            const overlay = PathOverlayFootPrints_1.default(i, path.length, pos, lastPos, nextPos, false);
            if (overlay) {
                TileHelpers_1.default.Overlay.add(tile, overlay);
                movementOverlays.push({
                    tile: tile,
                    overlay: overlay,
                });
            }
        }
    }
    exports.updateOverlay = updateOverlay;
    const cachedPaths = new Map();
    function resetCachedPaths() {
        cachedPaths.clear();
    }
    exports.resetCachedPaths = resetCachedPaths;
    async function getMovementPath(context, target, moveAdjacentToTarget) {
        if (context.player.x === target.x && context.player.y === target.y && context.player.z === target.z && !moveAdjacentToTarget) {
            return {
                difficulty: 0,
            };
        }
        const pathId = `${target.x},${target.y},${target.z}:${moveAdjacentToTarget ? "A" : "O"}`;
        let movementPath;
        if (cachedPaths.has(pathId)) {
            movementPath = cachedPaths.get(pathId);
        }
        else {
            const navigation = Navigation_1.default.get();
            const ends = navigation.getValidPoints(target, !moveAdjacentToTarget);
            if (ends.length === 0) {
                return {
                    difficulty: IObjective_1.ObjectiveResult.Impossible,
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
                Logger_1.log.warn("Updating origin immediately due to mismatch", origin, context.player.getPoint());
                navigation.updateOrigin(context.player);
            }
            let results = (await Promise.all(ends.map(end => navigation.findPath(end))))
                .filter(result => result !== undefined);
            for (const result of results) {
                const pathLength = result.path.length;
                result.score = Math.round(result.score - pathLength + Math.pow(pathLength, 1.1));
            }
            results = results.sort((a, b) => a.score - b.score);
            if (results.length > 0) {
                movementPath = results[0];
            }
            cachedPaths.set(pathId, movementPath);
        }
        if (movementPath) {
            return {
                difficulty: movementPath.score,
                path: movementPath.path,
            };
        }
        return {
            difficulty: IObjective_1.ObjectiveResult.Impossible,
        };
    }
    exports.getMovementPath = getMovementPath;
    async function moveToFaceTarget(context, target) {
        return move(context, target, true);
    }
    exports.moveToFaceTarget = moveToFaceTarget;
    async function moveToTarget(context, target) {
        return move(context, target, false);
    }
    exports.moveToTarget = moveToTarget;
    async function move(context, target, moveAdjacentToTarget, force) {
        var _a;
        const movementPath = await getMovementPath(context, target, moveAdjacentToTarget);
        if (movementPath.difficulty !== 0) {
            if (!movementPath.path) {
                return MoveResult.NoPath;
            }
            const pathLength = movementPath.path.length;
            const end = movementPath.path[pathLength - 1];
            if (!end) {
                Logger_1.log.info("Broken path!", pathLength, movementPath.path, target.x, target.y, target.z, context.player.x, context.player.y, context.player.z);
                return MoveResult.NoPath;
            }
            const atEnd = context.player.x === end.x && context.player.y === end.y;
            if (!atEnd) {
                const nextPosition = movementPath.path[1];
                if (nextPosition) {
                    const direction = IPlayer_1.getDirectionFromMovement(nextPosition.x - context.player.x, nextPosition.y - context.player.y);
                    const nextTile = game.getTile(nextPosition.x, nextPosition.y, target.z);
                    const doodad = nextTile.doodad;
                    const tileType = TileHelpers_1.default.getType(nextTile);
                    const terrainDescription = Terrains_1.default[tileType];
                    if (terrainDescription && !terrainDescription.passable && !terrainDescription.water) {
                        if (terrainDescription.gather) {
                            if (direction !== context.player.facingDirection) {
                                await Action_1.executeAction(context, IAction_1.ActionType.UpdateDirection, (context, action) => {
                                    action.execute(context.player, direction, undefined);
                                });
                            }
                            const actionType = terrainDescription.gather ? IAction_1.ActionType.Gather : IAction_1.ActionType.Dig;
                            await Action_1.executeAction(context, actionType, (context, action) => {
                                action.execute(context.player, Item_1.getBestToolForTerrainGather(context, tileType));
                            });
                            return MoveResult.Moving;
                        }
                        Logger_1.log.info("Terrain is blocking movement", ITerrain_1.TerrainType[tileType]);
                        return MoveResult.NoPath;
                    }
                    else if (doodad === null || doodad === void 0 ? void 0 : doodad.blocksMove()) {
                        if (direction !== context.player.facingDirection) {
                            await Action_1.executeAction(context, IAction_1.ActionType.UpdateDirection, (context, action) => {
                                action.execute(context.player, direction, undefined);
                            });
                        }
                        if (doodad.canPickup(context.player)) {
                            Logger_1.log.info("Picking up doodad", Direction_1.Direction[direction]);
                            await Action_1.executeAction(context, IAction_1.ActionType.Pickup, (context, action) => {
                                action.execute(context.player);
                            });
                        }
                        else if (Tile_1.hasCorpses(nextTile)) {
                            Logger_1.log.info("Carving corpse on top of doodad blocking the path", Direction_1.Direction[direction]);
                            const tool = Item_1.getBestTool(context, IAction_1.ActionType.Carve);
                            if (!tool) {
                                Logger_1.log.info("Missing tool for carve");
                                return MoveResult.NoPath;
                            }
                            await Action_1.executeAction(context, IAction_1.ActionType.Carve, (context, action) => {
                                action.execute(context.player, tool);
                            });
                        }
                        else {
                            Logger_1.log.info("Gathering from doodad blocking the path", Direction_1.Direction[direction]);
                            await Action_1.executeAction(context, IAction_1.ActionType.Gather, (context, action) => {
                                action.execute(context.player, Item_1.getBestToolForDoodadGather(context, doodad));
                            });
                        }
                        return MoveResult.Moving;
                    }
                    else if (nextTile.creature) {
                        await Action_1.executeAction(context, IAction_1.ActionType.Move, (context, action) => {
                            action.execute(context.player, direction);
                        });
                        return MoveResult.Moving;
                    }
                    else if (nextTile.npc) {
                        Logger_1.log.info("No path through npc");
                        return MoveResult.NoPath;
                    }
                }
                if (force || !context.player.hasWalkPath()) {
                    updateOverlay(movementPath.path);
                    let path = movementPath.path;
                    for (let i = 2; i < path.length; i++) {
                        const position = path[i];
                        const tile = game.getTile(position.x, position.y, target.z);
                        const tileType = TileHelpers_1.default.getType(tile);
                        const terrainDescription = Terrains_1.default[tileType];
                        if (((_a = tile.doodad) === null || _a === void 0 ? void 0 : _a.blocksMove()) || (terrainDescription && !terrainDescription.passable && !terrainDescription.water)) {
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
            const direction = IPlayer_1.getDirectionFromMovement(target.x - context.player.x, target.y - context.player.y);
            if (direction !== context.player.facingDirection) {
                await Action_1.executeAction(context, IAction_1.ActionType.UpdateDirection, (context, action) => {
                    action.execute(context.player, direction, undefined);
                });
            }
        }
        return MoveResult.Complete;
    }
    exports.move = move;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbGl0aWVzL01vdmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUF5QkEsSUFBWSxVQUtYO0lBTEQsV0FBWSxVQUFVO1FBQ2xCLG1EQUFRLENBQUE7UUFDUiwrQ0FBTSxDQUFBO1FBQ04sK0NBQU0sQ0FBQTtRQUNOLG1EQUFRLENBQUE7SUFDWixDQUFDLEVBTFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFLckI7SUFPRCxNQUFNLGdCQUFnQixHQUFzQixFQUFFLENBQUM7SUFFL0MsU0FBZ0IscUJBQXFCO1FBQ2pDLEtBQUssTUFBTSxjQUFjLElBQUksZ0JBQWdCLEVBQUU7WUFDM0MscUJBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzNFO1FBRUQsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUU1QixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZCxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFZLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzVDO0lBQ0wsQ0FBQztJQVZELHNEQVVDO0lBRUQsU0FBZ0IsWUFBWSxDQUFDLElBQVc7UUFDcEMsTUFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztRQUMvRSxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7WUFDOUIscUJBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDNUQ7SUFDTCxDQUFDO0lBTEQsb0NBS0M7SUFFRCxTQUFnQixhQUFhLENBQUMsSUFBZ0I7UUFDMUMscUJBQXFCLEVBQUUs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