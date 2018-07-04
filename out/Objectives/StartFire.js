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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhcnRGaXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvU3RhcnRGaXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBVUEsZUFBK0IsU0FBUSxtQkFBUztRQUUvQyxZQUFvQixNQUFlO1lBQ2xDLEtBQUssRUFBRSxDQUFDO1lBRFcsV0FBTSxHQUFOLE1BQU0sQ0FBUztRQUVuQyxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLFdBQVcsQ0FBQztRQUNwQixDQUFDO1FBRVksU0FBUyxDQUFDLElBQVcsRUFBRSxTQUEwQixFQUFFLG1CQUE0Qjs7Z0JBQzNGLElBQUksbUJBQW1CLEVBQUU7b0JBQ3hCLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7b0JBRXBDLElBQUksU0FBUyxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7d0JBQ3hDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxrQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7cUJBQ2hFO29CQUVELElBQUksU0FBUyxDQUFDLFlBQVksS0FBSyxTQUFTLEVBQUU7d0JBQ3pDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw0QkFBa0IsQ0FBQyxxQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7cUJBQ2hFO29CQUVELElBQUksU0FBUyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7d0JBQ3ZDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw0QkFBa0IsQ0FBQyxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7cUJBQzlEO29CQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLFNBQVMsRUFBRSxrQkFBVSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFFM0UsT0FBTyxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztpQkFDeEU7Z0JBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsR0FBRyxLQUFLLFNBQVMsSUFBSSxXQUFXLENBQUMsWUFBWSxFQUFFO29CQUM5RSxNQUFNLFVBQVUsR0FBRyxNQUFNLDJCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDdkQsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxNQUFNLEVBQUU7d0JBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7d0JBQ25DLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7cUJBQ2hDO29CQUVELElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsTUFBTSxFQUFFO3dCQUNyQyxPQUFPO3FCQUNQO29CQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELElBQUksU0FBUyxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7b0JBQ3hDLE9BQU8sSUFBSSw4QkFBb0IsQ0FBQyxrQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUN0RDtnQkFFRCxJQUFJLFNBQVMsQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFO29CQUN6QyxPQUFPLElBQUksNEJBQWtCLENBQUMscUJBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdEQ7Z0JBRUQsSUFBSSxTQUFTLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtvQkFDdkMsT0FBTyxJQUFJLDRCQUFrQixDQUFDLHFCQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3BEO2dCQUVELE9BQU8sSUFBSSxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsa0JBQVUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlFLENBQUM7U0FBQTtLQUVEO0lBN0RELDRCQTZEQyJ9