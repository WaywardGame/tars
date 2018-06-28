define(["require", "exports", "Enums", "../Helpers", "../IObjective", "../Objective"], function (require, exports, Enums_1, Helpers, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DefendAgainstCreature extends Objective_1.default {
        constructor(creature) {
            super();
            this.creature = creature;
        }
        onExecute() {
            const creature = this.creature;
            if (creature.hp <= 0 || creature.getTile().creature === undefined) {
                return IObjective_1.ObjectiveStatus.Complete;
            }
            if (creature.type === Enums_1.CreatureType.Shark) {
                return IObjective_1.ObjectiveStatus.Complete;
            }
            Helpers.moveToTarget(creature, true);
        }
    }
    exports.default = DefendAgainstCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVmZW5kQWdhaW5zdENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvSW50ZXJydXB0cy9EZWZlbmRBZ2FpbnN0Q3JlYXR1cmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBTUEsMkJBQTJDLFNBQVEsbUJBQVM7UUFFM0QsWUFBb0IsUUFBbUI7WUFDdEMsS0FBSyxFQUFFLENBQUM7WUFEVyxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBRXZDLENBQUM7UUFFTSxTQUFTO1lBQ2YsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUMvQixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLE1BQU0sQ0FBQyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxvQkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBRTFDLE1BQU0sQ0FBQyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBR0QsT0FBTyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEMsQ0FBQztLQUVEO0lBckJELHdDQXFCQyJ9