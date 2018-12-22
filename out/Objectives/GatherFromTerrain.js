var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "Enums", "tile/Terrains", "utilities/math/Vector2", "../IObjective", "../Objective", "../Utilities/Item", "../Utilities/Movement", "../Utilities/Tile"], function (require, exports, IAction_1, Enums_1, Terrains_1, Vector2_1, IObjective_1, Objective_1, Item_1, Movement_1, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromTerrain extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
        }
        getHashCode() {
            return `GatherFromTerrain:${this.search.map(search => `${Enums_1.TerrainType[search.type]},${itemManager.getItemTypeGroupName(search.itemType, false)},${search.chance}`).join("|")}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                const digTool = Item_1.getBestActionItem(IAction_1.ActionType.Dig);
                let terrainDescription;
                let targets = [];
                for (const ts of this.search) {
                    terrainDescription = Terrains_1.default[ts.type];
                    if (!terrainDescription) {
                        continue;
                    }
                    const tileLocations = yield Tile_1.getNearestTileLocation(ts.type, localPlayer);
                    if (tileLocations.length > 0) {
                        for (let i = 0; i < 5; i++) {
                            const tileLocation = tileLocations[i];
                            if (tileLocation) {
                                const point = tileLocation.point;
                                if (!Tile_1.canGather(point)) {
                                    continue;
                                }
                                let difficulty = Math.round(Vector2_1.default.squaredDistance(localPlayer, point)) + (100 - ts.chance);
                                if (!terrainDescription.gather && !digTool) {
                                    difficulty += 500;
                                }
                                targets.push({
                                    search: ts,
                                    point: point,
                                    difficulty: difficulty
                                });
                            }
                        }
                    }
                }
                if (targets.length === 0) {
                    if (calculateDifficulty) {
                        return IObjective_1.missionImpossible;
                    }
                    this.log.info("No terrain targets to gather from");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                targets = targets.sort((a, b) => a.difficulty > b.difficulty ? 1 : -1);
                if (calculateDifficulty) {
                    return targets[0].difficulty;
                }
                let selectedTarget;
                const facingTile = localPlayer.getFacingTile();
                for (let i = 0; i < 8; i++) {
                    const target = targets[i];
                    if (target) {
                        const tile = game.getTileFromPoint(target.point);
                        if (tile === facingTile && Tile_1.canGather(target.point)) {
                            selectedTarget = target;
                            break;
                        }
                    }
                }
                if (!selectedTarget) {
                    const moveResult = yield Movement_1.moveToFaceTargetWithRetries((ignoredTiles) => {
                        for (let i = 0; i < targets.length; i++) {
                            const target = targets[i];
                            if (target && Tile_1.canGather(target.point)) {
                                const targetTile = game.getTileFromPoint(target.point);
                                if (ignoredTiles.indexOf(targetTile) === -1) {
                                    selectedTarget = target;
                                    return target.point;
                                }
                            }
                        }
                        return undefined;
                    });
                    if (moveResult === Movement_1.MoveResult.NoTarget) {
                        this.log.info("Can't find terrain tile nearby");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                    else if (moveResult !== Movement_1.MoveResult.Complete) {
                        return;
                    }
                }
                terrainDescription = Terrains_1.default[selectedTarget.search.type];
                const actionType = terrainDescription.gather ? IAction_1.ActionType.Gather : IAction_1.ActionType.Dig;
                const item = terrainDescription.gather ? Item_1.getBestActionItem(IAction_1.ActionType.Gather, Enums_1.DamageType.Blunt) : digTool;
                return this.executeActionForItem(actionType, ((action) => action.execute(localPlayer, item)), this.search.map(search => search.itemType));
            });
        }
        getBaseDifficulty(base, inventory) {
            return 10;
        }
    }
    exports.default = GatherFromTerrain;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9HYXRoZXJGcm9tVGVycmFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQW1CQSxNQUFxQixpQkFBa0IsU0FBUSxtQkFBUztRQUV2RCxZQUE2QixNQUF3QjtZQUNwRCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFrQjtRQUVyRCxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLHFCQUFxQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsbUJBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksV0FBVyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDL0ssQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixNQUFNLE9BQU8sR0FBRyx3QkFBaUIsQ0FBQyxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVsRCxJQUFJLGtCQUFtRCxDQUFDO2dCQUV4RCxJQUFJLE9BQU8sR0FBMkIsRUFBRSxDQUFDO2dCQUV6QyxLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQzdCLGtCQUFrQixHQUFHLGtCQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN2QyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7d0JBQ3hCLFNBQVM7cUJBQ1Q7b0JBRUQsTUFBTSxhQUFhLEdBQUcsTUFBTSw2QkFBc0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO29CQUN6RSxJQUFJLGFB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