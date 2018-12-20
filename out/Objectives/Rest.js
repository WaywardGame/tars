var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "../IObjective", "../Objective", "../Utilities/Item", "../Utilities/Object", "./ExecuteAction", "./Idle"], function (require, exports, IAction_1, IObjective_1, Objective_1, Item_1, Object_1, ExecuteAction_1, Idle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Rest extends Objective_1.default {
        getHashCode() {
            return "Rest";
        }
        onExecute() {
            return __awaiter(this, void 0, void 0, function* () {
                if (localPlayer.swimming) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const nearbyCreature = Object_1.getNearbyCreature(localPlayer);
                if (nearbyCreature !== undefined) {
                    this.log.info(`Idling until the nearby ${nearbyCreature.getName(false).getString()} moves away.`);
                    return new Idle_1.default(false);
                }
                const item = Item_1.getInventoryItemsWithUse(IAction_1.ActionType.Rest)[0];
                if (item) {
                    return new ExecuteAction_1.default(IAction_1.ActionType.Sleep, action => action.execute(localPlayer, item));
                }
                return new ExecuteAction_1.default(IAction_1.ActionType.Rest, action => action.execute(localPlayer));
            });
        }
    }
    exports.default = Rest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1Jlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFTQSxNQUFxQixJQUFLLFNBQVEsbUJBQVM7UUFFbkMsV0FBVztZQUNqQixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFWSxTQUFTOztnQkFDckIsSUFBSSxXQUFXLENBQUMsUUFBUSxFQUFFO29CQUN6QixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxNQUFNLGNBQWMsR0FBRywwQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO29CQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywyQkFBMkIsY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBQ2xHLE9BQU8sSUFBSSxjQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3ZCO2dCQUVELE1BQU0sSUFBSSxHQUFHLCtCQUF3QixDQUFDLG9CQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELElBQUksSUFBSSxFQUFFO29CQUNULE9BQU8sSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDeEY7Z0JBRUQsT0FBTyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbEYsQ0FBQztTQUFBO0tBRUQ7SUF6QkQsdUJBeUJDIn0=