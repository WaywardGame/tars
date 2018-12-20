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
                                if (!terrainDescription.gather && (tileLocation.tile.doodad || tileLocation.tile.containedItems)) {
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
                        const targetTile = game.getTileFromPoint(target.point);
                        if (targetTile === facingTile) {
                            terrainDescription = Terrains_1.default[target.search.type];
                            if (!terrainDescription.gather && (targetTile.doodad || targetTile.containedItems)) {
                                continue;
                            }
                            selectedTarget = target;
                            break;
                        }
                    }
                }
                if (!selectedTarget) {
                    const moveResult = yield Movement_1.moveToFaceTargetWithRetries((ignoredTiles) => {
                        for (let i = 0; i < targets.length; i++) {
                            const target = targets[i];
                            if (target) {
                                const targetTile = game.getTileFromPoint(target.point);
                                terrainDescription = Terrains_1.default[target.search.type];
                                if (!terrainDescription.gather && (targetTile.doodad || targetTile.containedItems)) {
                                    continue;
                                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9HYXRoZXJGcm9tVGVycmFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQW9CQSxNQUFxQixpQkFBa0IsU0FBUSxtQkFBUztRQUV2RCxZQUE2QixNQUF3QjtZQUNwRCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFrQjtRQUVyRCxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLHFCQUFxQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsbUJBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksV0FBVyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDL0ssQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixNQUFNLE9BQU8sR0FBRyx3QkFBaUIsQ0FBQyxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVsRCxJQUFJLGtCQUFtRCxDQUFDO2dCQUV4RCxJQUFJLE9BQU8sR0FBMkIsRUFBRSxDQUFDO2dCQUV6QyxLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQzdCLGtCQUFrQixHQUFHLGtCQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN2QyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7d0JBQ3hCLFNBQVM7cUJBQ1Q7b0JBRUQsTUFBTSxhQUFhLEdBQUcsTUFBTSw2QkFBc0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO29CQUN6RSxJQUFJLGFB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