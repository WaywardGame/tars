var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "utilities/math/Vector2", "../Helpers", "../IObjective", "../ITars", "../Objective", "./CarveCorpse"], function (require, exports, Enums_1, Vector2_1, Helpers, IObjective_1, ITars_1, Objective_1, CarveCorpse_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherFromCreature extends Objective_1.default {
        constructor(search) {
            super();
            this.search = search;
        }
        getHashCode() {
            return `GatherFromCreature:${this.search.map(search => `${search.type},${Enums_1.ItemType[search.itemType]}`).join("|")}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
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
                    let target = Helpers.findCorpse(this.getHashCode(), isTargetCorpse);
                    if (target === undefined) {
                        target = Helpers.findCreature(this.getHashCode(), isTargetCreature);
                    }
                    return target === undefined ? IObjective_1.missionImpossible : Math.round(Vector2_1.default.squaredDistance(localPlayer, target));
                }
                let moveResult = yield Helpers.findAndMoveToCorpse(this.getHashCode(), isTargetCorpse);
                if (moveResult === ITars_1.MoveResult.NoTarget || moveResult === ITars_1.MoveResult.NoPath) {
                    this.log.info("Moving to creature");
                    moveResult = yield Helpers.findAndMoveToCreature(this.getHashCode(), isTargetCreature, true);
                    if (moveResult === ITars_1.MoveResult.NoPath) {
                        this.log.info("No path to creature");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                    if (moveResult === ITars_1.MoveResult.NoTarget) {
                        this.log.info("No target creature");
                        return IObjective_1.ObjectiveStatus.Complete;
                    }
                }
                if (moveResult === ITars_1.MoveResult.Moving) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyRnJvbUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvR2F0aGVyRnJvbUNyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBVUEsd0JBQXdDLFNBQVEsbUJBQVM7UUFFeEQsWUFBb0IsTUFBeUI7WUFDNUMsS0FBSyxFQUFFLENBQUM7WUFEVyxXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUU3QyxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLHNCQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxnQkFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDbkgsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixNQUFNLGNBQWMsR0FBRyxDQUFDLE1BQWUsRUFBRSxFQUFFO29CQUMxQyxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7d0JBQ2pDLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFOzRCQUNoQyxPQUFPLElBQUksQ0FBQzt5QkFDWjtxQkFDRDtvQkFFRCxPQUFPLEtBQUssQ0FBQztnQkFDZCxDQUFDLENBQUM7Z0JBRUYsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLFFBQW1CLEVBQUUsRUFBRTtvQkFDaEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRTt3QkFDeEIsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFOzRCQUNqQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLElBQUksRUFBRTtnQ0FDbEMsT0FBTyxJQUFJLENBQUM7NkJBQ1o7eUJBQ0Q7cUJBQ0Q7b0JBRUQsT0FBTyxLQUFLLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDO2dCQUVGLElBQUksbUJBQW1CLEVBQUU7b0JBQ3hCLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUNwRSxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7d0JBQ3pCLE1BQU0sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO3FCQUNwRTtvQkFFRCxPQUFPLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLDhCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFPLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2lCQUMzRztnQkFFRCxJQUFJLFVBQVUsR0FBRyxNQUFNLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQ3ZGLElBQUksVUFBVSxLQUFLLGtCQUFVLENBQUMsUUFBUSxJQUFJLFVBQVUsS0FBSyxrQkFBVSxDQUFDLE1BQU0sRUFBRTtvQkFDM0UsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztvQkFDcEMsVUFBVSxHQUFHLE1BQU0sT0FBTyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFFN0YsSUFBSSxVQUFVLEtBQUssa0JBQVUsQ0FBQyxNQUFNLEVBQUU7d0JBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7d0JBQ3JDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7cUJBQ2hDO29CQUVELElBQUksVUFBVSxLQUFLLGtCQUFVLENBQUMsUUFBUSxFQUFFO3dCQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO3dCQUNwQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO3FCQUNoQztpQkFDRDtnQkFFRCxJQUFJLFVBQVUsS0FBSyxrQkFBVSxDQUFDLE1BQU0sRUFBRTtvQkFDckMsT0FBTztpQkFDUDtnQkFFRCxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDO2dCQUNwRCxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDaEMsT0FBTyxJQUFJLHFCQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ25DO2dCQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBRWpDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQztTQUFBO1FBRVMsaUJBQWlCLENBQUMsSUFBVyxFQUFFLFNBQTBCO1lBQ2xFLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUVEO0lBN0VELHFDQTZFQyJ9