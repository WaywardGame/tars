var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./Logger", "./Action", "player/IPlayer", "Enums", "utilities/TileHelpers", "tile/Terrains", "../ITars", "entity/IEntity", "./Object", "newui/screen/screens/game/util/movement/PathOverlayFootPrints", "../Navigation", "../IObjective", "utilities/math/Vector2"], function (require, exports, Logger_1, Action_1, IPlayer_1, Enums_1, TileHelpers_1, Terrains_1, ITars_1, IEntity_1, Object_1, PathOverlayFootPrints_1, Navigation_1, IObjective_1, Vector2_1) {
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
        for (const tile of movementOverlays) {
            delete tile.overlay;
        }
        movementOverlays.length = 0;
        game.updateView(false);
    }
    exports.resetMovementOverlays = resetMovementOverlays;
    function updateOverlay(path) {
        resetMovementOverlays();
        for (let i = 1; i < path.length; i++) {
            const lastPos = path[i - 1];
            const pos = path[i];
            const nextPos = path[i + 1];
            const tile = game.getTile(pos.x, pos.y, localPlayer.z);
            tile.overlay = PathOverlayFootPrints_1.default(i, path.length, pos, lastPos, nextPos);
            if (tile.overlay) {
                movementOverlays.push(tile);
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
                yield Action_1.executeAction(Enums_1.ActionType.UpdateDirection, {
                    direction: direction,
                    bypass: true
                });
            }
            yield Action_1.executeAction(Enums_1.ActionType.Move, {
                direction: direction,
                bypass: true
            });
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
                    yield Action_1.executeAction(Enums_1.ActionType.UpdateDirection, {
                        direction: direction,
                        bypass: true
                    });
                }
            }
            return MoveResult.Complete;
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVXRpbGl0aWVzL01vdmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBdUJBLElBQVksVUFLWDtJQUxELFdBQVksVUFBVTtRQUNyQixtREFBUSxDQUFBO1FBQ1IsK0NBQU0sQ0FBQTtRQUNOLCtDQUFNLENBQUE7UUFDTixtREFBUSxDQUFBO0lBQ1QsQ0FBQyxFQUxXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBS3JCO0lBRUQsb0JBQTJCLEtBQWUsRUFBRSxRQUFtRCxFQUFFLGtCQUEwQiw4QkFBc0I7UUFDaEosT0FBTyxxQkFBVyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3JGLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNDLE1BQU0sa0JBQWtCLEdBQUcsa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5QyxJQUFJLGtCQUFrQixJQUFJLGtCQUFrQixDQUFDLEtBQUssRUFBRTtnQkFDbkQsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBVkQsZ0NBVUM7SUFHRCw2QkFBMEMsUUFBbUQsRUFBRSxrQkFBMEIsOEJBQXNCLEVBQUUsUUFBa0IsV0FBVzs7WUFDN0ssT0FBTyx1QkFBdUIsQ0FBQyxDQUFDLFlBQXFCLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsZUFB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