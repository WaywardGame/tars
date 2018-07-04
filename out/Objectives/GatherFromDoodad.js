var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "utilities/math/Vector2", "../IObjective", "../Objective", "../Utilities/Movement", "../Utilities/Item", "../Utilities/Object"], function (require, exports, Enums_1, Vector2_1, IObjective_1, Objective_1, Movement_1, Item_1, Object_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromDoodad extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
        }
        getHashCode() {
            return `GatherFromDoodad:${this.search.map(search => `${Enums_1.DoodadType[search.type]},${Enums_1.GrowingStage[search.growingStage]},${itemManager.getItemTypeGroupName(search.itemType, false)}`).join("|")}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.target || !this.target.isValid()) {
                    this.target = Object_1.findDoodad(`${this.getHashCode()}|1`, (doodad) => doodad.canGather() && this.search.findIndex(search => search.type === doodad.type && search.growingStage === doodad.getGrowingStage()) !== -1 && doodad.getTile().corpses === undefined);
                    if (this.target === undefined) {
                        this.target = Object_1.findDoodad(`${this.getHashCode()}|2`, (doodad) => doodad.canGather() && this.search.findIndex(search => search.type === doodad.type && search.growingStage === Enums_1.GrowingStage.Dead) !== -1 && doodad.getTile().corpses === undefined);
                        if (this.target) {
                            this.log.info("Couldn't find target normally. found it for a dead thing!", this.search);
                        }
                    }
                }
                if (calculateDifficulty) {
                    return this.target === undefined ? IObjective_1.missionImpossible : Math.round(Vector2_1.default.squaredDistance(localPlayer, this.target));
                }
                if (this.target === undefined) {
                    this.log.info("No target doodad");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const moveResult = yield Movement_1.moveToFaceTarget(this.target);
                if (moveResult === Movement_1.MoveResult.NoPath) {
                    this.log.info("No path to doodad");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult !== Movement_1.MoveResult.Complete) {
                    return;
                }
                const targetSearch = this.search.find(search => search.type === this.target.type && search.growingStage === this.target.getGrowingStage());
                return this.executeActionForItem(targetSearch ? targetSearch.action : Enums_1.ActionType.Gather, { item: Item_1.getBestActionItem(Enums_1.ActionType.Gather, Enums_1.DamageType.Slashing) }, this.search.map(search => search.itemType));
            });
        }
        getBaseDifficulty(base, inventory) {
            return 20;
        }
    }
    exports.default = GatherFromDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbURvb2RhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0dhdGhlckZyb21Eb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFVQSxzQkFBc0MsU0FBUSxtQkFBUztRQUl0RCxZQUFvQixNQUF1QjtZQUMxQyxLQUFLLEVBQUUsQ0FBQztZQURXLFdBQU0sR0FBTixNQUFNLENBQWlCO1FBRTNDLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sb0JBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxrQkFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxvQkFBWSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxXQUFXLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDak0sQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQzNDLElBQUksQ0FBQyxNQUFNLEdBQUcsbUJBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsTUFBZSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFlBQVksS0FBSyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUMsS0FBSyxDQUFDLENB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