var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "utilities/math/Vector2", "../IObjective", "../Objective", "./CarveCorpse", "../Utilities/Movement", "../Utilities/Object", "../Utilities/Item", "./AcquireItemForAction"], function (require, exports, IAction_1, Vector2_1, IObjective_1, Objective_1, CarveCorpse_1, Movement_1, Object_1, Item_1, AcquireItemForAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromCreature extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
        }
        getHashCode() {
            return `GatherFromCreature:${this.search.map(search => `${search.type},${itemManager.getItemTypeGroupName(search.itemType, false)}`).join("|")}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                const canCarveCorpse = Item_1.getInventoryItemsWithUse(IAction_1.ActionType.Carve).length > 0;
                const isTargetCorpse = (corpse) => {
                    for (const search of this.search) {
                        if (search.type === corpse.type) {
                            return true;
                        }
                    }
                    return false;
                };
                const isTargetCreature = (creature) => {
                    if (!creature.isTamed()) {
                        for (const search of this.search) {
                            if (search.type === creature.type) {
                                return true;
                            }
                        }
                    }
                    return false;
                };
                if (calculateDifficulty) {
                    const objectives = [];
                    if (!canCarveCorpse) {
                        objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Carve));
                    }
                    let target = Object_1.findCarvableCorpse(this.getHashCode(), isTargetCorpse);
                    if (target === undefined) {
                        target = Object_1.findCreature(this.getHashCode(), isTargetCreature);
                    }
                    if (target === undefined) {
                        return IObjective_1.missionImpossible;
                    }
                    return Math.round(Vector2_1.default.squaredDistance(localPlayer, target)) + (yield this.calculateObjectiveDifficulties(base, inventory, ...objectives));
                }
                if (!canCarveCorpse) {
                    return new AcquireItemForAction_1.default(IAction_1.ActionType.Carve);
                }
                let moveResult = yield Movement_1.findAndMoveToFaceCorpse(this.getHashCode(), isTargetCorpse);
                if (moveResult === Movement_1.MoveResult.NoTarget || moveResult === Movement_1.MoveResult.NoPath) {
                    this.log.info("Moving to creature");
                    moveResult = yield Movement_1.findAndMoveToCreature(this.getHashCode(), isTargetCreature);
                    if (moveResult === Movement_1.MoveResult.NoPath) {
                        this.log.info("No path to creature");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                    if (moveResult === Movement_1.MoveResult.NoTarget) {
                        this.log.info("No target creature");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                }
                if (moveResult === Movement_1.MoveResult.Moving) {
                    return;
                }
                const corpses = localPlayer.getFacingTile().corpses;
                if (corpses && corpses.length > 0) {
                    this.log.info("Carving corpse");
                    return new CarveCorpse_1.default(corpses[0]);
                }
                this.log.info("No more corpses");
                return IObjective_1.ObjectiveStatus.Complete;
            });
        }
        getBaseDifficulty(base, inventory) {
            return 50;
        }
    }
    exports.default = GatherFromCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvR2F0aGVyRnJvbUNyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBY0EsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFeEQsWUFBNkIsTUFBeUI7WUFDckQsS0FBSyxFQUFFLENBQUM7WUFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7UUFFdEQsQ0FBQztRQUVNLFdBQVc7WUFDakIsT0FBTyxzQkFBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2xKLENBQUM7UUFFWSxTQUFTLENBQUMsSUFBVyxFQUFFLFNBQTBCLEVBQUUsbUJBQTRCOztnQkFDM0YsTUFBTSxjQUFjLEdBQUcsK0JBQXdCLENBQUMsb0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUU3RSxNQUFNLGNBQWMsR0FBRyxDQUFDLE1BQWUsRUFBRSxFQUFFO29CQUMxQyxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ2pDLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFOzRCQUNoQyxPQUFPLElBQUksQ0FBQzt5QkFDWjtxQkFDRDtvQkFFRCxPQUFPLEtBQUssQ0FBQztnQkFDZCxDQUFDLENBQUM7Z0JBRUYsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLFFBQW1CLEVBQUUsRUFBRTtvQkFDaEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRTt3QkFDeEIsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFOzRCQUNqQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLElBQUksRUFBRTtnQ0FDbEMsT0FBTyxJQUFJLENBQUM7NkJBQ1o7eUJBQ0Q7cUJBQ0Q7b0JBRUQsT0FBTyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDO2dCQUVGLElBQUksbUJBQW1CLEVBQUU7b0JBQ3hCLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7b0JBRXBDLElBQUksQ0FBQyxjQUFjLEVBQUU7d0JBQ3BCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7cUJBQzVEO29CQUVELElBQUksTUFBTSxHQUFHLDJCQUFrQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDcEUsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO3dCQUN6QixNQUFNLEdBQUcscUJBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztxQkFDNUQ7b0JBRUQsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO3dCQUN6QixPQUFPLDhCQUFpQixDQUFDO3FCQUN6QjtvQkFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQU8sQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUcsTUFBTSxJQUFJLENBQUMsOEJBQThCLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxHQUFHLFVBQVUsQ0FBQyxDQUFBLENBQUM7aUJBQzVJO2dCQUVELElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQ3BCLE9BQU8sSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNsRDtnQkFFRCxJQUFJLFVBQVUsR0FBRyxNQUFNLGtDQUF1QixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztnQkFDbkYsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxRQUFRLElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsTUFBTSxFQUFFO29CQUMzRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUNwQyxVQUFVLEdBQUcsTUFBTSxnQ0FBcUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFFL0UsSUFBSSxVQUFVLEtBQUsscUJBQVUsQ0FBQyxNQUFNLEVBQUU7d0JBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7d0JBQ3JDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7cUJBQ2hDO29CQUVELElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO3dCQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO3dCQUNwQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO3FCQUNoQztpQkFDRDtnQkFFRCxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLE1BQU0sRUFBRTtvQkFDckMsT0FBTztpQkFDUDtnQkFFRCxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDO2dCQUNwRCxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDaEMsT0FBTyxJQUFJLHFCQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ25DO2dCQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBRWpDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQztTQUFBO1FBRVMsaUJBQWlCLENBQUMsSUFBVyxFQUFFLFNBQTBCO1lBQ2xFLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUVEO0lBN0ZELHFDQTZGQyJ9