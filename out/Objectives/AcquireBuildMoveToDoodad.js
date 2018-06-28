var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "doodad/Doodads", "../Helpers", "../IObjective", "../ITars", "../Objective", "./AcquireItemForDoodad", "./BuildItem", "./StartFire"], function (require, exports, Doodads_1, Helpers, IObjective_1, ITars_1, Objective_1, AcquireItemForDoodad_1, BuildItem_1, StartFire_1) {
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
                const doodad = Helpers.findDoodad(this.getHashCode(), (d) => doodadTypes.indexOf(d.type) !== -1);
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
                if (doodad === undefined) {
                    return new AcquireItemForDoodad_1.default(this.doodadTypeOrGroup);
                }
                if (requiresFire) {
                    return new StartFire_1.default(doodad);
                }
                const moveResult = yield Helpers.moveToTarget(doodad);
                if (moveResult === ITars_1.MoveResult.NoPath) {
                    this.log.info("No path to doodad");
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (moveResult !== ITars_1.MoveResult.Complete) {
                    return;
                }
                return IObjective_1.ObjectiveStatus.Complete;
            });
        }
    }
    exports.default = AcquireBuildMoveToDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvQWNxdWlyZUJ1aWxkTW92ZVRvRG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBV0EsOEJBQThDLFNBQVEsbUJBQVM7UUFFOUQsWUFBb0IsaUJBQStDO1lBQ2xFLEtBQUssRUFBRSxDQUFDO1lBRFcsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUE4QjtRQUVuRSxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLDRCQUE0QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM3RCxDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBRW5FLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBVSxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUUxRyxJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7Z0JBRXpCLElBQUksTUFBTSxFQUFFO29CQUNYLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDekMsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7d0JBQ2pELElBQUksYUFBYSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFOzRCQUM1RCxNQUFNLGNBQWMsR0FBRyxpQkFBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFDaEQsSUFBSSxjQUFjLElBQUksY0FBYyxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0NBQ3RFLFlBQVksR0FBRyxJQUFJLENBQUM7NkJBQ3BCO3lCQUVEOzZCQUFNLElBQUksV0FBVyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7NEJBQ3RELFlBQVksR0FBRyxJQUFJLENBQUM7eUJBQ3BCO3FCQUNEO2lCQUNEO2dCQUVELElBQUksbUJBQW1CLEVBQUU7b0JBQ3hCLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7b0JBRXBDLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ1osVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7d0JBQ2xFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxtQkFBUyxDQUFDLFNBQVUsQ0FBQyxDQUFDLENBQUM7cUJBQzNDO29CQUVELElBQUksWUFBWSxFQUFFO3dCQUNqQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksbUJBQVMsQ0FBQyxNQUFPLENBQUMsQ0FBQyxDQUFDO3FCQUN4QztvQkFFRCxPQUFPLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2lCQUN4RTtnQkFFRCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7b0JBQ3pCLE9BQU8sSUFBSSw4QkFBb0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztpQkFDeEQ7Z0JBRUQsSUFBSSxZQUFZLEVBQUU7b0JBQ2pCLE9BQU8sSUFBSSxtQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUM3QjtnQkFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3RELElBQUksVUFBVSxLQUFLLGtCQUFVLENBQUMsTUFBTSxFQUFFO29CQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO29CQUNuQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxJQUFJLFVBQVUsS0FBSyxrQkFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDdkMsT0FBTztpQkFDUDtnQkFFRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7U0FBQTtLQUVEO0lBcEVELDJDQW9FQyJ9