var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "utilities/iterable/Collectors", "../IObjective", "../Objective", "./AcquireItem"], function (require, exports, Collectors_1, IObjective_1, Objective_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemByGroup extends Objective_1.default {
        constructor(itemTypeGroup) {
            super();
            this.itemTypeGroup = itemTypeGroup;
        }
        getHashCode() {
            return `AcquireItemByGroup:${itemManager.getItemTypeGroupName(this.itemTypeGroup, false)}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                const objectiveSets = itemManager.getGroupItems(this.itemTypeGroup).values()
                    .map(item => [new AcquireItem_1.default(item)])
                    .collect(Collectors_1.default.toArray);
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
    exports.default = AcquireItemByGroup;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1CeUdyb3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvQWNxdWlyZUl0ZW1CeUdyb3VwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBT0EsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFeEQsWUFBNkIsYUFBNEI7WUFDeEQsS0FBSyxFQUFFLENBQUM7WUFEb0Isa0JBQWEsR0FBYixhQUFhLENBQWU7UUFFekQsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxzQkFBc0IsV0FBVyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUM1RixDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLE1BQU0sYUFBYSxHQUFtQixXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUU7cUJBQzFGLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7cUJBQ3BDLE9BQU8sQ0FBQyxvQkFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUU5QixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUVsRixJQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUU7b0JBQzVCLElBQUksbUJBQW1CLEVBQUU7d0JBQ3hCLE9BQU8sOEJBQWlCLENBQUM7cUJBQ3pCO29CQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUM7U0FBQTtLQUVEO0lBNUJELHFDQTRCQyJ9