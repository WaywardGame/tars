define(["require", "exports", "Enums", "Utilities", "../Helpers", "../IObjective", "../ITars", "../Objective"], function (require, exports, Enums_1, Utilities, Helpers, IObjective_1, ITars_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherDoodad extends Objective_1.default {
        constructor(search, count = 1) {
            super();
            this.search = search;
            this.count = count;
        }
        getHashCode() {
            return `GatherDoodad:${this.search.map((search) => `${search.type},${search.growingStage},${search.itemTypeOrGroup}`).join(",")}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            const isTarget = (doodad) => {
                if (doodad.isReadyToGather()) {
                    for (const search of this.search) {
                        if (search.type === doodad.type && search.growingStage === doodad.getGrowingStage()) {
                            return true;
                        }
                    }
                }
                return false;
            };
            if (calculateDifficulty) {
                const corpse = Helpers.findDoodad(isTarget);
                return corpse === undefined ? 0 : Math.round(Utilities.distanceBetween(localPlayer, corpse));
            }
            let moveResult = Helpers.findAndMoveToDoodad(isTarget);
            if (moveResult === ITars_1.MoveResult.NoTarget || moveResult === ITars_1.MoveResult.NoPath) {
                moveResult = Helpers.findAndMoveToDoodad((doodad) => {
                    if (doodad.isReadyToGather()) {
                        for (const search of this.search) {
                            if (search.type === doodad.type && search.growingStage === Enums_1.GrowingStage.Dead) {
                                return true;
                            }
                        }
                    }
                    return false;
                });
            }
            if (moveResult === ITars_1.MoveResult.NoTarget) {
                this.log("No target doodad");
                return IObjective_1.ObjectiveStatus.Complete;
            }
            else if (moveResult === ITars_1.MoveResult.NoPath) {
                this.log("No path to doodad");
                return IObjective_1.ObjectiveStatus.Complete;
            }
            if (moveResult !== ITars_1.MoveResult.Complete) {
                return;
            }
            const itemsBefore = localPlayer.inventory.containedItems.slice(0);
            actionManager.execute(localPlayer, Enums_1.ActionType.Gather, {
                item: Helpers.getBestActionItem(Enums_1.ActionType.Gather, Enums_1.DamageType.Slashing)
            });
            const newItems = localPlayer.inventory.containedItems.filter((item) => itemsBefore.indexOf(item) === -1);
            const matchingNewItem = newItems.find((item) => this.search.find((search) => search.itemTypeOrGroup === item.type) !== undefined);
            if (matchingNewItem === undefined) {
                return;
            }
            this.log(`Gathered matching item ${Enums_1.ItemType[matchingNewItem.type]}`);
            this.count--;
            if (this.count === 0) {
                return IObjective_1.ObjectiveStatus.Complete;
            }
        }
        getBaseDifficulty(base, inventory) {
            return 4;
        }
    }
    exports.default = GatherDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvR2F0aGVyRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLGtCQUFrQyxTQUFRLG1CQUFTO1FBRWxELFlBQW9CLE1BQXVCLEVBQVUsUUFBZ0IsQ0FBQztZQUNyRSxLQUFLLEVBQUUsQ0FBQztZQURXLFdBQU0sR0FBTixNQUFNLENBQWlCO1lBQVUsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUV0RSxDQUFDO1FBRU0sV0FBVztZQUNqQixNQUFNLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsWUFBWSxJQUFJLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ25JLENBQUM7UUFFTSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCLEVBQUUsbUJBQTRCO1lBQ3JGLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBZTtnQkFDaEMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDOUIsR0FBRyxDQUFDLENBQUMsTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQ2xDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsWUFBWSxLQUFLLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQ3JGLE1BQU0sQ0FBQyxJQUFJLENBQUM7d0JBQ2IsQ0FBQztvQkFDRixDQUFDO2dCQUNGLENBQUM7Z0JBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNkLENBQUMsQ0FBQztZQUVGLEVBQUUsQ0FBQyxDQUFD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