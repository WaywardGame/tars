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
        async ensureOrigin(context) {
            const navigation = context.utilities.navigation;
            const origin = navigation.getOrigin();
            if (!origin || (origin.x !== context.human.x || origin.y !== context.human.y || origin.z !== context.human.z)) {
                Logger_1.log.warn("Updating origin immediately due to mismatch", origin, context.human.getPoint());
                await navigation.updateOrigin(context.human);
            }
        }
        async getMovementPath(context, target, moveAdjacentToTarget, reverse = false) {
            if (context.human.x === target.x && context.human.y === target.y && context.human.z === target.z && !moveAdjacentToTarget && !reverse) {
                return {
                    difficulty: 0,
                };
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
            switch (movementPath) {
                case IObjective_1.ObjectiveResult.Complete:
                    return {
                        difficulty: 0,
                    };
                case IObjective_1.ObjectiveResult.Impossible:
                    return {
                        difficulty: IObjective_1.ObjectiveResult.Impossible,
                    };
                default:
                    return {
                        difficulty: movementPath.score,
                        path: movementPath.path,
                    };
            }
        }
        async _getMovementPath(context, target, moveAdjacentToTarget) {
            const navigation = context.utilities.navigation;
            await this.ensureOrigin(context);
            await context.utilities.ensureSailingMode(!!context.human.vehicleItemReference);
            const ends = navigation.getValidPoints(target, !moveAdjacentToTarget);
            if (ends.length === 0) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            for (const end of ends) {
                if (context.human.x === end.x && context.human.y === end.y && context.human.z === end.z) {
                    return IObjective_1.ObjectiveResult.Complete;
                }
            }
            let results = (await Promise.all(ends.map(async (end) => navigation.findPath(end))))
                .filter(result => result !== undefined);
            for (const result of results) {
                const pathLength = result.path.length;
                result.score = Math.round(result.score - pathLength + Math.pow(pathLength, 1.1));
            }
            results = results.sort((a, b) => a.score - b.score);
            if (results.length > 0) {
                return results[0];
            }
            return IObjective_1.ObjectiveResult.Impossible;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbGl0aWVzL01vdmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFxQkEsSUFBWSxVQUtYO0lBTEQsV0FBWSxVQUFVO1FBQ2xCLG1EQUFRLENBQUE7UUFDUiwrQ0FBTSxDQUFBO1FBQ04sK0NBQU0sQ0FBQTtRQUNOLG1EQUFRLENBQUE7SUFDWixDQUFDLEVBTFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFLckI7SUFPRCxNQUFhLGlCQUFpQjtRQUE5QjtZQUVZLHFCQUFnQixHQUFzQixFQUFFLENBQUM7WUFFaEMsZ0JBQVcsR0FBd0YsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQTRUbEksQ0FBQztRQTFUVSxVQUFVO1lBQ2IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRU0scUJBQXFCO1lBQ3hCLEtBQUssTUFBTSxjQUFjLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUNoRCxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDM0U7WUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUVqQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLFVBQVUsQ0FBQyx3QkFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUM1QztRQUNMLENBQUM7UUFFTSxZQUFZLENBQUMsSUFBVztZQUMzQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztZQUNwRixJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQzlC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