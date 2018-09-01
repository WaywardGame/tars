var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "../IObjective", "../Objective", "./AcquireItemByGroup", "./AcquireItemForAction", "./UseItem", "../Utilities/Movement"], function (require, exports, Enums_1, IObjective_1, Objective_1, AcquireItemByGroup_1, AcquireItemForAction_1, UseItem_1, Movement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StartFire extends Objective_1.default {
        constructor(doodad) {
            super();
            this.doodad = doodad;
        }
        getHashCode() {
            return "StartFire";
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                if (calculateDifficulty) {
                    const objectives = [];
                    if (inventory.fireStarter === undefined) {
                        objectives.push(new AcquireItemForAction_1.default(Enums_1.ActionType.StartFire));
                    }
                    if (inventory.fireKindling === undefined) {
                        objectives.push(new AcquireItemByGroup_1.default(Enums_1.ItemTypeGroup.Kindling));
                    }
                    if (inventory.fireTinder === undefined) {
                        objectives.push(new AcquireItemByGroup_1.default(Enums_1.ItemTypeGroup.Tinder));
                    }
                    objectives.push(new UseItem_1.default(undefined, Enums_1.ActionType.StartFire, this.doodad));
                    return this.calculateObjectiveDifficulties(base, inventory, objectives);
                }
                const description = this.doodad.description();
                if (!description || description.lit === undefined || description.providesFire) {
                    const moveResult = yield Movement_1.moveToFaceTarget(this.doodad);
                    if (moveResult === Movement_1.MoveResult.NoPath) {
                        this.log.info("No path to doodad");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                    if (moveResult === Movement_1.MoveResult.Moving) {
                        return;
                    }
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (inventory.fireStarter === undefined) {
                    return new AcquireItemForAction_1.default(Enums_1.ActionType.StartFire);
                }
                if (inventory.fireKindling === undefined) {
                    return new AcquireItemByGroup_1.default(Enums_1.ItemTypeGroup.Kindling);
                }
                if (inventory.fireTinder === undefined) {
                    return new AcquireItemByGroup_1.default(Enums_1.ItemTypeGroup.Tinder);
                }
                return new UseItem_1.default(inventory.fireStarter, Enums_1.ActionType.StartFire, this.doodad);
            });
        }
    }
    exports.default = StartFire;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRGaXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvU3RhcnRGaXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBVUEsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBRS9DLFlBQW9CLE1BQWU7WUFDbEMsS0FBSyxFQUFFLENBQUM7WUFEVyxXQUFNLEdBQU4sTUFBTSxDQUFTO1FBRW5DLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8sV0FBVyxDQUFDO1FBQ3BCLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCLEVBQUUsbUJBQTRCOztnQkFDM0YsSUFBSSxtQkFBbUIsRUFBRTtvQkFDeEIsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztvQkFFcEMsSUFBSSxTQUFTLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTt3QkFDeEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLGtCQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztxQkFDaEU7b0JBRUQsSUFBSSxTQUFTLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTt3QkFDekMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFrQixDQUFDLHFCQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztxQkFDaEU7b0JBRUQsSUFBSSxTQUFTLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTt3QkFDdkMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFrQixDQUFDLHFCQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztxQkFDOUQ7b0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFPLENBQUMsU0FBUyxFQUFFLGtCQUFVLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUUzRSxPQUFPLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2lCQUN4RTtnQkFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxHQUFHLEtBQUssU0FBUyxJQUFJLFdBQVcsQ0FBQyxZQUFZLEVBQUU7b0JBQzlFLE1BQU0sVUFBVSxHQUFHLE1BQU0sMkJBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN2RCxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLE1BQU0sRUFBRTt3QkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzt3QkFDbkMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztxQkFDaEM7b0JBRUQsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxNQUFNLEVBQUU7d0JBQ3JDLE9BQU87cUJBQ1A7b0JBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsSUFBSSxTQUFTLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtvQkFDeEMsT0FBTyxJQUFJLDhCQUFvQixDQUFDLGtCQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQ3REO2dCQUVELElBQUksU0FBUyxDQUFDLFlBQVksS0FBSyxTQUFTLEVBQUU7b0JBQ3pDLE9BQU8sSUFBSSw0QkFBa0IsQ0FBQyxxQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUN0RDtnQkFFRCxJQUFJLFNBQVMsQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFO29CQUN2QyxPQUFPLElBQUksNEJBQWtCLENBQUMscUJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDcEQ7Z0JBRUQsT0FBTyxJQUFJLGlCQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxrQkFBVSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUUsQ0FBQztTQUFBO0tBRUQ7SUE3REQsNEJBNkRDIn0=