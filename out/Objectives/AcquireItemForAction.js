var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "Enums", "item/Items", "utilities/enum/Enums", "../IObjective", "../Objective", "./AcquireItem"], function (require, exports, IAction_1, Enums_1, Items_1, Enums_2, IObjective_1, Objective_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemForAction extends Objective_1.default {
        constructor(actionType) {
            super();
            this.actionType = actionType;
        }
        getHashCode() {
            return `AcquireItemForAction:${IAction_1.ActionType[this.actionType]}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                const objectiveSets = [];
                for (const it of Enums_2.default.values(Enums_1.ItemType)) {
                    const itemDescription = Items_1.itemDescriptions[it];
                    if (itemDescription && itemDescription.use !== undefined && itemDescription.use.indexOf(this.actionType) !== -1) {
                        objectiveSets.push([new AcquireItem_1.default(it)]);
                    }
                }
                const objective = yield this.pickEasiestObjective(base, inventory, objectiveSets);
                if (objective === undefined) {
                    if (calculateDifficulty) {
                        return IObjective_1.missionImpossible;
                    }
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                return objective;
            });
        }
    }
    exports.default = AcquireItemForAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gb3JBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9BY3F1aXJlSXRlbUZvckFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVNBLE1BQXFCLG9CQUFxQixTQUFRLG1CQUFTO1FBRTFELFlBQTZCLFVBQXNCO1lBQ2xELEtBQUssRUFBRSxDQUFDO1lBRG9CLGVBQVUsR0FBVixVQUFVLENBQVk7UUFFbkQsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyx3QkFBd0Isb0JBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUM5RCxDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLE1BQU0sYUFBYSxHQUFtQixFQUFFLENBQUM7Z0JBRXpDLEtBQUssTUFBTSxFQUFFLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBUSxDQUFDLEVBQUU7b0JBQ3hDLE1BQU0sZUFBZSxHQUFHLHdCQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ2xDLElBQUksZUFBZSxJQUFJLGVBQWUsQ0FBQyxHQUFHLEtBQUssU0FBUyxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTt3QkFDaEgsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzFDO2lCQUNEO2dCQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBRWxGLElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTtvQkFDNUIsSUFBSSxtQkFBbUIsRUFBRTt3QkFDeEIsT0FBTyw4QkFBaUIsQ0FBQztxQkFDekI7b0JBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztTQUFBO0tBRUQ7SUFqQ0QsdUNBaUNDIn0=