define(["require", "exports", "creature/ICreature", "Enums", "../Helpers", "../IObjective", "../Objective"], function (require, exports, ICreature_1, Enums_1, Helpers, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CollectCreature extends Objective_1.default {
        constructor(creature) {
            super();
            this.creature = creature;
        }
        getHandsEquipment() {
            return {
                use: Enums_1.ActionType.Gather
            };
        }
        onExecute() {
            const creature = this.creature;
            if ((creature.ai & ICreature_1.AiType.Hostile) === 0 || creature.hp <= 0 || game.getTile(creature.x, creature.y, creature.z).creature === undefined) {
                return IObjective_1.ObjectiveStatus.Complete;
            }
            Helpers.moveToTarget(creature, true);
        }
    }
    exports.default = CollectCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sbGVjdENyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL09iamVjdGl2ZXMvQ29sbGVjdENyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQU1BLHFCQUFxQyxTQUFRLG1CQUFTO1FBRXJELFlBQW9CLFFBQW1CO1lBQ3RDLEtBQUssRUFBRSxDQUFDO1lBRFcsYUFBUSxHQUFSLFFBQVEsQ0FBVztRQUV2QyxDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLE1BQU0sQ0FBQztnQkFDTixHQUFHLEVBQUUsa0JBQVUsQ0FBQyxNQUFNO2FBQ3RCLENBQUM7UUFDSCxDQUFDO1FBRU0sU0FBUztZQUNmLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDL0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLGtCQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDekksTUFBTSxDQUFDLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ2pDLENBQUM7WUFFRCxPQUFPLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0QyxDQUFDO0tBRUQ7SUFyQkQsa0NBcUJDIn0=