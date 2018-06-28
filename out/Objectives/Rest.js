var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../Helpers", "../IObjective", "../Objective", "./ExecuteAction", "./Idle"], function (require, exports, Enums_1, Helpers, IObjective_1, Objective_1, ExecuteAction_1, Idle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Rest extends Objective_1.default {
        onExecute() {
            return __awaiter(this, void 0, void 0, function* () {
                if (localPlayer.swimming) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const nearbyCreature = Helpers.getNearbyCreature(localPlayer);
                if (nearbyCreature !== undefined) {
                    this.log.info(`Idling until the nearby ${game.getName(nearbyCreature, Enums_1.SentenceCaseStyle.None, false)} moves away.`);
                    return new Idle_1.default(false);
                }
                const item = Helpers.getInventoryItemsWithUse(Enums_1.ActionType.Rest)[0];
                if (item) {
                    return new ExecuteAction_1.default(Enums_1.ActionType.Sleep, {
                        item: item
                    });
                }
                return new ExecuteAction_1.default(Enums_1.ActionType.Rest);
            });
        }
    }
    exports.default = Rest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1Jlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFPQSxVQUEwQixTQUFRLG1CQUFTO1FBRTdCLFNBQVM7O2dCQUNyQixJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUU7b0JBQ3pCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO29CQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywyQkFBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUseUJBQWlCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDcEgsT0FBTyxJQUFJLGNBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDdkI7Z0JBRUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLGtCQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLElBQUksSUFBSSxFQUFFO29CQUNULE9BQU8sSUFBSSx1QkFBYSxDQUFDLGtCQUFVLENBQUMsS0FBSyxFQUFFO3dCQUMxQyxJQUFJLEVBQUUsSUFBSTtxQkFDVixDQUFDLENBQUM7aUJBQ0g7Z0JBRUQsT0FBTyxJQUFJLHVCQUFhLENBQUMsa0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQyxDQUFDO1NBQUE7S0FFRDtJQXZCRCx1QkF1QkMifQ==