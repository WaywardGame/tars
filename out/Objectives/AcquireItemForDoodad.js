var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "item/Items", "utilities/enum/Enums", "../Helpers", "../IObjective", "../Objective", "./AcquireItem"], function (require, exports, Enums_1, Items_1, Enums_2, Helpers, IObjective_1, Objective_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemForDoodad extends Objective_1.default {
        constructor(doodadTypeOrGroup) {
            super();
            this.doodadTypeOrGroup = doodadTypeOrGroup;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                const doodadTypes = Helpers.getDoodadTypes(this.doodadTypeOrGroup);
                const objectiveSets = [];
                for (const dt of doodadTypes) {
                    for (const it of Enums_2.default.values(Enums_1.ItemType)) {
                        const itemDescription = Items_1.itemDescriptions[it];
                        if (itemDescription && itemDescription.onUse && itemDescription.onUse[Enums_1.ActionType.Build] === dt) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1Gb3JEb29kYWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvT2JqZWN0aXZlcy9BY3F1aXJlSXRlbUZvckRvb2RhZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVNBLDBCQUEwQyxTQUFRLG1CQUFTO1FBRTFELFlBQW9CLGlCQUErQztZQUNsRSxLQUFLLEVBQUUsQ0FBQztZQURXLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBOEI7UUFFbkUsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUVuRSxNQUFNLGFBQWEsR0FBbUIsRUFBRSxDQUFDO2dCQUV6QyxLQUFLLE1BQU0sRUFBRSxJQUFJLFdBQVcsRUFBRTtvQkFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxlQUFLLENBQUMsTUFBTSxDQUFDLGdCQUFRLENBQUMsRUFBRTt3QkFDeEMsTUFBTSxlQUFlLEdBQUcsd0JBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDbEMsSUFBSSxlQUFlLElBQUksZUFBZSxDQUFDLEtBQUssSUFBSSxlQUFlLENBQUMsS0FBSyxDQUFDLGtCQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFOzRCQUMvRixhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDMUM7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFFbEYsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFO29CQUM1QixJQUFJLG1CQUFtQixFQUFFO3dCQUN4QixPQUFPLDhCQUFpQixDQUFDO3FCQUN6QjtvQkFFRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDO1NBQUE7S0FFRDtJQWpDRCx1Q0FpQ0MifQ==