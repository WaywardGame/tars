var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "utilities/TileHelpers", "../IObjective", "../ITars", "../Objective", "./UseItem", "../Utilities/Movement", "../Utilities/Base", "../Utilities/Object"], function (require, exports, Enums_1, TileHelpers_1, IObjective_1, ITars_1, Objective_1, UseItem_1, Movement_1, Base_1, Object_1) {
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
                if (Base_1.hasBase(base)) {
                    const baseDoodads = Base_1.getBaseDoodads(base);
                    for (const baseDoodad of baseDoodads) {
                        moveResult = yield Movement_1.findAndMoveToFaceTarget((point, tile) => Base_1.isGoodBuildTile(base, point, tile), ITars_1.defaultMaxTilesChecked, baseDoodad);
                        if (moveResult === Movement_1.MoveResult.Moving || moveResult === Movement_1.MoveResult.Complete) {
                            break;
                        }
                    }
                }
                if (moveResult === undefined || moveResult === Movement_1.MoveResult.NoTarget || moveResult === Movement_1.MoveResult.NoPath) {
                    if (this.target === undefined) {
                        const targetDoodad = Object_1.findDoodad(this.getHashCode(), doodad => {
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
                                    if (!tile.doodad && Base_1.isGoodBuildTile(base, point, tile)) {
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
                                if (Base_1.isGoodBuildTile(base, point, tile)) {
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
                    moveResult = yield Movement_1.moveToFaceTarget(this.target);
                }
                if (moveResult === Movement_1.MoveResult.NoTarget) {
                    this.log.info("No target to build item");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult === Movement_1.MoveResult.NoPath) {
                    this.log.info("No path to build item");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult === Movement_1.MoveResult.Complete) {
                    this.log.info("Build item");
                    return new UseItem_1.default(this.item, Enums_1.ActionType.Build);
                }
            });
        }
    }
    exports.default = BuildItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvQnVpbGRJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBYUEsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBSS9DLFlBQW9CLElBQVc7WUFDOUIsS0FBSyxFQUFFLENBQUM7WUFEVyxTQUFJLEdBQUosSUFBSSxDQUFPO1FBRS9CLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sYUFBYSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUseUJBQWlCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDL0UsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixJQUFJLG1CQUFtQixFQUFFO29CQUN4QixPQUFPLENBQUMsQ0FBQztpQkFDVDtnQkFFRCxJQUFJLFVBQWtDLENBQUM7Z0JBRXZDLElBQUksY0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNsQixNQUFNLFdBQVcsR0FBRyxxQkFBYyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUV6QyxLQUFLLE1BQU0sVUFBVSxJQUFJLFdBQVcsRUFBRTt3QkFDckMsVUFBVSxHQUFHLE1BQU0sa0NBQXVCLENBQUMsQ0FBQyxLQUFlLEVBQUUsSUFBVyxFQUFFLEVBQUUsQ0FBQyxzQkFBZSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsOEJBQXNCLEVBQUUsVUFBVSxDQUFDLENBQUM7d0JBQ3JKLElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsTUFBTSxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTs0QkFDM0UsTUFBTTt5QkFDTjtxQkFDRDtpQkFDRDtnQkFFRCxJQUFJLFVBQVUsS0FBSyxTQUFTLElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsUUFBUSxJQUFJ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