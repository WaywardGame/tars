var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "../IObjective", "../ITars", "../Objective", "../Utilities/Base", "../Utilities/Movement", "./UseItem", "Enums"], function (require, exports, IAction_1, IObjective_1, ITars_1, Objective_1, Base_1, Movement_1, UseItem_1, Enums_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const recalculateMovements = 40;
    class BuildItem extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
            this.movements = 0;
        }
        getHashCode() {
            return `BuildItem:${this.item && this.item.getName(false).getString()}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                if (calculateDifficulty) {
                    return 1;
                }
                const description = this.item.description();
                const isWell = description && description.doodad && description.doodad.group === Enums_1.DoodadTypeGroup.Well;
                if (isWell) {
                    this.log.info("Going build a well");
                }
                let moveResult;
                if (Base_1.hasBase(base)) {
                    const baseDoodads = Base_1.getBaseDoodads(base);
                    for (const baseDoodad of baseDoodads) {
                        if (isWell) {
                            moveResult = yield Movement_1.findAndMoveToFaceTarget((point, tile) => Base_1.isGoodWellBuildTile(base, point, tile, true), ITars_1.defaultMaxTilesChecked, baseDoodad);
                            if (moveResult === Movement_1.MoveResult.NoPath || moveResult === Movement_1.MoveResult.NoTarget) {
                                moveResult = yield Movement_1.findAndMoveToFaceTarget((point, tile) => Base_1.isGoodWellBuildTile(base, point, tile, false), ITars_1.defaultMaxTilesChecked, baseDoodad);
                            }
                        }
                        else {
                            moveResult = yield Movement_1.findAndMoveToFaceTarget((point, tile) => Base_1.isGoodBuildTile(base, point, tile), ITars_1.defaultMaxTilesChecked, baseDoodad);
                        }
                        if (moveResult === Movement_1.MoveResult.Moving || moveResult === Movement_1.MoveResult.Complete) {
                            break;
                        }
                    }
                }
                if (moveResult === undefined || moveResult === Movement_1.MoveResult.NoTarget || moveResult === Movement_1.MoveResult.NoPath) {
                    if (isWell) {
                        this.log.info("Unable to find location for well");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                    if (this.target === undefined) {
                        this.log.info("Looking for build tile...");
                        this.target = Base_1.findBuildTile(this.getHashCode(), base);
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
                    return new UseItem_1.default(this.item, IAction_1.ActionType.Build);
                }
            });
        }
        onMove() {
            this.movements++;
            if (this.movements >= recalculateMovements) {
                this.movements = 0;
                this.target = undefined;
                localPlayer.walkAlongPath(undefined);
            }
        }
    }
    exports.default = BuildItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVpbGRJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvQnVpbGRJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBWUEsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7SUFFaEMsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBSy9DLFlBQTZCLElBQVk7WUFDeEMsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUZqQyxjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBSTlCLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUM7UUFDekUsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixJQUFJLG1CQUFtQixFQUFFO29CQUN4QixPQUFPLENBQUMsQ0FBQztpQkFDVDtnQkFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM3QyxNQUFNLE1BQU0sR0FBRyxXQUFXLElBQUksV0FBVyxDQUFDLE1BQU0sSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyx1QkFBZSxDQUFDLElBQUksQ0FBQztnQkFDdEcsSUFBRyxNQUFNLEVBQUU7b0JBQ1YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztpQkFDcEM7Z0JBRUQsSUFBSSxVQUFrQyxDQUFDO2dCQUV2QyxJQUFJLGNBQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDbEIsTUFBTSxXQUFXLEdBQUcscUJBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFFekMsS0FBSyxNQUFNLFVBQVUsSUFBSSxXQUFXLEVBQUU7d0JB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