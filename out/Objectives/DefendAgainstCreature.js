var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "entity/IStats", "Enums", "../IObjective", "../Objective", "../Utilities/Movement", "player/IPlayer", "./ExecuteAction"], function (require, exports, IStats_1, Enums_1, IObjective_1, Objective_1, Movement_1, IPlayer_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DefendAgainstCreature extends Objective_1.default {
        constructor(creature) {
            super();
            this.creature = creature;
        }
        getHashCode() {
            return `DefendAgainstCreature:${game.getName(this.creature, Enums_1.SentenceCaseStyle.Title, false)}`;
        }
        onExecute() {
            return __awaiter(this, void 0, void 0, function* () {
                const creature = this.creature;
                if (creature.getStat(IStats_1.Stat.Health).value <= 0 || creature.getTile().creature === undefined) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (creature.type === Enums_1.CreatureType.Shark) {
                    yield Movement_1.moveAwayFromTarget(creature);
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                const moveResult = yield Movement_1.moveToFaceTarget(creature);
                if (moveResult !== Movement_1.MoveResult.Complete) {
                    return;
                }
                const direction = IPlayer_1.getDirectionFromMovement(creature.x - localPlayer.x, creature.y - localPlayer.y);
                return new ExecuteAction_1.default(Enums_1.ActionType.Move, {
                    direction: direction
                });
            });
        }
    }
    exports.default = DefendAgainstCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmZW5kQWdhaW5zdENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvRGVmZW5kQWdhaW5zdENyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBU0EsMkJBQTJDLFNBQVEsbUJBQVM7UUFFM0QsWUFBb0IsUUFBbUI7WUFDdEMsS0FBSyxFQUFFLENBQUM7WUFEVyxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBRXZDLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8seUJBQXlCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSx5QkFBaUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUMvRixDQUFDO1FBRVksU0FBUzs7Z0JBQ3JCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQy9CLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBUSxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtvQkFDakcsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7Z0JBRUQsSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLG9CQUFZLENBQUMsS0FBSyxFQUFFO29CQUV6QyxNQUFNLDZCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUVuQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLDJCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLFVBQVUsS0FBSyxxQkFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDdkMsT0FBTztpQkFDUDtnQkFLRCxNQUFNLFNBQVMsR0FBRyxrQ0FBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRW5HLE9BQU8sSUFBSSx1QkFBYSxDQUFDLGtCQUFVLENBQUMsSUFBSSxFQUFFO29CQUN6QyxTQUFTLEVBQUUsU0FBUztpQkFDcEIsQ0FBQyxDQUFDO1lBQ0osQ0FBQztTQUFBO0tBRUQ7SUF0Q0Qsd0NBc0NDIn0=