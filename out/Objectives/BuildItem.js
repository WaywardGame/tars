var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "utilities/TileHelpers", "../Helpers", "../IObjective", "../ITars", "../Objective", "./UseItem"], function (require, exports, Enums_1, TileHelpers_1, Helpers, IObjective_1, ITars_1, Objective_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BuildItem extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getHashCode() {
            return `BuildItem:${game.getName(this.item, Enums_1.SentenceCaseStyle.Title, false)}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                if (calculateDifficulty) {
                    return 1;
                }
                let moveResult;
                if (Helpers.hasBase(base)) {
                    const baseDoodads = Helpers.getBaseDoodads(base);
                    for (const baseDoodad of baseDoodads) {
                        moveResult = yield Helpers.findAndMoveToTarget((point, tile) => Helpers.isGoodBuildTile(base, point, tile), false, ITars_1.defaultMaxTilesChecked, baseDoodad);
                        if (moveResult === ITars_1.MoveResult.Moving || moveResult === ITars_1.MoveResult.Complete) {
                            break;
                        }
                    }
                }
                if (moveResult === undefined || moveResult === ITars_1.MoveResult.NoTarget || moveResult === ITars_1.MoveResult.NoPath) {
                    if (this.target === undefined) {
                        const targetDoodad = Helpers.findDoodad(this.getHashCode(), doodad => {
                            const description = doodad.description();
                            if (!description || !description.isTree) {
                                return false;
                            }
                            let dirt = 0;
                            let grass = 0;
                            for (let x = -6; x <= 6; x++) {
                                for (let y = -6; y <= 6; y++) {
                                    if (x === 0 && y === 0) {
                                        continue;
                                    }
                                    const point = {
                                        x: doodad.x + x,
                                        y: doodad.y + y,
                                        z: doodad.z
                                    };
                                    const tile = game.getTileFromPoint(point);
                                    if (!tile.doodad && Helpers.isGoodBuildTile(base, point, tile)) {
                                        const tileType = TileHelpers_1.default.getType(tile);
                                        if (tileType === Enums_1.TerrainType.Dirt) {
                                            dirt++;
                                        }
                                        else if (tileType === Enums_1.TerrainType.Grass) {
                                            grass++;
                                        }
                                    }
                                }
                            }
                            return dirt >= 3 && grass >= 1;
                        });
                        if (targetDoodad === undefined) {
                            this.log.info("No target doodad to orient base around");
                            return IObjective_1.ObjectiveStatus.Complete;
                        }
                        let target;
                        for (let x = -6; x <= 6; x++) {
                            for (let y = -6; y <= 6; y++) {
                                if (x === 0 && y === 0) {
                                    continue;
                                }
                                const point = {
                                    x: targetDoodad.x + x,
                                    y: targetDoodad.y + y,
                                    z: targetDoodad.z
                                };
                                const tile = game.getTileFromPoint(point);
                                if (Helpers.isGoodBuildTile(base, point, tile)) {
                                    target = point;
                                    x = 7;
                                    break;
                                }
                            }
                        }
                        this.target = target;
                        if (this.target === undefined) {
                            this.log.info("No target to build first base item");
                            return IObjective_1.ObjectiveStatus.Complete;
                        }
                    }
                    moveResult = yield Helpers.moveToTarget(this.target);
                }
                if (moveResult === ITars_1.MoveResult.NoTarget) {
                    this.log.info("No target to build item");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult === ITars_1.MoveResult.NoPath) {
                    this.log.info("No path to build item");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult === ITars_1.MoveResult.Complete) {
                    this.log.info("Build item");
                    return new UseItem_1.default(this.item, Enums_1.ActionType.Build);
                }
            });
        }
    }
    exports.default = BuildItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvQnVpbGRJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBV0EsZUFBK0IsU0FBUSxtQkFBUztRQUkvQyxZQUFvQixJQUFXO1lBQzlCLEtBQUssRUFBRSxDQUFDO1lBRFcsU0FBSSxHQUFKLElBQUksQ0FBTztRQUUvQixDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLGFBQWEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHlCQUFpQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQy9FLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCLEVBQUUsbUJBQTRCOztnQkFDM0YsSUFBSSxtQkFBbUIsRUFBRTtvQkFDeEIsT0FBTyxDQUFDLENBQUM7aUJBQ1Q7Z0JBRUQsSUFBSSxVQUFrQyxDQUFDO2dCQUV2QyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzFCLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRWpELEtBQUssTUFBTSxVQUFVLElBQUksV0FBVyxFQUFFO3dCQUNyQyxVQUFVLEdBQUcsTUFBTSxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxLQUFlLEVBQUUsSUFBVyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLDhCQUFzQixFQUFFLFVBQVUsQ0FBQyxDQUFDO3dCQUN4SyxJQUFJLFVBQVUsS0FBSyxrQkFBVSxDQUFDLE1BQU0sSUFBSSxVQUFVLEtBQUssa0JBQVUsQ0FBQyxRQUFRLEVBQUU7NEJBQzNFLE1BQU07eUJBQ047cUJBQ0Q7aUJBQ0Q7Z0JBRUQsSUFBSSxVQUFVLEtB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