var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "entity/IStats", "Enums", "../Helpers", "../IObjective", "../Objective", "./AcquireItemByGroup", "./OrganizeInventory", "./UseItem"], function (require, exports, IStats_1, Enums_1, Helpers, IObjective_1, Objective_1, AcquireItemByGroup_1, OrganizeInventory_1, UseItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class RecoverHealth extends Objective_1.default {
        constructor() {
            super(...arguments);
            this.saveChildObjectives = false;
        }
        shouldSaveChildObjectives() {
            return this.saveChildObjectives;
        }
        onExecute(base, inventory) {
            return __awaiter(this, void 0, void 0, function* () {
                const healItems = Helpers.getInventoryItemsWithUse(Enums_1.ActionType.Heal);
                if (healItems.length > 0) {
                    this.log.info(`Healing with ${game.getName(healItems[0])}`);
                    return new UseItem_1.default(healItems[0], Enums_1.ActionType.Heal);
                }
                if (localPlayer.getWeightStatus() !== Enums_1.WeightStatus.None) {
                    this.log.info("Reduce weight before finding a health item");
                    this.saveChildObjectives = false;
                    return new OrganizeInventory_1.default(true, false);
                }
                this.saveChildObjectives = true;
                if (!localPlayer.status.Bleeding && localPlayer.getStat(IStats_1.Stat.Hunger).value < 0) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                this.log.info("Acquire a Health item");
                return new AcquireItemByGroup_1.default(Enums_1.ItemTypeGroup.Health);
            });
        }
    }
    exports.default = RecoverHealth;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlckhlYWx0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL1JlY292ZXJIZWFsdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFVQSxtQkFBbUMsU0FBUSxtQkFBUztRQUFwRDs7WUFFUyx3QkFBbUIsR0FBRyxLQUFLLENBQUM7UUFnQ3JDLENBQUM7UUE5Qk8seUJBQXlCO1lBQy9CLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO1FBQ2pDLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCOztnQkFDN0QsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLGtCQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BFLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDNUQsT0FBTyxJQUFJLGlCQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLGtCQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2xEO2dCQUVELElBQUksV0FBVyxDQUFDLGVBQWUsRUFBRSxLQUFLLG9CQUFZLENBQUMsSUFBSSxFQUFFO29CQUd4RCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO29CQUM1RCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO29CQUNqQyxPQUFPLElBQUksMkJBQWlCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUMxQztnQkFFRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO2dCQUVoQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtvQkFFdEYsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztnQkFDdkMsT0FBTyxJQUFJLDRCQUFrQixDQUFDLHFCQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckQsQ0FBQztTQUFBO0tBRUQ7SUFsQ0QsZ0NBa0NDIn0=