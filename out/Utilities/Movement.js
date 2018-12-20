var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "entity/IEntity", "newui/screen/screens/game/util/movement/PathOverlayFootPrints", "player/IPlayer", "tile/Terrains", "utilities/math/Vector2", "utilities/TileHelpers", "../IObjective", "../ITars", "../Navigation", "./Action", "./Logger", "./Object"], function (require, exports, IAction_1, IEntity_1, PathOverlayFootPrints_1, IPlayer_1, Terrains_1, Vector2_1, TileHelpers_1, IObjective_1, ITars_1, Navigation_1, Action_1, Logger_1, Object_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MoveResult;
    (function (MoveResult) {
        MoveResult[MoveResult["NoTarget"] = 0] = "NoTarget";
        MoveResult[MoveResult["NoPath"] = 1] = "NoPath";
        MoveResult[MoveResult["Moving"] = 2] = "Moving";
        MoveResult[MoveResult["Complete"] = 3] = "Complete";
    })(MoveResult = exports.MoveResult || (exports.MoveResult = {}));
    function findTarget(start, isTarget, maxTilesChecked = ITars_1.defaultMaxTilesChecked) {
        return TileHelpers_1.default.findMatchingTile(start, isTarget, maxTilesChecked, (point, tile) => {
            const tileType = TileHelpers_1.default.getType(tile);
            const terrainDescription = Terrains_1.default[tileType];
            if (terrainDescription && terrainDescription.water) {
                return false;
            }
            return true;
        });
    }
    exports.findTarget = findTarget;
    function findAndMoveToTarget(isTarget, maxTilesChecked = ITars_1.defaultMaxTilesChecked, start = localPlayer) {
        return __awaiter(this, void 0, void 0, function* () {
            return moveToTargetWithRetries((ignoredTiles) => findTarget(start, (point, tile) => ignoredTiles.indexOf(tile) === -1 && isTarget(point, tile), maxTilesChecked));
        });
    }
    exports.findAndMoveToTarget = findAndMoveToTarget;
    function findAndMoveToFaceTarget(isTarget, maxTilesChecked = ITars_1.defaultMaxTilesChecked, start = localPlayer) {
        return __awaiter(this, void 0, void 0, function* () {
            return moveToFaceTargetWithRetries((ignoredTiles) => findTarget(start, (point, tile) => ignoredTiles.indexOf(tile) === -1 && isTarget(point, tile), maxTilesChecked));
        });
    }
    exports.findAndMoveToFaceTarget = findAndMoveToFaceTarget;
    function findAndMoveToCreature(id, isTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            return _findAndMoveToObject(`Creature:${id}`, game.creatures.filter(c => c !== undefined && (c.ai & IEntity_1.AiType.Hidden) === 0), isTarget, false);
        });
    }
    exports.findAndMoveToCreature = findAndMoveToCreature;
    function findAndMoveToFaceCorpse(id, isTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            return _findAndMoveToObject(`Corpse:${id}`, game.corpses, isTarget, true);
        });
    }
    exports.findAndMoveToFaceCorpse = findAndMoveToFaceCorpse;
    function moveToTargetWithRetries(getTarget, maxRetries = 5) {
        return __awaiter(this, void 0, void 0, function* () {
            return _moveToTargetWithRetries(getTarget, false, maxRetries);
        });
    }
    exports.moveToTargetWithRetries = moveToTargetWithRetries;
    function moveToFaceTargetWithRetries(getTarget, maxRetries = 5) {
        return __awaiter(this, void 0, void 0, function* () {
            return _moveToTargetWithRetries(getTarget, true, maxRetries);
        });
    }
    exports.moveToFaceTargetWithRetries = moveToFaceTargetWithRetries;
    function _findAndMoveToObject(id, allObjects, isTarget, moveAdjacentToTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            const objects = Object_1.findObjects(id, allObjects, isTarget);
            if (objects.length > 0) {
                for (let i = 0; i < Math.min(objects.length, 2); i++) {
                    const result = yield (moveAdjacentToTarget ? moveToFaceTarget(objects[i]) : moveToTarget(objects[i]));
                    if (result === MoveResult.Moving || result === MoveResult.Complete) {
                        return result;
                    }
                }
                return MoveResult.NoPath;
            }
            return MoveResult.NoTarget;
        });
    }
    function _moveToTargetWithRetries(getTarget, moveAdjacentToTarget, maxRetries = 5) {
        return __awaiter(this, void 0, void 0, function* () {
            const ignoredTiles = [];
            let result = MoveResult.NoPath;
            while (result === MoveResult.NoPath && maxRetries > 0) {
                maxRetries--;
                const target = getTarget(ignoredTiles);
                if (target) {
                    result = yield (moveAdjacentToTarget ? moveToFaceTarget(target) : moveToTarget(target));
                    if (result === MoveResult.NoPath) {
                        Logger_1.log("Cannot path to target, ignoring", target);
                        ignoredTiles.push(game.getTileFromPoint(target));
                    }
                    else {
                        return result;
                    }
                }
                else {
                    return MoveResult.NoTarget;
                }
            }
            return MoveResult.NoTarget;
        });
    }
    let cachedPaths;
    const movementOverlays = [];
    function resetMovementOverlays() {
        for (const trackedOverlay of movementOverlays) {
            TileHelpers_1.default.Overlay.remove(trackedOverlay.tile, trackedOverlay.overlay);
        }
        movementOverlays.length = 0;
        game.updateView(false);
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
            const overlay = PathOverlayFootPrints_1.default(i, path.length, pos, lastPos, nextPos);
            if (overlay) {
                TileHelpers_1.default.Overlay.add(tile, overlay);
                movementOverlays.push({
                    tile: tile,
                    overlay: overlay
                });
            }
        }
    }
    exports.updateOverlay = updateOverlay;
    function resetCachedPaths() {
        cachedPaths = {};
    }
    exports.resetCachedPaths = resetCachedPaths;
    function getMovementPath(target, moveAdjacentToTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            if (localPlayer.x === target.x && localPlayer.y === target.y && localPlayer.z === target.z && !moveAdjacentToTarget) {
                return {
                    difficulty: 1
                };
            }
            let movementPath;
            const pathId = `${target.x},${target.y},${target.z}`;
            if (pathId in cachedPaths) {
                movementPath = cachedPaths[pathId];
            }
            else {
                const navigation = Navigation_1.getNavigation();
                const ends = navigation.getValidPoints(target, !moveAdjacentToTarget).sort((a, b) => Vector2_1.default.squaredDistance(localPlayer, a) > Vector2_1.default.squaredDistance(localPlayer, b) ? 1 : -1);
                if (ends.length === 0) {
                    return {
                        difficulty: IObjective_1.missionImpossible
                    };
                }
                for (const end of ends) {
                    movementPath = yield navigation.findPath(end, localPlayer);
                    if (movementPath) {
                        break;
                    }
                }
                cachedPaths[pathId] = movementPath;
            }
            if (movementPath) {
                return {
                    difficulty: Vector2_1.default.squaredDistance(localPlayer, target),
                    path: movementPath
                };
            }
            return {
                difficulty: IObjective_1.missionImpossible
            };
        });
    }
    exports.getMovementPath = getMovementPath;
    function moveToFaceTarget(target) {
        return __awaiter(this, void 0, void 0, function* () {
            return move(target, true);
        });
    }
    exports.moveToFaceTarget = moveToFaceTarget;
    function moveToTarget(target) {
        return __awaiter(this, void 0, void 0, function* () {
            return move(target, false);
        });
    }
    exports.moveToTarget = moveToTarget;
    function moveAwayFromTarget(target) {
        return __awaiter(this, void 0, void 0, function* () {
            const direction = IPlayer_1.getDirectionFromMovement(localPlayer.x - target.x, localPlayer.y - target.y);
            if (direction !== localPlayer.facingDirection) {
                yield Action_1.executeAction(IAction_1.ActionType.UpdateDirection, action => action.execute(localPlayer, direction, undefined));
            }
            yield Action_1.executeAction(IAction_1.ActionType.Move, action => action.execute(localPlayer, direction));
            return MoveResult.Complete;
        });
    }
    exports.moveAwayFromTarget = moveAwayFromTarget;
    function move(target, moveAdjacentToTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            const moveCompleted = localPlayer.x === target.x && localPlayer.y === target.y && localPlayer.z === target.z && !moveAdjacentToTarget;
            if (!moveCompleted) {
                const movementPath = yield getMovementPath(target, moveAdjacentToTarget);
                if (!movementPath.path) {
                    return MoveResult.NoPath;
                }
                const pathLength = movementPath.path.length;
                const end = movementPath.path[pathLength - 1];
                if (!end) {
                    Logger_1.log("Broken path!", pathLength, target.x, target.x, target.y, localPlayer.x, localPlayer.y, localPlayer.z);
                    return MoveResult.NoPath;
                }
                const atEnd = localPlayer.x === end.x && localPlayer.y === end.y;
                if (!atEnd) {
                    if (!localPlayer.hasWalkPath()) {
                        updateOverlay(movementPath.path);
                        localPlayer.walkAlongPath(movementPath.path);
                    }
                    return MoveResult.Moving;
                }
            }
            if (moveAdjacentToTarget) {
                const direction = IPlayer_1.getDirectionFromMovement(target.x - localPlayer.x, target.y - localPlayer.y);
                if (direction !== localPlayer.facingDirection) {
                    yield Action_1.executeAction(IAction_1.ActionType.UpdateDirection, action => action.execute(localPlayer, direction, undefined));
                }
            }
            return MoveResult.Complete;
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVXRpbGl0aWVzL01vdmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBdUJBLElBQVksVUFLWDtJQUxELFdBQVksVUFBVTtRQUNyQixtREFBUSxDQUFBO1FBQ1IsK0NBQU0sQ0FBQTtRQUNOLCtDQUFNLENBQUE7UUFDTixtREFBUSxDQUFBO0lBQ1QsQ0FBQyxFQUxXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBS3JCO0lBRUQsU0FBZ0IsVUFBVSxDQUFDLEtBQWUsRUFBRSxRQUFtRCxFQUFFLGtCQUEwQiw4QkFBc0I7UUFDaEosT0FBTyxxQkFBVyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3JGLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNDLE1BQU0sa0JBQWtCLEdBQUcsa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5QyxJQUFJLGtCQUFrQixJQUFJLGtCQUFrQixDQUFDLEtBQUssRUFBRTtnQkFDbkQsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBVkQsZ0NBVUM7SUFFRCxTQUFzQixtQkFBbUIsQ0FBQyxRQUFtRCxFQUFFLGtCQUEwQiw4QkFBc0IsRUFBRSxRQUFrQixXQUFXOztZQUM3SyxPQUFPLHVCQUF1QixDQUFDLENBQUMsWUFBcUIsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssRUFB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