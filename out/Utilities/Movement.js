define(["require", "exports", "entity/action/IAction", "entity/IEntity", "entity/player/IPlayer", "game/IGame", "newui/screen/screens/game/util/movement/PathOverlayFootPrints", "tile/ITerrain", "tile/Terrains", "utilities/math/Direction", "utilities/TileHelpers", "../IObjective", "../Navigation/Navigation", "./Action", "./Item", "./Logger"], function (require, exports, IAction_1, IEntity_1, IPlayer_1, IGame_1, PathOverlayFootPrints_1, ITerrain_1, Terrains_1, Direction_1, TileHelpers_1, IObjective_1, Navigation_1, Action_1, Item_1, Logger_1) {
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
        if (context.player.z !== target.z) {
            return {
                difficulty: IObjective_1.ObjectiveResult.Impossible,
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
                }
                if (force || !context.player.hasWalkPath()) {
                    updateOverlay(movementPath.path);
                    context.player.walkAlongPath(movementPath.path);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvVXRpbGl0aWVzL01vdmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUF5QkEsSUFBWSxVQUtYO0lBTEQsV0FBWSxVQUFVO1FBQ3JCLG1EQUFRLENBQUE7UUFDUiwrQ0FBTSxDQUFBO1FBQ04sK0NBQU0sQ0FBQTtRQUNOLG1EQUFRLENBQUE7SUFDVCxDQUFDLEVBTFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFLckI7SUFPRCxNQUFNLGdCQUFnQixHQUFzQixFQUFFLENBQUM7SUFFL0MsU0FBZ0IscUJBQXFCO1FBQ3BDLEtBQUssTUFBTSxjQUFjLElBQUksZ0JBQWdCLEVBQUU7WUFDOUMscUJBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3hFO1FBRUQsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUU1QixJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFZLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFSRCxzREFRQztJQUVELFNBQWdCLFlBQVksQ0FBQyxJQUFXO1FBQ3ZDLE1BQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDL0UsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO1lBQ2pDLHFCQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3pEO0lBQ0YsQ0FBQztJQUxELG9DQUtDO0lBRUQsU0FBZ0IsYUFBYSxDQUFDLElBQWdCO1FBQzdDLHFCQUFxQixFQUFFLENBQUM7UUFFeEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDckMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsTUFBTSxPQUFPLEdBQXlCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFbEQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXZELE1BQU0sT0FBTyxHQUFHLCtCQUFxQixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3BGLElBQUksT0FBTyxFQUFFO2dCQUNaLHFCQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZDLGdCQUFnQixDQUFDLElBQUksQ0FBQztvQkFDckIsSUFBSSxFQUFFLElBQUk7b0JBQ1YsT0FBTyxFQUFFLE9BQU87aUJBQ2hCLENBQUMsQ0FBQzthQUNIO1NBQ0Q7SUFDRixDQUFDO0lBbkJELHNDQW1CQztJQUVELE1BQU0sV0FBVyxHQUE0QyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRXZFLFNBQWdCLGdCQUFnQjtRQUMvQixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUZELDRDQUVDO0lBRU0sS0FBSyxVQUFVLGVBQWUsQ0FBQyxPQUFnQixFQUFFLE1BQWdCLEVBQUUsb0JBQTZCO1FBQ3RHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUM3SCxPQUFPO2dCQUNOLFVBQVUsRUFBRSxDQUFDO2FBQ2IsQ0FBQztTQUNGO1FBRUQsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFO1lBQ2xDLE9BQU87Z0JBQ04sVUFBVSxFQUFFLDRCQUFlLENBQUMsVUFBVTthQUN0QyxDQUFDO1NBQ0Y7UUFFRCxNQUFNLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRXpGLElBQUksWUFBd0MsQ0FBQztRQUU3QyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDNUIsWUFBWSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7U0FFdkM7YUFBTTtZQUNOLE1BQU0sVUFBVSxHQUFHLG9CQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFcEMsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3RFLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3RCLE9BQU87b0JBQ04sVUFBVSxFQUFFLDRCQUFlLENBQUMsVUFBVTtpQkFDdEMsQ0FBQzthQUNGO1lBRUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7Z0JBQ3ZCLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7b0JBQzNGLE9BQU87d0JBQ04sVUFBVSxFQUFFLENBQUM7cUJBQ2IsQ0FBQztpQkFDRjthQUNEO1lBR0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMxRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFxQixDQUFDO1lBRTdELEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO2dCQUM3QixNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFLdEMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDakY7WUFFRCxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFekYsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDdkIsWUFBWSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxQjtZQUVELFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQ3RDO1FBRUQsSUFBSSxZQUFZLEVBQUU7WUFHakIsT0FBTztnQkFDTixVQUFVLEVBQUUsWUFBWSxDQUFDLEtBQUs7Z0JBQzlCLElBQUksRUFBRSxZQUFZLENBQUMsSUFBSTthQUN2QixDQUFDO1NBQ0Y7UUFFRCxPQUFPO1lBQ04sVUFBVSxFQUFFLDRCQUFlLENBQUMsVUFBVTtTQUN0QyxDQUFDO0lBQ0gsQ0FBQztJQXhFRCwwQ0F3RUM7SUFFTSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsT0FBZ0IsRUFBRSxNQUFnQjtRQUN4RSxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFGRCw0Q0FFQztJQUVNLEtBQUssVUFBVSxZQUFZLENBQUMsT0FBZ0IsRUFBRSxNQUFnQjtRQUNwRSxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFGRCxvQ0FFQztJQUVNLEtBQUssVUFBVSxJQUFJLENBQUMsT0FBZ0IsRUFBRSxNQUFnQixFQUFFLG9CQUE2QixFQUFFLEtBQWU7UUFDNUcsTUFBTSxZQUFZLEdBQUcsTUFBTSxlQUFlLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQ2xGLElBQUksWUFBWSxDQUFDLFVBQVUsS0FBSyxDQUFDLEVBQUU7WUFDbEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUU7Z0JBQ3ZCLE9BQU8sVUFBVSxDQUFDLE1BQU0sQ0FBQzthQUN6QjtZQUVELE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBRTVDLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1QsWUFBRyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUksT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDO2FBQ3pCO1lBRUQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1gsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxZQUFZLEVBQUU7b0JBQ2pCLE1BQU0sU0FBUyxHQUFHLGtDQUF3QixDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUVqSCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3hFLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMvQyxNQUFNLGtCQUFrQixHQUFHLGtCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBRTlDLElBQUksa0JBQWtCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUU7d0JBQ3BGLElBQUksa0JBQWtCLENBQUMsTUFBTSxFQUFFOzRCQUM5QixJQUFJLFNBQVMsS0FBSyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtnQ0FDakQsTUFBTSxzQkFBYSxDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQ0FDNUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQ0FDdEQsQ0FBQyxDQUFDLENBQUM7NkJBQ0g7NEJBRUQsTUFBTSxVQUFVLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxvQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsb0JBQVUsQ0FBQyxHQUFHLENBQUM7NEJBQ2xGLE1BQU0sSUFBSSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsd0JBQWlCLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsTUFBTSxFQUFFLG9CQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUFpQixDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUV0SixNQUFNLHNCQUFhLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQ0FDNUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDOzRCQUN0QyxDQUFDLENBQUMsQ0FBQzt5QkFFSDs2QkFBTTs0QkFDTixZQUFHLENBQUMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLHNCQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzt5QkFDaEU7cUJBRUQ7eUJBQU0sSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUU7d0JBRTNELElBQUksU0FBUyxLQUFLLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFOzRCQUNqRCxNQUFNLHNCQUFhLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dDQUM1RSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDOzRCQUN0RCxDQUFDLENBQUMsQ0FBQzt5QkFDSDt3QkFFRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTs0QkFDOUMsWUFBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxxQkFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7NEJBQ3BELE1BQU0sc0JBQWEsQ0FBQyxPQUFPLEVBQUUsb0JBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0NBQ25FLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNoQyxDQUFDLENBQUMsQ0FBQzt5QkFFSDs2QkFBTTs0QkFDTixZQUFHLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxFQUFFLHFCQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzs0QkFDMUUsTUFBTSxzQkFBYSxDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQ0FDbkUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLHdCQUFpQixDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLE1BQU0sRUFBRSxvQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7NEJBQ3BHLENBQUMsQ0FBQyxDQUFDO3lCQUNIO3FCQUVEO3lCQUFNLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRTt3QkFFN0IsSUFBSSxTQUFTLEtBQUssT0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7NEJBQ2pELE1BQU0sc0JBQWEsQ0FBQyxPQUFPLEVBQUUsb0JBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0NBQzVFLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQ3RELENBQUMsQ0FBQyxDQUFDO3lCQUNIO3dCQUVELE1BQU0sc0JBQWEsQ0FBQyxPQUFPLEVBQUUsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7NEJBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQzt3QkFDM0MsQ0FBQyxDQUFDLENBQUM7cUJBQ0g7aUJBQ0Q7Z0JBRUQsSUFBSSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFO29CQUMzQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUVqQyxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2hEO2dCQUVELE9BQU8sVUFBVSxDQUFDLE1BQU0sQ0FBQzthQUN6QjtTQUNEO1FBRUQsSUFBSSxvQkFBb0IsRUFBRTtZQUN6QixNQUFNLFNBQVMsR0FBRyxrQ0FBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRyxJQUFJLFNBQVMsS0FBSyxPQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtnQkFDakQsTUFBTSxzQkFBYSxDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLGVBQWUsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDNUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDdEQsQ0FBQyxDQUFDLENBQUM7YUFDSDtTQUNEO1FBRUQsT0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDO0lBQzVCLENBQUM7SUFuR0Qsb0JBbUdDIn0=