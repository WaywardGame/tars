var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "Enums", "utilities/math/Vector2", "../IObjective", "../Objective", "../Utilities/Item", "../Utilities/Movement", "../Utilities/Object"], function (require, exports, IAction_1, Enums_1, Vector2_1, IObjective_1, Objective_1, Item_1, Movement_1, Object_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromDoodad extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
        }
        getHashCode() {
            return `GatherFromDoodad:${this.search.map(search => `${Enums_1.DoodadType[search.type]},${Enums_1.GrowingStage[search.growingStage]},${itemManager.getItemTypeGroupName(search.itemType, false).getString()}`).join("|")}`;
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
                    return this.target === undefined ? IObjective_1.missionImpossible : Math.round(Vector2_1.default.distance(localPlayer, this.target));
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
                return this.executeActionForItem(targetSearch ? targetSearch.action : IAction_1.ActionType.Gather, ((action) => action.execute(localPlayer, Item_1.getBestActionItem(IAction_1.ActionType.Gather, Enums_1.DamageType.Slashing))), this.search.map(search => search.itemType));
            });
        }
        getBaseDifficulty(base, inventory) {
            return 20;
        }
    }
    exports.default = GatherFromDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbURvb2RhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0dhdGhlckZyb21Eb29kYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFXQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUl0RCxZQUE2QixNQUF1QjtZQUNuRCxLQUFLLEVBQUUsQ0FBQztZQURvQixXQUFNLEdBQU4sTUFBTSxDQUFpQjtRQUVwRCxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLG9CQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsa0JBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksb0JBQVksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksV0FBVyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzdNLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCLEVBQUUsbUJBQTRCOztnQkFDM0YsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO29CQUMzQyxJQUFJLENBQUMsTUFBTSxHQUFHLG1CQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLE1BQWUsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxZQUFZLEtBQUssTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUMsQ0FBQztvQkFFbFEsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTt3QkFDOUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxtQkFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxNQUFlLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsWUFBWSxLQUFLLG9CQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUMsQ0FBQzt3QkFFM1AsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFOzRCQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywyREFBMkQsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7eUJBQ3hGO3FCQUNEO2lCQUNEO2dCQUVELElBQUksbUJBQW1CLEVBQUU7b0JBQ3hCLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztpQkFDOUc7Z0JBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtvQkFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDbEMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSwyQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRXZELElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsTUFBTSxFQUFFO29CQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO29CQUNuQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDdkMsT0FBTztpQkFDUDtnQkFFRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLE1BQU8sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFlBQVksS0FBSyxJQUFJLENBQUMsTUFBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7Z0JBRTdJLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsb0JBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQVcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsd0JBQWlCLENBQUMsb0JBQVUsQ0FBQyxNQUFNLEVBQUUsa0JBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN4UCxDQUFDO1NBQUE7UUFFUyxpQkFBaUIsQ0FBQyxJQUFXLEVBQUUsU0FBMEI7WUFDbEUsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO0tBRUQ7SUF0REQsbUNBc0RDIn0=