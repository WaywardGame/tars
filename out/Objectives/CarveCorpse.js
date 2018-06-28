var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../Helpers", "../IObjective", "../ITars", "../Objective", "./ExecuteAction"], function (require, exports, Enums_1, Helpers, IObjective_1, ITars_1, Objective_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CarveCorpse extends Objective_1.default {
        constructor(corpse) {
            super();
            this.corpse = corpse;
        }
        onExecute() {
            return __awaiter(this, void 0, void 0, function* () {
                const carveTool = Helpers.getInventoryItemsWithUse(Enums_1.ActionType.Carve);
                if (carveTool.length === 0) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const tile = game.getTileFromPoint(this.corpse);
                if (tile.events !== undefined) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const moveResult = yield Helpers.moveToTarget(this.corpse);
                if (moveResult !== ITars_1.MoveResult.Complete) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FydmVDb3Jwc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9DYXJ2ZUNvcnBzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVFBLGlCQUFpQyxTQUFRLG1CQUFTO1FBRWpELFlBQW9CLE1BQWU7WUFDbEMsS0FBSyxFQUFFLENBQUM7WUFEVyxXQUFNLEdBQU4sTUFBTSxDQUFTO1FBRW5DLENBQUM7UUFFWSxTQUFTOztnQkFDckIsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLGtCQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3JFLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQzNCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2hELElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7b0JBQzlCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzNELElBQUksVUFBVSxLQUFLLGtCQUFVLENBQUMsUUFBUSxFQUFFO29CQUN2QyxPQUFPO2lCQUNQO2dCQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7Z0JBRXhDLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxXQUFXLENBQUMsb0JBQW9CLEVBQUUsRUFBRTtvQkFDdEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQzdCLE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFFaEMsT0FBTyxJQUFJLHVCQUFhLENBQUMsa0JBQVUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsQ0FBQztTQUFBO0tBRUQ7SUFsQ0QsOEJBa0NDIn0=