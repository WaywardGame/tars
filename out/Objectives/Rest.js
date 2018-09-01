var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../IObjective", "../Objective", "./ExecuteAction", "./Idle", "../Utilities/Object", "../Utilities/Item"], function (require, exports, Enums_1, IObjective_1, Objective_1, ExecuteAction_1, Idle_1, Object_1, Item_1) {
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
                    this.log.info(`Idling until the nearby ${game.getName(nearbyCreature, Enums_1.SentenceCaseStyle.None, false)} moves away.`);
                    return new Idle_1.default(false);
                }
                const item = Item_1.getInventoryItemsWithUse(Enums_1.ActionType.Rest)[0];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1Jlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFRQSxNQUFxQixJQUFLLFNBQVEsbUJBQVM7UUFFbkMsV0FBVztZQUNqQixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFWSxTQUFTOztnQkFDckIsSUFBSSxXQUFXLENBQUMsUUFBUSxFQUFFO29CQUN6QixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxNQUFNLGNBQWMsR0FBRywwQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFO29CQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywyQkFBMkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUseUJBQWlCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDcEgsT0FBTyxJQUFJLGNBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDdkI7Z0JBRUQsTUFBTSxJQUFJLEdBQUcsK0JBQXdCLENBQUMsa0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxJQUFJLEVBQUU7b0JBQ1QsT0FBTyxJQUFJLHVCQUFhLENBQUMsa0JBQVUsQ0FBQyxLQUFLLEVBQUU7d0JBQzFDLElBQUksRUFBRSxJQUFJO3FCQUNWLENBQUMsQ0FBQztpQkFDSDtnQkFFRCxPQUFPLElBQUksdUJBQWEsQ0FBQyxrQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNDLENBQUM7U0FBQTtLQUVEO0lBM0JELHVCQTJCQyJ9