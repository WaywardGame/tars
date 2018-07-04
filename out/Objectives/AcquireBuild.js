var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "utilities/math/Vector2", "../IObjective", "../Objective", "./AcquireItem", "./BuildItem", "./StartFire", "./AcquireItemByGroup"], function (require, exports, Enums_1, Vector2_1, IObjective_1, Objective_1, AcquireItem_1, BuildItem_1, StartFire_1, AcquireItemByGroup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireBuild extends Objective_1.default {
        constructor(itemTypeGroup) {
            super();
            this.itemTypeGroup = itemTypeGroup;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                const doodads = [base.campfire, base.kiln].filter(d => d !== undefined).sort((a, b) => Vector2_1.default.squaredDistance(localPlayer, a) > Vector2_1.default.squaredDistance(localPlayer, b) ? 1 : -1);
                const doodad = doodads[0];
                if (calculateDifficulty) {
                    const objectives = [];
                    if (!doodad) {
                        objectives.push(new AcquireItem_1.default(Enums_1.ItemType.StoneCampfire));
                        objectives.push(new BuildItem_1.default(undefined));
                    }
                    if (!doodad || doodad.decay === undefined) {
                        objectives.push(new StartFire_1.default(doodad));
                    }
                    const doodadDistance = doodad ? Math.round(Vector2_1.default.squaredDistance(localPlayer, doodad)) : 0;
                    return doodadDistance + (yield this.calculateObjectiveDifficulties(base, inventory, objectives));
                }
                if (!doodad) {
                    const inventoryItem = itemManager.getItemInInventoryByGroup(localPlayer, Enums_1.ItemTypeGroup.Campfire);
                    if (inventoryItem !== undefined) {
                        return new BuildItem_1.default(inventoryItem);
                    }
                    return new AcquireItemByGroup_1.default(Enums_1.ItemTypeGroup.Campfire);
                }
                const description = doodad.description();
                if (!description) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                return new StartFire_1.default(doodad);
            });
        }
    }
    exports.default = AcquireBuild;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJ1aWxkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvQWNxdWlyZUJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBV0Esa0JBQWtDLFNBQVEsbUJBQVM7UUFFL0MsWUFBb0IsYUFBNEI7WUFDbEQsS0FBSyxFQUFFLENBQUM7WUFEYyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUVoRCxDQUFDO1FBRVMsU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLE1BQU0sT0FBTyxHQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFPLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN00sTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUUxQixJQUFJLG1CQUFtQixFQUFFO29CQUN4QixNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO29CQUVwQyxJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUNaLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQzt3QkFDekQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFTLENBQUMsU0FBVSxDQUFDLENBQUMsQ0FBQztxQkFDM0M7b0JBRUQsSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTt3QkFDMUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztxQkFDdkM7b0JBRUQsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFPLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdGLE9BQU8sY0FBYyxJQUFHLE1BQU0sSUFBSSxDQUFDLDhCQUE4QixDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUEsQ0FBQztpQkFDL0Y7Z0JBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixNQUFNLGFBQWEsR0FBRyxXQUFXLENBQUMseUJBQXlCLENBQUMsV0FBVyxFQUFFLHFCQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2pHLElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTt3QkFDaEMsT0FBTyxJQUFJLG1CQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7cUJBQ3BDO29CQUVELE9BQU8sSUFBSSw0QkFBa0IsQ0FBQyxxQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUN0RDtnQkFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2pCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE9BQU8sSUFBSSxtQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlCLENBQUM7U0FBQTtLQUVEO0lBM0NELCtCQTJDQyJ9