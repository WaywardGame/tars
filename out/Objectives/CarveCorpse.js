var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../IObjective", "../Objective", "./ExecuteAction", "../Utilities/Item", "../Utilities/Movement"], function (require, exports, Enums_1, IObjective_1, Objective_1, ExecuteAction_1, Item_1, Movement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CarveCorpse extends Objective_1.default {
        constructor(corpse) {
            super();
            this.corpse = corpse;
        }
        getHashCode() {
            return `CarveCorpse:${game.getName(this.corpse, Enums_1.SentenceCaseStyle.Title, false)}`;
        }
        onExecute() {
            return __awaiter(this, void 0, void 0, function* () {
                const carveTool = Item_1.getInventoryItemsWithUse(Enums_1.ActionType.Carve);
                if (carveTool.length === 0) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const tile = game.getTileFromPoint(this.corpse);
                if (tile.events !== undefined) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const moveResult = yield Movement_1.moveToFaceTarget(this.corpse);
                if (moveResult !== Movement_1.MoveResult.Complete) {
                    return;
                }
                this.log.info("Facing matching corpse");
                if (!carveTool || !localPlayer.isFacingCarvableTile()) {
                    this.log.info("Can't carve");
                    return;
                }
                this.log.info("Carving corpse");
                return new ExecuteAction_1.default(Enums_1.ActionType.Carve, carveTool[0]);
            });
        }
    }
    exports.default = CarveCorpse;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FydmVDb3Jwc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9DYXJ2ZUNvcnBzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVFBLGlCQUFpQyxTQUFRLG1CQUFTO1FBRWpELFlBQW9CLE1BQWU7WUFDbEMsS0FBSyxFQUFFLENBQUM7WUFEVyxXQUFNLEdBQU4sTUFBTSxDQUFTO1FBRW5DLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sZUFBZSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUseUJBQWlCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDbkYsQ0FBQztRQUVZLFNBQVM7O2dCQUNyQixNQUFNLFNBQVMsR0FBRywrQkFBd0IsQ0FBQyxrQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUMzQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNoRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO29CQUM5QixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLDJCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxRQUFRLEVBQUU7b0JBQ3ZDLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztnQkFFeEMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFO29CQUN0RCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDN0IsT0FBTztpQkFDUDtnQkFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUVoQyxPQUFPLElBQUksdUJBQWEsQ0FBQyxrQkFBVSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxRCxDQUFDO1NBQUE7S0FFRDtJQXRDRCw4QkFzQ0MifQ==