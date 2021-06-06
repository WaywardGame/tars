define(["require", "exports", "game/entity/action/IAction", "game/entity/player/IPlayer", "game/IGame", "game/tile/ITerrain", "game/tile/Terrains", "ui/screen/screens/game/util/movement/PathOverlayFootPrints", "utilities/game/TileHelpers", "utilities/math/Direction", "../IObjective", "../navigation/Navigation", "./Action", "./Item", "./Logger", "./Tile"], function (require, exports, IAction_1, IPlayer_1, IGame_1, ITerrain_1, Terrains_1, PathOverlayFootPrints_1, TileHelpers_1, Direction_1, IObjective_1, Navigation_1, Action_1, Item_1, Logger_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.movementUtilities = exports.MoveResult = void 0;
    var MoveResult;
    (function (MoveResult) {
        MoveResult[MoveResult["NoTarget"] = 0] = "NoTarget";
        MoveResult[MoveResult["NoPath"] = 1] = "NoPath";
        MoveResult[MoveResult["Moving"] = 2] = "Moving";
        MoveResult[MoveResult["Complete"] = 3] = "Complete";
    })(MoveResult = exports.MoveResult || (exports.MoveResult = {}));
    class MovementUtilities {
        constructor() {
            this.movementOverlays = [];
            this.cachedPaths = new Map();
        }
        clearCache() {
            this.cachedPaths.clear();
        }
        resetMovementOverlays() {
            for (const trackedOverlay of this.movementOverlays) {
                TileHelpers_1.default.Overlay.remove(trackedOverlay.tile, trackedOverlay.overlay);
            }
            this.movementOverlays.length = 0;
            if (game.playing) {
                game.updateView(IGame_1.RenderSource.Mod, false);
            }
        }
        clearOverlay(tile) {
            const trackedOverlay = this.movementOverlays.find(tracked => tracked.tile === tile);
            if (trackedOverlay !== undefined) {
                TileHelpers_1.default.Overlay.remove(tile, trackedOverlay.overlay);
            }
        }
        updateOverlay(path) {
            this.resetMovementOverlays();
            for (let i = 1; i < path.length; i++) {
                const lastPos = path[i - 1];
                const pos = path[i];
                const nextPos = path[i + 1];
                const tile = game.getTile(pos.x, pos.y, localPlayer.z);
                const overlay = PathOverlayFootPrints_1.default(i, path.length, pos, lastPos, nextPos, false);
                if (overlay) {
                    TileHelpers_1.default.Overlay.add(tile, overlay);
                    this.movementOverlays.push({
                        tile: tile,
                        overlay: overlay,
                    });
                }
            }
        }
        async getMovementPath(context, target, moveAdjacentToTarget) {
            if (context.player.x === target.x && context.player.y === target.y && context.player.z === target.z && !moveAdjacentToTarget) {
                return {
                    difficulty: 0,
                };
            }
            const pathId = `${target.x},${target.y},${target.z}:${moveAdjacentToTarget ? "A" : "O"}`;
            let movementPath;
            if (this.cachedPaths.has(pathId)) {
                movementPath = this.cachedPaths.get(pathId);
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
                this.cachedPaths.set(pathId, movementPath);
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
        async moveToFaceTarget(context, target) {
            return this.move(context, target, true);
        }
        async moveToTarget(context, target) {
            return this.move(context, target, false);
        }
        async move(context, target, moveAdjacentToTarget, force, walkOnce) {
            var _a;
            const movementPath = await this.getMovementPath(context, target, moveAdjacentToTarget);
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
                                    await Action_1.actionUtilities.executeAction(context, IAction_1.ActionType.UpdateDirection, (context, action) => {
                                        action.execute(context.player, direction, undefined);
                                    });
                                }
                                const actionType = terrainDescription.gather ? IAction_1.ActionType.Gather : IAction_1.ActionType.Dig;
                                await Action_1.actionUtilities.executeAction(context, actionType, (context, action) => {
                                    action.execute(context.player, Item_1.itemUtilities.getBestToolForTerrainGather(context, tileType));
                                });
                                return MoveResult.Moving;
                            }
                            Logger_1.log.info("Terrain is blocking movement", ITerrain_1.TerrainType[tileType]);
                            return MoveResult.NoPath;
                        }
                        else if (doodad === null || doodad === void 0 ? void 0 : doodad.blocksMove()) {
                            if (direction !== context.player.facingDirection) {
                                await Action_1.actionUtilities.executeAction(context, IAction_1.ActionType.UpdateDirection, (context, action) => {
                                    action.execute(context.player, direction, undefined);
                                });
                            }
                            if (doodad.canPickup(context.player)) {
                                Logger_1.log.info("Picking up doodad", Direction_1.Direction[direction]);
                                await Action_1.actionUtilities.executeAction(context, IAction_1.ActionType.Pickup, (context, action) => {
                                    action.execute(context.player);
                                });
                            }
                            else if (Tile_1.tileUtilities.hasCorpses(nextTile)) {
                                Logger_1.log.info("Carving corpse on top of doodad blocking the path", Direction_1.Direction[direction]);
                                const tool = Item_1.itemUtilities.getBestTool(context, IAction_1.ActionType.Carve);
                                if (!tool) {
                                    Logger_1.log.info("Missing tool for carve");
                                    return MoveResult.NoPath;
                                }
                                await Action_1.actionUtilities.executeAction(context, IAction_1.ActionType.Carve, (context, action) => {
                                    action.execute(context.player, tool);
                                });
                            }
                            else {
                                Logger_1.log.info("Gathering from doodad blocking the path", Direction_1.Direction[direction]);
                                await Action_1.actionUtilities.executeAction(context, IAction_1.ActionType.Gather, (context, action) => {
                                    action.execute(context.player, Item_1.itemUtilities.getBestToolForDoodadGather(context, doodad));
                                });
                            }
                            return MoveResult.Moving;
                        }
                        else if (nextTile.creature) {
                            await Action_1.actionUtilities.executeAction(context, IAction_1.ActionType.Move, (context, action) => {
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
                        this.updateOverlay(movementPath.path);
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
                        if (walkOnce) {
                            context.player.walkAlongPath([nextPosition], true);
                        }
                        else {
                            context.player.walkAlongPath(path, true);
                        }
                    }
                    return MoveResult.Moving;
                }
            }
            if (moveAdjacentToTarget) {
                const direction = IPlayer_1.getDirectionFromMovement(target.x - context.player.x, target.y - context.player.y);
                if (direction !== context.player.facingDirection) {
                    await Action_1.actionUtilities.executeAction(context, IAction_1.ActionType.UpdateDirection, (context, action) => {
                        action.execute(context.player, direction, undefined);
                    });
                }
            }
            return MoveResult.Complete;
        }
    }
    exports.movementUtilities = new MovementUtilities();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbGl0aWVzL01vdmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUF5QkEsSUFBWSxVQUtYO0lBTEQsV0FBWSxVQUFVO1FBQ2xCLG1EQUFRLENBQUE7UUFDUiwrQ0FBTSxDQUFBO1FBQ04sK0NBQU0sQ0FBQTtRQUNOLG1EQUFRLENBQUE7SUFDWixDQUFDLEVBTFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFLckI7SUFPRCxNQUFNLGlCQUFpQjtRQUF2QjtZQUVZLHFCQUFnQixHQUFzQixFQUFFLENBQUM7WUFFekMsZ0JBQVcsR0FBNEMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQTZRN0UsQ0FBQztRQTNRVSxVQUFVO1lBQ2IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRU0scUJBQXFCO1lBQ3hCLEtBQUssTUFBTSxjQUFjLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUNoRCxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDM0U7WUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUVqQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUM1QztRQUNMLENBQUM7UUFFTSxZQUFZLENBQUMsSUFBVztZQUMzQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztZQUNwRixJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQzlC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