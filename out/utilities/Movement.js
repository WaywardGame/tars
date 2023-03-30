define(["require", "exports", "game/tile/ITerrain", "renderer/IRenderer", "ui/screen/screens/game/util/movement/PathOverlayFootPrints", "utilities/math/Direction", "game/entity/action/actions/Dig", "game/entity/action/actions/Mine", "game/entity/action/actions/UpdateDirection", "game/entity/action/actions/Move", "game/entity/action/actions/OpenDoor", "../core/objective/IObjective", "game/entity/action/actions/Butcher", "game/entity/action/actions/PickUp", "game/entity/action/actions/Chop", "game/entity/action/actions/Equip"], function (require, exports, ITerrain_1, IRenderer_1, PathOverlayFootPrints_1, Direction_1, Dig_1, Mine_1, UpdateDirection_1, Move_1, OpenDoor_1, IObjective_1, Butcher_1, PickUp_1, Chop_1, Equip_1) {
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
                trackedOverlay.tile.removeOverlay(trackedOverlay.overlay);
            }
            this.movementOverlays.length = 0;
            if (game.playing) {
                renderers.updateView(undefined, IRenderer_1.RenderSource.Mod, false);
            }
        }
        clearOverlay(tile) {
            const trackedOverlay = this.movementOverlays.find(tracked => tracked.tile === tile);
            if (trackedOverlay !== undefined) {
                tile.removeOverlay(trackedOverlay.overlay);
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
                    tile.addOrUpdateOverlay(overlay);
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
                context.log.warn("Updating origin immediately due to mismatch", origin, context.human.point);
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
                        const direction = context.island.getDirectionFromMovement(nextPosition.x - context.human.x, nextPosition.y - context.human.y);
                        const nextTile = context.human.island.getTile(nextPosition.x, nextPosition.y, target.z);
                        const doodad = nextTile.doodad;
                        const tileType = nextTile.type;
                        const terrainDescription = nextTile.description();
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
                            const terrainDescription = tile.description();
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
                const direction = context.island.getDirectionFromMovement(target.x - context.human.x, target.y - context.human.y);
                if (direction !== context.human.facingDirection) {
                    await context.utilities.action.executeAction(context, UpdateDirection_1.default, [direction]);
                }
            }
            return MoveResult.Complete;
        }
    }
    exports.MovementUtilities = MovementUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbGl0aWVzL01vdmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFxQkEsSUFBWSxVQUtYO0lBTEQsV0FBWSxVQUFVO1FBQ2xCLG1EQUFRLENBQUE7UUFDUiwrQ0FBTSxDQUFBO1FBQ04sK0NBQU0sQ0FBQTtRQUNOLG1EQUFRLENBQUE7SUFDWixDQUFDLEVBTFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFLckI7SUFPRCxNQUFhLGlCQUFpQjtRQUE5QjtZQUVZLHFCQUFnQixHQUFzQixFQUFFLENBQUM7WUFFaEMsZ0JBQVcsR0FBd0YsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM3RyxlQUFVLEdBQTRCLElBQUksR0FBRyxFQUFFLENBQUM7UUFnU3JFLENBQUM7UUE5UlUsVUFBVTtZQUNiLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRU0scUJBQXFCO1lBQ3hCLEtBQUssTUFBTSxjQUFjLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUNoRCxjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0Q7WUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUVqQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2QsU0FBUyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsd0JBQVksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDNUQ7UUFDTCxDQUFDO1FBRU0sWUFBWSxDQUFDLElBQVU7WUFDMUIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8s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