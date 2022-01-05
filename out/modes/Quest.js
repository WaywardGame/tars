define(["require", "exports", "game/IGame", "../core/objective/IObjective", "../objectives/core/Lambda", "../objectives/other/Idle", "../objectives/other/ReturnToBase", "../objectives/utility/OrganizeInventory", "../objectives/quest/CompleteQuests", "./CommonInitialObjectives"], function (require, exports, IGame_1, IObjective_1, Lambda_1, Idle_1, ReturnToBase_1, OrganizeInventory_1, CompleteQuests_1, CommonInitialObjectives_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZXMvUXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVlBLE1BQWEsU0FBUztRQUlYLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBVSxFQUFFLFFBQW9DO1lBQ3BFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQzdCLENBQUM7UUFFTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsT0FBZ0I7WUFDN0MsTUFBTSxVQUFVLEdBQXFDLEVBQUUsQ0FBQztZQUV4RCxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxJQUFBLG9EQUEwQixFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFFOUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLEVBQUUsQ0FBQyxDQUFDO1lBRXRDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxFQUFFLENBQUMsQ0FBQztZQUVwQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksMkJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBRXpDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQzVCLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLGdCQUFRLENBQUMsUUFBUSxFQUFFO29CQUMxQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLElBQUksRUFBRTt3QkFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDcEIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztvQkFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFFUDtxQkFBTTtvQkFDSCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksY0FBSSxFQUFFLENBQUMsQ0FBQztpQkFDL0I7YUFDSjtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7S0FDSjtJQWpDRCw4QkFpQ0MifQ==