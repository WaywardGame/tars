define(["require", "exports", "../ITars", "./modes/Gardener", "./modes/Quest", "./modes/Survival", "./modes/Terminator", "./modes/TidyUp"], function (require, exports, ITars_1, Gardener_1, Quest_1, Survival_1, Terminator_1, TidyUp_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.modes = void 0;
    exports.modes = new Map();
    exports.modes.set(ITars_1.TarsMode.Survival, new Survival_1.SurvivalMode());
    exports.modes.set(ITars_1.TarsMode.TidyUp, new TidyUp_1.TidyUpMode());
    exports.modes.set(ITars_1.TarsMode.Gardener, new Gardener_1.GardenerMode());
    exports.modes.set(ITars_1.TarsMode.Terminator, new Terminator_1.TerminatorMode());
    exports.modes.set(ITars_1.TarsMode.Quest, new Quest_1.QuestMode());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZS9Nb2Rlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBU2EsUUFBQSxLQUFLLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7SUFFekQsYUFBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLHVCQUFZLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELGFBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxtQkFBVSxFQUFFLENBQUMsQ0FBQztJQUM3QyxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsUUFBUSxFQUFFLElBQUksdUJBQVksRUFBRSxDQUFDLENBQUM7SUFDakQsYUFBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBUSxDQUFDLFVBQVUsRUFBRSxJQUFJLDJCQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELGFBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxpQkFBUyxFQUFFLENBQUMsQ0FBQyJ9