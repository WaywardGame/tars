define(["require", "exports", "game/entity/action/IAction", "game/entity/player/IPlayer", "game/tile/ITerrain", "game/tile/Terrains", "renderer/IRenderer", "ui/screen/screens/game/util/movement/PathOverlayFootPrints", "utilities/game/TileHelpers", "utilities/math/Direction", "../core/objective/IObjective", "./Logger"], function (require, exports, IAction_1, IPlayer_1, ITerrain_1, Terrains_1, IRenderer_1, PathOverlayFootPrints_1, TileHelpers_1, Direction_1, IObjective_1, Logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MovementUtilities = exports.MoveResult = void 0;
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
                game.updateView(IRenderer_1.RenderSource.Mod, false);
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
                const tile = localIsland.getTile(pos.x, pos.y, localPlayer.z);
                const overlay = (0, PathOverlayFootPrints_1.default)(i, path.length, pos, lastPos, nextPos, false);
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
            if (context.human.x === target.x && context.human.y === target.y && context.human.z === target.z && !moveAdjacentToTarget) {
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
                const navigation = context.utilities.navigation;
                await context.utilities.ensureSailingMode(!!context.human.vehicleItemReference);
                const ends = navigation.getValidPoints(target, !moveAdjacentToTarget);
                if (ends.length === 0) {
                    return {
                        difficulty: IObjective_1.ObjectiveResult.Impossible,
                    };
                }
                for (const end of ends) {
                    if (context.human.x === end.x && context.human.y === end.y && context.human.z === end.z) {
                        return {
                            difficulty: 0,
                        };
                    }
                }
                const origin = navigation.getOrigin();
                if (!origin || (origin.x !== context.human.x || origin.y !== context.human.y || origin.z !== context.human.z)) {
                    Logger_1.log.warn("Updating origin immediately due to mismatch", origin, context.human.getPoint());
                    await navigation.updateOrigin(context.human);
                }
                let results = (await Promise.all(ends.map(async (end) => navigation.findPath(end))))
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
            const movementPath = await this.getMovementPath(context, target, moveAdjacentToTarget);
            if (movementPath.difficulty !== 0) {
                if (!movementPath.path) {
                    return MoveResult.NoPath;
                }
                const pathLength = movementPath.path.length;
                const end = movementPath.path[pathLength - 1];
                if (!end) {
                    Logger_1.log.info("Broken path!", pathLength, movementPath.path, target.x, target.y, target.z, context.human.x, context.human.y, context.human.z);
                    return MoveResult.NoPath;
                }
                const atEnd = context.human.x === end.x && context.human.y === end.y;
                if (!atEnd) {
                    const nextPosition = movementPath.path[1];
                    if (nextPosition) {
                        const direction = (0, IPlayer_1.getDirectionFromMovement)(nextPosition.x - context.human.x, nextPosition.y - context.human.y);
                        const nextTile = context.human.island.getTile(nextPosition.x, nextPosition.y, target.z);
                        const doodad = nextTile.doodad;
                        const tileType = TileHelpers_1.default.getType(nextTile);
                        const terrainDescription = Terrains_1.default[tileType];
                        if (terrainDescription && !terrainDescription.passable && !terrainDescription.water) {
                            if (terrainDescription.gather) {
                                if (direction !== context.human.facingDirection) {
                                    await context.utilities.action.executeAction(context, IAction_1.ActionType.UpdateDirection, (context, action) => {
                                        action.execute(context.actionExecutor, direction, undefined);
                                        return IObjective_1.ObjectiveResult.Complete;
                                    });
                                }
                                const actionType = terrainDescription.gather ? IAction_1.ActionType.Mine : IAction_1.ActionType.Dig;
                                await context.utilities.action.executeAction(context, actionType, (context, action) => {
                                    action.execute(context.actionExecutor, context.utilities.item.getBestToolForTerrainGather(context, tileType));
                                    return IObjective_1.ObjectiveResult.Complete;
                                });
                                return MoveResult.Moving;
                            }
                            Logger_1.log.info("Terrain is blocking movement", ITerrain_1.TerrainType[tileType]);
                            return MoveResult.NoPath;
                        }
                        else if (doodad?.blocksMove()) {
                            if (direction !== context.human.facingDirection) {
                                await context.utilities.action.executeAction(context, IAction_1.ActionType.UpdateDirection, (context, action) => {
                                    action.execute(context.actionExecutor, direction, undefined);
                                    return IObjective_1.ObjectiveResult.Complete;
                                });
                            }
                            if (doodad.canPickup(context.human)) {
                                const doodadDescription = doodad.description();
                                if (doodadDescription && (doodadDescription.isDoor || doodadDescription.isGate) && doodadDescription.isClosed) {
                                    Logger_1.log.info("Opening doodad blocking the path", Direction_1.Direction[direction]);
                                    await context.utilities.action.executeAction(context, IAction_1.ActionType.OpenDoor, (context, action) => {
                                        action.execute(context.actionExecutor);
                                        return IObjective_1.ObjectiveResult.Complete;
                                    });
                                }
                                else {
                                    Logger_1.log.info("Picking up doodad blocking the path", Direction_1.Direction[direction]);
                                    await context.utilities.action.executeAction(context, IAction_1.ActionType.Pickup, (context, action) => {
                                        action.execute(context.actionExecutor);
                                        return IObjective_1.ObjectiveResult.Complete;
                                    });
                                }
                            }
                            else if (context.utilities.tile.hasCorpses(nextTile)) {
                                Logger_1.log.info("Carving corpse on top of doodad blocking the path", Direction_1.Direction[direction]);
                                const tool = context.utilities.item.getBestTool(context, IAction_1.ActionType.Butcher);
                                if (!tool) {
                                    Logger_1.log.info("Missing butchering tool");
                                    return MoveResult.NoPath;
                                }
                                await context.utilities.action.executeAction(context, IAction_1.ActionType.Butcher, (context, action) => {
                                    action.execute(context.actionExecutor, tool);
                                    return IObjective_1.ObjectiveResult.Complete;
                                });
                            }
                            else {
                                Logger_1.log.info("Gathering from doodad blocking the path", Direction_1.Direction[direction]);
                                await context.utilities.action.executeAction(context, IAction_1.ActionType.Chop, (context, action) => {
                                    action.execute(context.actionExecutor, context.utilities.item.getBestToolForDoodadGather(context, doodad));
                                    return IObjective_1.ObjectiveResult.Complete;
                                });
                            }
                            return MoveResult.Moving;
                        }
                        else if (nextTile.creature) {
                            const player = context.human.asPlayer;
                            if (player) {
                                await context.utilities.action.executeAction(context, IAction_1.ActionType.Move, (context, action) => {
                                    action.execute(player, direction);
                                    return IObjective_1.ObjectiveResult.Complete;
                                });
                            }
                            return MoveResult.Moving;
                        }
                        else if (nextTile.npc && nextTile.npc !== context.human) {
                            Logger_1.log.warn("No path through npc");
                            return MoveResult.NoPath;
                        }
                    }
                    if (force || !context.human.hasWalkPath()) {
                        this.updateOverlay(movementPath.path);
                        let path = movementPath.path;
                        for (let i = 2; i < path.length; i++) {
                            const position = path[i];
                            const tile = context.human.island.getTile(position.x, position.y, target.z);
                            const tileType = TileHelpers_1.default.getType(tile);
                            const terrainDescription = Terrains_1.default[tileType];
                            if (tile.doodad?.blocksMove() || (terrainDescription && !terrainDescription.passable && !terrainDescription.water)) {
                                path = path.slice(0, i);
                                break;
                            }
                        }
                        if (walkOnce) {
                            if (!nextPosition) {
                                Logger_1.log.warn("No nextPosition");
                                return MoveResult.NoPath;
                            }
                            path = [nextPosition];
                        }
                        if (!context.options.freeze) {
                            context.human.walkAlongPath(path, true);
                        }
                    }
                    return MoveResult.Moving;
                }
            }
            if (moveAdjacentToTarget) {
                const direction = (0, IPlayer_1.getDirectionFromMovement)(target.x - context.human.x, target.y - context.human.y);
                if (direction !== context.human.facingDirection) {
                    await context.utilities.action.executeAction(context, IAction_1.ActionType.UpdateDirection, (context, action) => {
                        action.execute(context.actionExecutor, direction, undefined);
                        return IObjective_1.ObjectiveResult.Complete;
                    });
                }
            }
            return MoveResult.Complete;
        }
    }
    exports.MovementUtilities = MovementUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbGl0aWVzL01vdmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFxQkEsSUFBWSxVQUtYO0lBTEQsV0FBWSxVQUFVO1FBQ2xCLG1EQUFRLENBQUE7UUFDUiwrQ0FBTSxDQUFBO1FBQ04sK0NBQU0sQ0FBQTtRQUNOLG1EQUFRLENBQUE7SUFDWixDQUFDLEVBTFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFLckI7SUFPRCxNQUFhLGlCQUFpQjtRQUE5QjtZQUVZLHFCQUFnQixHQUFzQixFQUFFLENBQUM7WUFFaEMsZ0JBQVcsR0FBNEMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQXNUdEYsQ0FBQztRQXBUVSxVQUFVO1lBQ2IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRU0scUJBQXFCO1lBQ3hCLEtBQUssTUFBTSxjQUFjLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUNoRCxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDM0U7WUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUVqQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLFVBQVUsQ0FBQyx3QkFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUM1QztRQUNMLENBQUM7UUFFTSxZQUFZLENBQUMsSUFBVztZQUMzQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztZQUNwRixJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQzlC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