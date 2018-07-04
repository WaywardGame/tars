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
                    return this.calculateObjectiveDifficulties(base, inventory, objectives);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBY0EsOEJBQThDLFNBQVEsbUJBQVM7UUFFOUQsWUFBb0IsaUJBQStDO1lBQ2xFLEtBQUssRUFBRSxDQUFDO1lBRFcsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUE4QjtRQUVuRSxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLDRCQUE0QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM3RCxDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBRW5FLE1BQU0sTUFBTSxHQUFHLG1CQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBVSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVsRyxJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7Z0JBRXpCLElBQUksTUFBTSxFQUFFO29CQUNYLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDekMsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7d0JBQ2pELElBQUksYUFBYSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFOzRCQUM1RCxNQUFNLGNBQWMsR0FBRyxpQkFBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDaEQsSUFBSSxjQUFjLElBQUksY0FBYyxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0NBQ3RFLFlBQVksR0FBRyxJQUFJLENBQUM7NkJBQ3BCO3lCQUVEOzZCQUFNLElBQUksV0FBVyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7NEJBQ3RELFlBQVksR0FBRyxJQUFJLENBQUM7eUJBQ3BCO3FCQUNEO2lCQUNEO2dCQUVELElBQUksbUJBQW1CLEVBQUU7b0JBQ3hCLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7b0JBRXBDLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ1osVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7d0JBQ2xFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLFNBQVUsQ0FBQyxDQUFDLENBQUM7cUJBQzNDO29CQUVELElBQUksWUFBWSxFQUFFO3dCQUNqQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxNQUFPLENBQUMsQ0FBQyxDQUFDO3FCQUN4QztvQkFFRCxPQUFPLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2lCQUN4RTtnQkFFRCxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLE1BQU0sYUFBYSxHQUFHLGdDQUF5QixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO29CQUN4RSxJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUU7d0JBQ2hDLE9BQU8sSUFBSSxtQkFBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDO3FCQUNwQztvQkFFRCxPQUFPLElBQUksOEJBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7aUJBQ3hEO2dCQUVELElBQUksWUFBWSxFQUFFO29CQUNqQixPQUFPLElBQUksbUJBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDN0I7Z0JBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSwyQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxNQUFNLEVBQUU7b0JBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7b0JBQ25DLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO29CQUN2QyxPQUFPO2lCQUNQO2dCQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQztTQUFBO0tBRUQ7SUF6RUQsMkNBeUVDIn0=