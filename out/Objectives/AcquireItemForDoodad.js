var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "Enums", "item/Items", "utilities/enum/Enums", "../Helpers", "../IObjective", "../Objective", "./AcquireItem"], function (require, exports, IAction_1, Enums_1, Items_1, Enums_2, Helpers, IObjective_1, Objective_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemForDoodad extends Objective_1.default {
        constructor(doodadTypeOrGroup) {
            super();
            this.doodadTypeOrGroup = doodadTypeOrGroup;
        }
        getHashCode() {
            return `AcquireItemForDoodad:${doodadManager.isDoodadTypeGroup(this.doodadTypeOrGroup) ? Enums_1.DoodadTypeGroup[this.doodadTypeOrGroup] : Enums_1.DoodadType[this.doodadTypeOrGroup]}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                const doodadTypes = Helpers.getDoodadTypes(this.doodadTypeOrGroup);
                const objectiveSets = [];
                for (const dt of doodadTypes) {
                    for (const it of Enums_2.default.values(Enums_1.ItemType)) {
                        const itemDescription = Items_1.itemDescriptions[it];
                        if (itemDescription && itemDescription.onUse && itemDescription.onUse[IAction_1.ActionType.Build] === dt) {
                            objectiveSets.push([new AcquireItem_1.default(it)]);
                        }
                    }
                }
                if (doodadManager.isDoodadTypeGroup(this.doodadTypeOrGroup)) {
                    for (const it of Enums_2.default.values(Enums_1.ItemType)) {
                        const itemDescription = Items_1.itemDescriptions[it];
                        if (itemDescription && itemDescription.doodad && itemDescription.doodad.group === this.doodadTypeOrGroup) {
                            objectiveSets.push([new AcquireItem_1.default(it)]);
                        }
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
    exports.default = AcquireItemForDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gb3JEb29kYWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9BY3F1aXJlSXRlbUZvckRvb2RhZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVVBLE1BQXFCLG9CQUFxQixTQUFRLG1CQUFTO1FBRTFELFlBQTZCLGlCQUErQztZQUMzRSxLQUFLLEVBQUUsQ0FBQztZQURvQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQThCO1FBRTVFLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sd0JBQXdCLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsdUJBQWUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO1FBQ3pLLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCLEVBQUUsbUJBQTRCOztnQkFDM0YsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFFbkUsTUFBTSxhQUFhLEdBQW1CLEVBQUUsQ0FBQztnQkFFekMsS0FBSyxNQUFNLEVBQUUsSUFBSSxXQUFXLEVBQUU7b0JBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBUSxDQUFDLEVBQUU7d0JBQ3hDLE1BQU0sZUFBZSxHQUFHLHdCQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ2xDLElBQUksZUFBZSxJQUFJLGVBQWUsQ0FBQyxLQUFLLElBQUksZUFBZSxDQUFDLEtBQUssQ0FBQyxvQkFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRTs0QkFDL0YsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQzFDO3FCQUNEO2lCQUNEO2dCQUVELElBQUksYUFBYSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO29CQUM1RCxLQUFLLE1BQU0sRUFBRSxJQUFJLGVBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQVEsQ0FBQyxFQUFFO3dCQUN4QyxNQUFNLGVBQWUsR0FBRyx3QkFBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUNsQyxJQUFJLGVBQWUsSUFBSSxlQUFlLENBQUMsTUFBTSxJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxpQkFBaUIsRUFBRTs0QkFDekcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQzFDO3FCQUNEO2lCQUNEO2dCQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBRWxGLElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTtvQkFDNUIsSUFBSSxtQkFBbUIsRUFBRTt3QkFDeEIsT0FBTyw4QkFBaUIsQ0FBQztxQkFDekI7b0JBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztTQUFBO0tBRUQ7SUE5Q0QsdUNBOENDIn0=