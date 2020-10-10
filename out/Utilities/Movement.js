define(["require", "exports", "entity/action/IAction", "entity/IEntity", "entity/player/IPlayer", "game/IGame", "newui/screen/screens/game/util/movement/PathOverlayFootPrints", "tile/ITerrain", "tile/Terrains", "utilities/math/Direction", "utilities/TileHelpers", "../IObjective", "../Navigation/Navigation", "./Action", "./Item", "./Logger", "./Tile"], function (require, exports, IAction_1, IEntity_1, IPlayer_1, IGame_1, PathOverlayFootPrints_1, ITerrain_1, Terrains_1, Direction_1, TileHelpers_1, IObjective_1, Navigation_1, Action_1, Item_1, Logger_1, Tile_1) {
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
            results = results.sort((a, b) => a.score === b.score ? 0 : (a.score > b.score ? 1 : -1));
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
                            const item = terrainDescription.gather ? Item_1.getBestActionItem(context, IAction_1.ActionType.Gather, IEntity_1.DamageType.Blunt) : Item_1.getBestActionItem(context, IAction_1.ActionType.Dig);
                            await Action_1.executeAction(context, actionType, (context, action) => {
                                action.execute(context.player, item);
                            });
                        }
                        else {
                            Logger_1.log.info("Terrain is blocking movement", ITerrain_1.TerrainType[tileType]);
                        }
                    }
                    else if (nextTile.doodad && nextTile.doodad.blocksMove()) {
                        if (direction !== context.player.facingDirection) {
                            await Action_1.executeAction(context, IAction_1.ActionType.UpdateDirection, (context, action) => {
                                action.execute(context.player, direction, undefined);
                            });
                        }
                        if (nextTile.doodad.canPickup(context.player)) {
                            Logger_1.log.info("Picking up doodad", Direction_1.Direction[direction]);
                            await Action_1.executeAction(context, IAction_1.ActionType.Pickup, (context, action) => {
                                action.execute(context.player);
                            });
                        }
                        else if (Tile_1.hasCorpses(nextTile)) {
                            Logger_1.log.info("Carving corpse on top of doodad blocking the path", Direction_1.Direction[direction]);
                            await Action_1.executeAction(context, IAction_1.ActionType.Carve, (context, action) => {
                                action.execute(context.player, Item_1.getInventoryItemsWithUse(context, IAction_1.ActionType.Carve)[0]);
                            });
                        }
                        else {
                            Logger_1.log.info("Gathering from doodad blocking the path", Direction_1.Direction[direction]);
                            await Action_1.executeAction(context, IAction_1.ActionType.Gather, (context, action) => {
                                action.execute(context.player, Item_1.getBestActionItem(context, IAction_1.ActionType.Gather, IEntity_1.DamageType.Slashing));
                            });
                        }
                    }
                    else if (nextTile.creature) {
                        if (direction !== context.player.facingDirection) {
                            await Action_1.executeAction(context, IAction_1.ActionType.UpdateDirection, (context, action) => {
                                action.execute(context.player, direction, undefined);
                            });
                        }
                        await Action_1.executeAction(context, IAction_1.ActionType.Move, (context, action) => {
                            action.execute(context.player, direction);
                        });
                    }
                    else if (nextTile.npc) {
                        Logger_1.log.info("No path through npc");
                        return MoveResult.NoPath;
                    }
                }
                if (force || !context.player.hasWalkPath()) {
                    updateOverlay(movementPath.path);
                    context.player.walkAlongPath(movementPath.path, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVXRpbGl0aWVzL01vdmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUEwQkEsSUFBWSxVQUtYO0lBTEQsV0FBWSxVQUFVO1FBQ3JCLG1EQUFRLENBQUE7UUFDUiwrQ0FBTSxDQUFBO1FBQ04sK0NBQU0sQ0FBQTtRQUNOLG1EQUFRLENBQUE7SUFDVCxDQUFDLEVBTFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFLckI7SUFPRCxNQUFNLGdCQUFnQixHQUFzQixFQUFFLENBQUM7SUFFL0MsU0FBZ0IscUJBQXFCO1FBQ3BDLEtBQUssTUFBTSxjQUFjLElBQUksZ0JBQWdCLEVBQUU7WUFDOUMscUJBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3hFO1FBRUQsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUU1QixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDakIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN6QztJQUNGLENBQUM7SUFWRCxzREFVQztJQUVELFNBQWdCLFlBQVksQ0FBQyxJQUFXO1FBQ3ZDLE1BQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDL0UsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO1lBQ2pDLHFCQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3pEO0lBQ0YsQ0FBQztJQUxELG9DQUtDO0lBRUQsU0FBZ0IsYUFBYSxDQUFDLElBQWdCO1FBQzdDLHFCQUFxQixFQUFF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