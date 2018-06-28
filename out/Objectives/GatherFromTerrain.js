var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "tile/Terrains", "utilities/math/Vector2", "../Helpers", "../IObjective", "../ITars", "../Objective"], function (require, exports, Enums_1, Terrains_1, Vector2_1, Helpers, IObjective_1, ITars_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromTerrain extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
        }
        getHashCode() {
            return `GatherFromTerrain:${this.search.map(search => `${Enums_1.TerrainType[search.type]},${Enums_1.ItemType[search.itemType]},${search.chance}`).join("|")}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                const digTool = Helpers.getBestActionItem(Enums_1.ActionType.Dig);
                let terrainDescription;
                let targets = [];
                for (const ts of this.search) {
                    terrainDescription = Terrains_1.default[ts.type];
                    if (!terrainDescription) {
                        continue;
                    }
                    const tileLocations = yield Helpers.getNearestTileLocation(ts.type, localPlayer);
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
                                    difficulty += 100;
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
                for (let i = 0; i < 4; i++) {
                    const target = targets[i];
                    if (target) {
                        const targetTile = game.getTileFromPoint(target.point);
                        if (targetTile === facingTile) {
                            terrainDescription = Terrains_1.default[target.search.type];
                            if (!terrainDescription.gather && (targetTile.doodad || targetTile.containedItems)) {
                                continue;
                            }
                            selectedTarget = target;
                        }
                    }
                }
                if (!selectedTarget) {
                    const moveResult = yield Helpers.moveToTargetWithRetries((ignoredTiles) => {
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
                    if (moveResult === ITars_1.MoveResult.NoTarget) {
                        this.log.info("Can't find terrain tile nearby");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                    else if (moveResult !== ITars_1.MoveResult.Complete) {
                        return;
                    }
                }
                terrainDescription = Terrains_1.default[selectedTarget.search.type];
                const actionType = terrainDescription.gather ? Enums_1.ActionType.Gather : Enums_1.ActionType.Dig;
                const item = terrainDescription.gather ? Helpers.getBestActionItem(Enums_1.ActionType.Gather, Enums_1.DamageType.Blunt) : digTool;
                return this.executeActionForItem(actionType, { item: item }, this.search.map(search => search.itemType));
            });
        }
        getBaseDifficulty(base, inventory) {
            return 10;
        }
    }
    exports.default = GatherFromTerrain;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbVRlcnJhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9HYXRoZXJGcm9tVGVycmFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQWlCQSx1QkFBdUMsU0FBUSxtQkFBUztRQUV2RCxZQUFvQixNQUF3QjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURXLFdBQU0sR0FBTixNQUFNLENBQWtCO1FBRTVDLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8scUJBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxtQkFBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNoSixDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUUxRCxJQUFJLGtCQUFtRCxDQUFDO2dCQUV4RCxJQUFJLE9BQU8sR0FBMkIsRUFBRSxDQUFDO2dCQUV6QyxLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQzdCLGtCQUFrQixHQUFHLGtCQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN2QyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7d0JBQ3hCLFNBQVM7cUJBQ1Q7b0JBRUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxPQUFPLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztvQkFDakYsSUFBSSxhQUFhLENBQUMs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