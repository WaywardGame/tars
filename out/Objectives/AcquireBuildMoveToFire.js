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
    class AcquireBuildMoveToFire extends Objective_1.default {
        getHashCode() {
            return "AcquireBuildMoveToFire";
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
    exports.default = AcquireBuildMoveToFire;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJ1aWxkTW92ZVRvRmlyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0FjcXVpcmVCdWlsZE1vdmVUb0ZpcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFXQSxNQUFxQixzQkFBdUIsU0FBUSxtQkFBUztRQUVyRCxXQUFXO1lBQ2pCLE9BQU8sd0JBQXdCLENBQUM7UUFDakMsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixNQUFNLE9BQU8sR0FBZSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLENBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEdBQUcsaUJBQU8sQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdNLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFMUIsSUFBSSxtQkFBbUIsRUFBRTtvQkFDeEIsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztvQkFFcEMsSUFBSSxDQUFDLE1BQU0sRUFBRTt3QkFDWixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7d0JBQ3pELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLFNBQVUsQ0FBQyxDQUFDLENBQUM7cUJBQzNDO29CQUVELElBQUksQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7d0JBQzFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7cUJBQ3ZDO29CQUVELE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3RixPQUFPLGNBQWMsSUFBRyxNQUFNLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFBLENBQUM7aUJBQy9GO2dCQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1osTUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLHlCQUF5QixDQUFDLFdBQVcsRUFBRSxxQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNqRyxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUU7d0JBQ2hDLE9BQU8sSUFBSSxtQkFBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO3FCQUNwQztvQkFFRCxPQUFPLElBQUksNEJBQWtCLENBQUMscUJBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdEQ7Z0JBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN6QyxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNqQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxPQUFPLElBQUksbUJBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QixDQUFDO1NBQUE7S0FFRDtJQTNDRCx5Q0EyQ0MifQ==