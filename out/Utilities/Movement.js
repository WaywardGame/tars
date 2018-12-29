var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "entity/IEntity", "newui/screen/screens/game/util/movement/PathOverlayFootPrints", "player/IPlayer", "tile/Terrains", "utilities/math/Vector2", "utilities/TileHelpers", "../IObjective", "../ITars", "../Navigation", "./Action", "./Logger", "./Object", "game/IGame"], function (require, exports, IAction_1, IEntity_1, PathOverlayFootPrints_1, IPlayer_1, Terrains_1, Vector2_1, TileHelpers_1, IObjective_1, ITars_1, Navigation_1, Action_1, Logger_1, Object_1, IGame_1) {
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
            const facingTile = localPlayer.getFacingTile();
            let retries = maxRetries;
            while (retries > 0) {
                retries--;
                const target = getTarget(ignoredTiles);
                if (!target) {
                    break;
                }
                const tile = game.getTileFromPoint(target);
                if (tile === facingTile) {
                    return MoveResult.Complete;
                }
                ignoredTiles.push(tile);
            }
            ignoredTiles.length = 0;
            retries = maxRetries;
            let result = MoveResult.NoPath;
            while (result === MoveResult.NoPath && retries > 0) {
                retries--;
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
        game.updateView(IGame_1.RenderSource.Mod, false);
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
                const ends = navigation.getValidPoints(target, !moveAdjacentToTarget).sort((a, b) => Vector2_1.default.distance(localPlayer, a) > Vector2_1.default.distance(localPlayer, b) ? 1 : -1);
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
                    difficulty: Vector2_1.default.distance(localPlayer, target),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVXRpbGl0aWVzL01vdmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBd0JBLElBQVksVUFLWDtJQUxELFdBQVksVUFBVTtRQUNyQixtREFBUSxDQUFBO1FBQ1IsK0NBQU0sQ0FBQTtRQUNOLCtDQUFNLENBQUE7UUFDTixtREFBUSxDQUFBO0lBQ1QsQ0FBQyxFQUxXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBS3JCO0lBRUQsU0FBZ0IsVUFBVSxDQUFDLEtBQWUsRUFBRSxRQUFtRCxFQUFFLGtCQUEwQiw4QkFBc0I7UUFDaEosT0FBTyxxQkFBVyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3JGLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNDLE1BQU0sa0JBQWtCLEdBQUcsa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5QyxJQUFJLGtCQUFrQixJQUFJLGtCQUFrQixDQUFDLEtBQUssRUFBRTtnQkFDbkQsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBVkQsZ0NBVUM7SUFFRCxTQUFzQixtQkFBbUIsQ0FBQyxRQUFtRCxFQUFFLGtCQUEwQiw4QkFBc0IsRUFBRSxRQUFrQixXQUFXOztZQUM3SyxPQUFPLHVCQUF1QixDQUFDLENBQUMsWUFBcUIsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzVLLENBQUM7S0FBQTtJQUZELGtEQUVDO0lBRUQsU0FBc0IsdUJBQXVCLENBQUMsUUFBbUQsRUFBRSxrQkFBMEIsOEJBQXNCLEVBQUUsUUFBa0IsV0FBVzs7WUFDakwsT0FBTywyQkFBMkIsQ0FBQyxDQUFDLFlBQXFCLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUNoTCxDQUFDO0tBQUE7SUFGRCwwREFFQztJQUVELFNBQXNCLHFCQUFxQixDQUFDLEVBQVUsRUFBRSxRQUEwQzs7WUFDakcsT0FBTyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsRUFBRSxFQUFHLElBQUksQ0FBQyxTQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLGdCQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlKLENBQUM7S0FBQTtJQUZELHNEQUVDO0lBRUQsU0FBc0IsdUJBQXVCLENBQUMsRUFBVSxFQUFFLFFBQXNDOztZQUMvRixPQUFPLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQW9CLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hGLENBQUM7S0FBQTtJQUZELDBEQUVDO0lBRUQsU0FBc0IsdUJBQXVCLENBQUMsU0FBMEQsRUFBRSxhQUFxQixDQUFDOztZQUMvSCxPQUFPLHdCQUF3QixDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDL0QsQ0FBQztLQUFBO0lBRkQsMERBRUM7SUFFRCxTQUFzQiwyQkFBMkIsQ0FBQyxTQUEwRCxFQUFFLGFBQXFCLENBQUM7O1lBQ25JLE9BQU8sd0JBQXdCLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM5RCxDQUFDO0tBQUE7SUFGRCxrRUFFQztJQUVELFNBQWUsb0JBQW9CLENBQXFCLEVBQVUsRUFBRSxVQUFlLEVBQUUsUUFBZ0MsRUFBRSxvQkFBNkI7O1lBQ25KLE1BQU0sT0FBTyxHQUFHLG9CQUFXLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN0RCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN2QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNyRCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdEcsSUFBSSxNQUFNLEtBQUssVUFBVSxDQUFDLE1BQU0sSUFBSSxNQUFNLEtBQUssVUFBVSxDQUFDLFFBQVEsRUFBRTt3QkFDbkUsT0FBTyxNQUFNLENBQUM7cUJBQ2Q7aUJBQ0Q7Z0JBRUQsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDO2FBQ3pCO1lBRUQsT0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQzVCLENBQUM7S0FBQTtJQUVELFNBQWUsd0JBQXdCLENBQUMsU0FBMEQsRUFBRSxvQkFBNkIsRUFBRSxhQUFxQixDQUFDOztZQUN4SixNQUFNLFlBQVksR0FBWSxFQUFFLENBQUM7WUFFakMsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRS9DLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQztZQUN6QixPQUFPLE9BQU8sR0FBRyxDQUFDLEVBQUU7Z0JBQ25CLE9BQU8sRUFBRSxDQUFDO2dCQUVWLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixNQUFNO2lCQUNOO2dCQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFO29CQUN4QixPQUFPLFVBQVUsQ0FBQyxRQUFRLENBQUM7aUJBQzNCO2dCQUVELFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDeEI7WUFFRCxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUV4QixPQUFPLEdBQUcsVUFBVSxDQUFDO1lBRXJCLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7WUFDL0IsT0FBTyxNQUFNLEtBQUssVUFBVSxDQUFDLE1BQU0sSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFO2dCQUNuRCxPQUFPLEVBQUUsQ0FBQztnQkFFVixNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksTUFBTSxFQUFFO29CQUNYLE1BQU0sR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDeEYsSUFBSSxNQUFNLEtBQUssVUFBVSxDQUFDLE1BQU0sRUFBRTt3QkFDakMsWUFBRyxDQUFDLGlDQUFpQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUMvQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO3FCQUVqRDt5QkFBTTt3QkFDTixPQUFPLE1BQU0sQ0FBQztxQkFDZDtpQkFFRDtxQkFBTTtvQkFDTixPQUFPLFVBQVUsQ0FBQyxRQUFRLENBQUM7aUJBQzNCO2FBQ0Q7WUFFRCxPQUFPLFVBQVUsQ0FBQyxRQUFRLENBQUM7UUFDNUIsQ0FBQztLQUFBO0lBRUQsSUFBSSxXQUF3RCxDQUFDO0lBTzdELE1BQU0sZ0JBQWdCLEdBQXNCLEVBQUUsQ0FBQztJQUUvQyxTQUFnQixxQkFBcUI7UUFDcEMsS0FBSyxNQUFNLGNBQWMsSUFBSSxnQkFBZ0IsRUFBRTtZQUM5QyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDeEU7UUFFRCxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRTVCLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQVksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQVJELHNEQVFDO0lBRUQsU0FBZ0IsWUFBWSxDQUFDLElBQVc7UUFDdkMsTUFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztRQUMvRSxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7WUFDakMscUJBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDekQ7SUFDRixDQUFDO0lBTEQsb0NBS0M7SUFFRCxTQUFnQixhQUFhLENBQUMsSUFBZ0I7UUFDN0MscUJBQXFCLEVBQUUsQ0FBQztRQUV4QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixNQUFNLE9BQU8sR0FBeUIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUVsRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdkQsTUFBTSxPQUFPLEdBQUcsK0JBQXFCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM3RSxJQUFJLE9BQU8sRUFBRTtnQkFDWixxQkFBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUN2QyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3JCLElBQUksRUFBRSxJQUFJO29CQUNWLE9BQU8sRUFBRSxPQUFPO2lCQUNoQixDQUFDLENBQUM7YUFDSDtTQUNEO0lBQ0YsQ0FBQztJQW5CRCxzQ0FtQkM7SUFFRCxTQUFnQixnQkFBZ0I7UUFDL0IsV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRkQsNENBRUM7SUFFRCxTQUFzQixlQUFlLENBQUMsTUFBZ0IsRUFBRSxvQkFBNkI7O1lBQ3BGLElBQUksV0FBVyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtnQkFDcEgsT0FBTztvQkFDTixVQUFVLEVBQUUsQ0FBQztpQkFDYixDQUFDO2FBQ0Y7WUFFRCxJQUFJLFlBQW9DLENBQUM7WUFFekMsTUFBTSxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3JELElBQUksTUFBTSxJQUFJLFdBQVcsRUFBRTtnQkFDMUIsWUFBWSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUVuQztpQkFBTTtnQkFDTixNQUFNLFVBQVUsR0FBRywwQkFBYSxFQUFFLENBQUM7Z0JBRW5DLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEdBQUcsaUJBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25LLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3RCLE9BQU87d0JBQ04sVUFBVSxFQUFFLDhCQUFpQjtxQkFDN0IsQ0FBQztpQkFDRjtnQkFFRCxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtvQkFDdkIsWUFBWSxHQUFHLE1BQU0sVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7b0JBQzNELElBQUksWUFBWSxFQUFFO3dCQUNqQixNQUFNO3FCQUNOO2lCQUNEO2dCQUVELFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxZQUFZLENBQUM7YUFDbkM7WUFFRCxJQUFJLFlBQVksRUFBRTtnQkFHakIsT0FBTztvQkFDTixVQUFVLEVBQUUsaUJBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQztvQkFDakQsSUFBSSxFQUFFLFlBQVk7aUJBQ2xCLENBQUM7YUFDRjtZQUVELE9BQU87Z0JBQ04sVUFBVSxFQUFFLDhCQUFpQjthQUM3QixDQUFDO1FBQ0gsQ0FBQztLQUFBO0lBN0NELDBDQTZDQztJQUVELFNBQXNCLGdCQUFnQixDQUFDLE1BQWdCOztZQUN0RCxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0IsQ0FBQztLQUFBO0lBRkQsNENBRUM7SUFFRCxTQUFzQixZQUFZLENBQUMsTUFBZ0I7O1lBQ2xELE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QixDQUFDO0tBQUE7SUFGRCxvQ0FFQztJQUVELFNBQXNCLGtCQUFrQixDQUFDLE1BQWdCOztZQUN4RCxNQUFNLFNBQVMsR0FBRyxrQ0FBd0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0YsSUFBSSxTQUFTLEtBQUssV0FBVyxDQUFDLGVBQWUsRUFBRTtnQkFDOUMsTUFBTSxzQkFBYSxDQUFDLG9CQUFVLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7YUFDN0c7WUFFRCxNQUFNLHNCQUFhLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRXZGLE9BQU8sVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUM1QixDQUFDO0tBQUE7SUFURCxnREFTQztJQUVELFNBQWUsSUFBSSxDQUFDLE1BQWdCLEVBQUUsb0JBQTZCOztZQUNsRSxNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDO1lBQ3RJLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ25CLE1BQU0sWUFBWSxHQUFHLE1BQU0sZUFBZSxDQUFDLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO2dCQUN6RSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRTtvQkFDdkIsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDO2lCQUN6QjtnQkFFRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFFNUMsTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ1QsWUFBRyxDQUFDLGNBQWMsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0csT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDO2lCQUN6QjtnQkFFRCxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNYLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLEVBQUU7d0JBQy9CLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRWpDLFdBQVcsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUM3QztvQkFFRCxPQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUM7aUJBQ3pCO2FBQ0Q7WUFFRCxJQUFJLG9CQUFvQixFQUFFO2dCQUN6QixNQUFNLFNBQVMsR0FBRyxrQ0FBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9GLElBQUksU0FBUyxLQUFLLFdBQVcsQ0FBQyxlQUFlLEVBQUU7b0JBQzlDLE1BQU0sc0JBQWEsQ0FBQyxvQkFBVSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO2lCQUM3RzthQUNEO1lBRUQsT0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQzVCLENBQUM7S0FBQSJ9