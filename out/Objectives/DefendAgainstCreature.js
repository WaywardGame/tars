var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "entity/IStats", "Enums", "player/IPlayer", "../IObjective", "../Objective", "../Utilities/Movement", "./ExecuteAction"], function (require, exports, IAction_1, IStats_1, Enums_1, IPlayer_1, IObjective_1, Objective_1, Movement_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DefendAgainstCreature extends Objective_1.default {
        constructor(creature) {
            super();
            this.creature = creature;
        }
        getHashCode() {
            return `DefendAgainstCreature:${this.creature.getName(false).getString()}`;
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
                return new ExecuteAction_1.default(IAction_1.ActionType.Move, action => action.execute(localPlayer, direction));
            });
        }
    }
    exports.default = DefendAgainstCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmZW5kQWdhaW5zdENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvRGVmZW5kQWdhaW5zdENyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBVUEsTUFBcUIscUJBQXNCLFNBQVEsbUJBQVM7UUFFM0QsWUFBNkIsUUFBbUI7WUFDL0MsS0FBSyxFQUFFLENBQUM7WUFEb0IsYUFBUSxHQUFSLFFBQVEsQ0FBVztRQUVoRCxDQUFDO1FBRU0sV0FBVztZQUNqQixPQUFPLHlCQUF5QixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQzVFLENBQUM7UUFFWSxTQUFTOztnQkFDckIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDL0IsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFRLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO29CQUNqRyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssb0JBQVksQ0FBQyxLQUFLLEVBQUU7b0JBRXpDLE1BQU0sNkJBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBRW5DLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sMkJBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3BELElBQUksVUFBVSxLQUFLLHFCQUFVLENBQUMsUUFBUSxFQUFFO29CQUN2QyxPQUFPO2lCQUNQO2dCQUtELE1BQU0sU0FBUyxHQUFHLGtDQUF3QixDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFbkcsT0FBTyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzdGLENBQUM7U0FBQTtLQUVEO0lBcENELHdDQW9DQyJ9