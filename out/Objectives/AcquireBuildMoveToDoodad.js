var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "doodad/Doodads", "../Helpers", "../IObjective", "../Objective", "./AcquireItemForDoodad", "./BuildItem", "./StartFire", "../Utilities/Movement", "../Utilities/Object", "../Utilities/Item"], function (require, exports, Doodads_1, Helpers, IObjective_1, Objective_1, AcquireItemForDoodad_1, BuildItem_1, StartFire_1, Movement_1, Object_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireBuildMoveToDoodad extends Objective_1.default {
        constructor(doodadTypeOrGroup) {
            super();
            this.doodadTypeOrGroup = doodadTypeOrGroup;
        }
        getHashCode() {
            return `AcquireBuildMoveToDoodad:${this.doodadTypeOrGroup}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                const doodadTypes = Helpers.getDoodadTypes(this.doodadTypeOrGroup);
                const doodad = Object_1.findDoodad(this.getHashCode(), (d) => doodadTypes.indexOf(d.type) !== -1);
                let requiresFire = false;
                if (doodad) {
                    const description = doodad.description();
                    if (description && description.lit !== undefined) {
                        if (doodadManager.isDoodadTypeGroup(this.doodadTypeOrGroup)) {
                            const litDescription = Doodads_1.default[description.lit];
                            if (litDescription && litDescription.group === this.doodadTypeOrGroup) {
                                requiresFire = true;
                            }
                        }
                        else if (description.lit === this.doodadTypeOrGroup) {
                            requiresFire = true;
                        }
                    }
                }
                if (calculateDifficulty) {
                    const objectives = [];
                    if (!doodad) {
                        objectives.push(new AcquireItemForDoodad_1.default(this.doodadTypeOrGroup));
                        objectives.push(new BuildItem_1.default(undefined));
                    }
                    if (requiresFire) {
                        objectives.push(new StartFire_1.default(doodad));
                    }
                    return this.calculateObjectiveDifficulties(base, inventory, ...objectives);
                }
                if (!doodad) {
                    const inventoryItem = Item_1.getInventoryItemForDoodad(this.doodadTypeOrGroup);
                    if (inventoryItem !== undefined) {
                        return new BuildItem_1.default(inventoryItem);
                    }
                    return new AcquireItemForDoodad_1.default(this.doodadTypeOrGroup);
                }
                if (requiresFire) {
                    return new StartFire_1.default(doodad);
                }
                const moveResult = yield Movement_1.moveToFaceTarget(doodad);
                if (moveResult === Movement_1.MoveResult.NoPath) {
                    this.log.info("No path to doodad");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult !== Movement_1.MoveResult.Complete) {
                    return;
                }
                return IObjective_1.ObjectiveStatus.Complete;
            });
        }
    }
    exports.default = AcquireBuildMoveToDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBY0EsTUFBcUIsd0JBQXlCLFNBQVEsbUJBQVM7UUFFOUQsWUFBNkIsaUJBQStDO1lBQzNFLEtBQUssRUFBRSxDQUFDO1lBRG9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBOEI7UUFFNUUsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyw0QkFBNEIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDN0QsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUVuRSxNQUFNLE1BQU0sR0FBRyxtQkFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQVUsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFbEcsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO2dCQUV6QixJQUFJLE1BQU0sRUFBRTtvQkFDWCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ3pDLElBQUksV0FBVyxJQUFJLFdBQVcsQ0FBQyxHQUFHLEtBQUssU0FBUyxFQUFFO3dCQUNqRCxJQUFJLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRTs0QkFDNUQsTUFBTSxjQUFjLEdBQUcsaUJBQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBQ2hELElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dDQUN0RSxZQUFZLEdBQUcsSUFBSSxDQUFDOzZCQUNwQjt5QkFFRDs2QkFBTSxJQUFJLFdBQVcsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLGlCQUFpQixFQUFFOzRCQUN0RCxZQUFZLEdBQUcsSUFBSSxDQUFDO3lCQUNwQjtxQkFDRDtpQkFDRDtnQkFFRCxJQUFJLG1CQUFtQixFQUFFO29CQUN4QixNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO29CQUVwQyxJQUFJLENBQUMsTUFBTSxFQUFFO3dCQUNaLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO3dCQUNsRSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxTQUFVLENBQUMsQ0FBQyxDQUFDO3FCQUMzQztvQkFFRCxJQUFJLFlBQVksRUFBRTt3QkFDakIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG1CQUFTLENBQUMsTUFBTyxDQUFDLENBQUMsQ0FBQztxQkFDeEM7b0JBRUQsT0FBTyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxHQUFHLFVBQVUsQ0FBQyxDQUFDO2lCQUMzRTtnQkFFRCxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLE1BQU0sYUFBYSxHQUFHLGdDQUF5QixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO29CQUN4RSxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUU7d0JBQ2hDLE9BQU8sSUFBSSxtQkFBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO3FCQUNwQztvQkFFRCxPQUFPLElBQUksOEJBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7aUJBQ3hEO2dCQUVELElBQUksWUFBWSxFQUFFO29CQUNqQixPQUFPLElBQUksbUJBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDN0I7Z0JBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSwyQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxNQUFNLEVBQUU7b0JBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7b0JBQ25DLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO29CQUN2QyxPQUFPO2lCQUNQO2dCQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQztTQUFBO0tBRUQ7SUF6RUQsMkNBeUVDIn0=