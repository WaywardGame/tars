define(["require", "exports", "game/entity/player/IPlayer", "game/tile/ITerrain", "game/tile/Terrains", "renderer/IRenderer", "ui/screen/screens/game/util/movement/PathOverlayFootPrints", "utilities/game/TileHelpers", "utilities/math/Direction", "game/entity/action/actions/Dig", "game/entity/action/actions/Mine", "game/entity/action/actions/UpdateDirection", "game/entity/action/actions/Move", "game/entity/action/actions/OpenDoor", "../core/objective/IObjective", "game/entity/action/actions/Butcher", "game/entity/action/actions/PickUp", "game/entity/action/actions/Chop", "game/entity/action/actions/Equip"], function (require, exports, IPlayer_1, ITerrain_1, Terrains_1, IRenderer_1, PathOverlayFootPrints_1, TileHelpers_1, Direction_1, Dig_1, Mine_1, UpdateDirection_1, Move_1, OpenDoor_1, IObjective_1, Butcher_1, PickUp_1, Chop_1, Equip_1) {
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
            this.cachedEnds = new Map();
        }
        clearCache() {
            this.cachedPaths.clear();
            this.cachedEnds.clear();
        }
        resetMovementOverlays() {
            for (const trackedOverlay of this.movementOverlays) {
                TileHelpers_1.default.Overlay.remove(trackedOverlay.tile, trackedOverlay.overlay);
            }
            this.movementOverlays.length = 0;
            if (game.playing) {
                renderers.updateView(IRenderer_1.RenderSource.Mod, false);
            }
        }
        clearOverlay(tile) {
            const trackedOverlay = this.movementOverlays.find(tracked => tracked.tile === tile);
            if (trackedOverlay !== undefined) {
                TileHelpers_1.default.Overlay.remove(tile, trackedOverlay.overlay);
            }
        }
        updateOverlay(context, path) {
            this.resetMovementOverlays();
            for (let i = 1; i < path.length; i++) {
                const lastPos = path[i - 1];
                const pos = path[i];
                const nextPos = path[i + 1];
                if (localPlayer.z !== pos.z) {
                    continue;
                }
                const overlay = (0, PathOverlayFootPrints_1.default)(i, path.length, pos, lastPos, nextPos, false);
                if (overlay) {
                    const tile = context.island.getTile(pos.x, pos.y, pos.z);
                    TileHelpers_1.default.Overlay.add(tile, overlay);
                    this.movementOverlays.push({
                        tile,
                        overlay,
                    });
                }
            }
        }
        ensureOrigin(context) {
            const navigation = context.utilities.navigation;
            const origin = navigation.getOrigin();
            if (!origin || (origin.x !== context.human.x || origin.y !== context.human.y || origin.z !== context.human.z)) {
                context.log.warn("Updating origin immediately due to mismatch", origin, context.human.getPoint());
                navigation.updateOrigin(context.human);
            }
        }
        getMovementEndPositions(context, target, moveAdjacentToTarget) {
            const pathId = `${target.x},${target.y},${target.z}:${moveAdjacentToTarget ? "A" : "O"}`;
            let ends = this.cachedEnds.get(pathId);
            if (ends === undefined) {
                ends = context.utilities.navigation.getValidPoints(context.island, target, moveAdjacentToTarget);
                this.cachedEnds.set(pathId, ends);
            }
            return ends;
        }
        async getMovementPath(context, target, moveAdjacentToTarget, reverse = false) {
            if (context.human.x === target.x && context.human.y === target.y && context.human.z === target.z && !moveAdjacentToTarget && !reverse) {
                return IObjective_1.ObjectiveResult.Complete;
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
        async _getMovementPath(context, target, moveAdjacentToTarget) {
            const navigation = context.utilities.navigation;
            this.ensureOrigin(context);
            await context.utilities.ensureSailingMode(!!context.human.vehicleItemReference);
            const ends = this.getMovementEndPositions(context, target, moveAdjacentToTarget);
            if (ends.length === 0) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            for (const end of ends) {
                if (context.human.x === end.x && context.human.y === end.y && context.human.z === end.z) {
                    return IObjective_1.ObjectiveResult.Complete;
                }
            }
            let results = ends.map(end => navigation.findPath(end))
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
            if (movementPath === IObjective_1.ObjectiveResult.Impossible) {
                return MoveResult.NoPath;
            }
            if (movementPath !== IObjective_1.ObjectiveResult.Complete) {
                const pathLength = movementPath.path.length;
                const end = movementPath.path[pathLength - 1];
                if (!end) {
                    context.log.info("Broken path!", pathLength, movementPath.path, target.x, target.y, target.z, context.human.x, context.human.y, context.human.z);
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
                        if (nextTile.creature) {
                            const handEquipmentChange = context.utilities.item.updateHandEquipment(context);
                            if (handEquipmentChange) {
                                context.log.info(`Going to equip ${handEquipmentChange.item} before attacking`);
                                await context.utilities.action.executeAction(context, Equip_1.default, [handEquipmentChange.item, handEquipmentChange.equipType]);
                            }
                            context.log.info("Walking into a creature");
                            await context.utilities.action.executeAction(context, Move_1.default, [direction]);
                            return MoveResult.Moving;
                        }
                        else if (terrainDescription && !terrainDescription.passable && !terrainDescription.water) {
                            if (terrainDescription.gather) {
                                if (direction !== context.human.facingDirection) {
                                    await context.utilities.action.executeAction(context, UpdateDirection_1.default, [direction]);
                                }
                                const actionType = terrainDescription.gather ? Mine_1.default : Dig_1.default;
                                await context.utilities.action.executeAction(context, actionType, [context.utilities.item.getBestToolForTerrainGather(context, tileType)]);
                                context.log.debug("Gathering from terrain that is blocking movement", ITerrain_1.TerrainType[tileType]);
                                return MoveResult.Moving;
                            }
                            context.log.info("Terrain is blocking movement", ITerrain_1.TerrainType[tileType]);
                            return MoveResult.NoPath;
                        }
                        else if (doodad?.blocksMove() && !doodad.isVehicle()) {
                            context.log.debug("Doodad is blocking path");
                            if (direction !== context.human.facingDirection) {
                                await context.utilities.action.executeAction(context, UpdateDirection_1.default, [direction]);
                            }
                            if (doodad.canPickUp(context.human)) {
                                const doodadDescription = doodad.description();
                                if (doodadDescription && (doodadDescription.isDoor || doodadDescription.isGate) && doodadDescription.isClosed) {
                                    context.log.info("Opening doodad blocking the path", Direction_1.Direction[direction]);
                                    await context.utilities.action.executeAction(context, OpenDoor_1.default, []);
                                }
                                else {
                                    context.log.info("Picking up doodad blocking the path", Direction_1.Direction[direction]);
                                    await context.utilities.action.executeAction(context, PickUp_1.default, []);
                                }
                            }
                            else if (context.utilities.tile.hasCorpses(nextTile)) {
                                context.log.info("Carving corpse on top of doodad blocking the path", Direction_1.Direction[direction]);
                                const tool = context.inventory.butcher;
                                if (!tool) {
                                    context.log.info("Missing butchering tool");
                                    return MoveResult.NoPath;
                                }
                                await context.utilities.action.executeAction(context, Butcher_1.default, [tool]);
                            }
                            else {
                                context.log.info("Gathering from doodad blocking the path", Direction_1.Direction[direction]);
                                await context.utilities.action.executeAction(context, Chop_1.default, [context.utilities.item.getBestToolForDoodadGather(context, doodad)]);
                            }
                            return MoveResult.Moving;
                        }
                        else if (nextTile.npc && nextTile.npc !== context.human) {
                            context.log.warn("No path through npc");
                            return MoveResult.NoPath;
                        }
                    }
                    if (force || !context.human.hasWalkPath()) {
                        this.updateOverlay(context, movementPath.path);
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
                                context.log.warn("No nextPosition");
                                return MoveResult.NoPath;
                            }
                            path = [nextPosition];
                        }
                        if (!context.options.freeze) {
                            context.tars.updateWalkPath(path);
                        }
                    }
                    return MoveResult.Moving;
                }
            }
            if (moveAdjacentToTarget) {
                const direction = (0, IPlayer_1.getDirectionFromMovement)(target.x - context.human.x, target.y - context.human.y);
                if (direction !== context.human.facingDirection) {
                    await context.utilities.action.executeAction(context, UpdateDirection_1.default, [direction]);
                }
            }
            return MoveResult.Complete;
        }
    }
    exports.MovementUtilities = MovementUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbGl0aWVzL01vdmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUF1QkEsSUFBWSxVQUtYO0lBTEQsV0FBWSxVQUFVO1FBQ2xCLG1EQUFRLENBQUE7UUFDUiwrQ0FBTSxDQUFBO1FBQ04sK0NBQU0sQ0FBQTtRQUNOLG1EQUFRLENBQUE7SUFDWixDQUFDLEVBTFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFLckI7SUFPRCxNQUFhLGlCQUFpQjtRQUE5QjtZQUVZLHFCQUFnQixHQUFzQixFQUFFLENBQUM7WUFFaEMsZ0JBQVcsR0FBd0YsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM3RyxlQUFVLEdBQTRCLElBQUksR0FBRyxFQUFFLENBQUM7UUFrU3JFLENBQUM7UUFoU1UsVUFBVTtZQUNiLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRU0scUJBQXFCO1lBQ3hCLEtBQUssTUFBTSxjQUFjLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUNoRCxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDM0U7WUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUVqQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2QsU0FBUyxDQUFDLFVBQVUsQ0FBQyx3QkFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNqRDtRQUNMLENBQUM7UUFFTSxZQUFZLENBQUMsSUFBVztZQUMzQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFF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