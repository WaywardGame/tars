var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "item/Items", "Utilities", "../IObjective", "../Objective", "./AcquireItem"], function (require, exports, Enums_1, Items_1, Utilities, IObjective_1, Objective_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemForGroup extends Objective_1.default {
        constructor(itemTypeGroup) {
            super();
            this.itemTypeGroup = itemTypeGroup;
        }
        getHashCode() {
            return `AcquireItemForGroup:${itemManager.getItemTypeGroupName(this.itemTypeGroup, false)}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                const objectiveSets = [];
                for (const it of Utilities.Enums.getValues(Enums_1.ItemType)) {
                    const itemDescription = Items_1.itemDescriptions[it];
                    if (itemDescription && itemDescription.group !== undefined && itemDescription.group.indexOf(this.itemTypeGroup) !== -1) {
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
    exports.default = AcquireItemForGroup;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gb3JHcm91cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0FjcXVpcmVJdGVtRm9yR3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFRQSx5QkFBeUMsU0FBUSxtQkFBUztRQUV6RCxZQUFvQixhQUE0QjtZQUMvQyxLQUFLLEVBQUUsQ0FBQztZQURXLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBRWhELENBQUM7UUFFTSxXQUFXO1lBQ2pCLE1BQU0sQ0FBQyx1QkFBdUIsV0FBVyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUM3RixDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLE1BQU0sYUFBYSxHQUFtQixFQUFFLENBQUM7Z0JBRXpDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLGdCQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RELE1BQU0sZUFBZSxHQUFHLHdCQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ2xDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsSUFBSSxlQUFlLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxlQUFlLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBOEIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDekksYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNDLENBQUM7Z0JBQ0YsQ0FBQztnQkFFRCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUVsRixFQUFFLENBQUMsQ0FBQyxTQUFTLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO3dCQUN6QixNQUFNLENBQUMsOEJBQWlCLENBQUM7b0JBQzFCLENBQUM7b0JBRUQsTUFBTSxDQUFDLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxDQUFDO2dCQUVELE1BQU0sQ0FBQyxTQUFTLENBQUM7WUFDbEIsQ0FBQztTQUFBO0tBRUQ7SUFqQ0Qsc0NBaUNDIn0=