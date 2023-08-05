define(["require", "exports", "game/IGame", "../../IObjective", "../../objectives/core/Lambda", "../../objectives/other/Idle", "../../objectives/other/ReturnToBase", "../../objectives/utility/OrganizeInventory", "../../objectives/quest/CompleteQuests", "./CommonInitialObjectives"], function (require, exports, IGame_1, IObjective_1, Lambda_1, Idle_1, ReturnToBase_1, OrganizeInventory_1, CompleteQuests_1, CommonInitialObjectives_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuestMode = void 0;
    class QuestMode {
        async initialize(_, finished) {
            this.finished = finished;
        }
        async determineObjectives(context) {
            const objectives = [];
            objectives.push(...await (0, CommonInitialObjectives_1.getCommonInitialObjectives)(context));
            objectives.push(new CompleteQuests_1.default());
            objectives.push(new ReturnToBase_1.default());
            objectives.push(new OrganizeInventory_1.default());
            if (!multiplayer.isConnected()) {
                if (game.getTurnMode() !== IGame_1.TurnMode.RealTime) {
                    objectives.push(new Lambda_1.default(async () => {
                        this.finished(true);
                        return IObjective_1.ObjectiveResult.Complete;
                    }));
                }
                else {
                    objectives.push(new Idle_1.default());
                }
            }
            return objectives;
        }
    }
    exports.QuestMode = QuestMode;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kZS9tb2Rlcy9RdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBWUEsTUFBYSxTQUFTO1FBSVgsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFVLEVBQUUsUUFBb0M7WUFDcEUsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDN0IsQ0FBQztRQUVNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFnQjtZQUM3QyxNQUFNLFVBQVUsR0FBcUMsRUFBRSxDQUFDO1lBRXhELFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLElBQUEsb0RBQTBCLEVBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUU5RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQWMsRUFBRSxDQUFDLENBQUM7WUFFdEMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLEVBQUUsQ0FBQyxDQUFDO1lBRXBDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQkFBaUIsRUFBRSxDQUFDLENBQUM7WUFFekMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDNUIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssZ0JBQVEsQ0FBQyxRQUFRLEVBQUU7b0JBQzFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO3dCQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNwQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO29CQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUVQO3FCQUFNO29CQUNILFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxjQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUMvQjthQUNKO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQztLQUNKO0lBakNELDhCQWlDQyJ9