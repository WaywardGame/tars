var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "entity/IStats", "Enums", "../Helpers", "../IObjective", "../Objective"], function (require, exports, IStats_1, Enums_1, Helpers, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DefendAgainstCreature extends Objective_1.default {
        constructor(creature) {
            super();
            this.creature = creature;
        }
        onExecute() {
            return __awaiter(this, void 0, void 0, function* () {
                const creature = this.creature;
                if (creature.getStat(IStats_1.Stat.Health).value <= 0 || creature.getTile().creature === undefined) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                if (creature.type === Enums_1.CreatureType.Shark) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
                Helpers.moveToTarget(creature, true);
            });
        }
    }
    exports.default = DefendAgainstCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmZW5kQWdhaW5zdENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvRGVmZW5kQWdhaW5zdENyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBT0EsMkJBQTJDLFNBQVEsbUJBQVM7UUFFM0QsWUFBb0IsUUFBbUI7WUFDdEMsS0FBSyxFQUFFLENBQUM7WUFEVyxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBRXZDLENBQUM7UUFFWSxTQUFTOztnQkFDckIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDL0IsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFRLGFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO29CQUNqRyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2lCQUNoQztnQkFFRCxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssb0JBQVksQ0FBQyxLQUFLLEVBQUU7b0JBRXpDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7aUJBQ2hDO2dCQUdELE9BQU8sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3RDLENBQUM7U0FBQTtLQUVEO0lBckJELHdDQXFCQyJ9