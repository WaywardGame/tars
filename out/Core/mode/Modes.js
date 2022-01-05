define(["require", "exports", "../../modes/Gardener", "../../modes/Quest", "../../modes/Survival", "../../modes/Terminator", "../../modes/TidyUp", "../ITars"], function (require, exports, Gardener_1, Quest_1, Survival_1, Terminator_1, TidyUp_1, ITars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.modes = void 0;
    exports.modes = new Map();
    exports.modes.set(ITars_1.TarsMode.Survival, Survival_1.SurvivalMode);
    exports.modes.set(ITars_1.TarsMode.TidyUp, TidyUp_1.TidyUpMode);
    exports.modes.set(ITars_1.TarsMode.Gardener, Gardener_1.GardenerMode);
    exports.modes.set(ITars_1.TarsMode.Terminator, Terminator_1.TerminatorMode);
    exports.modes.set(ITars_1.TarsMode.Quest, Quest_1.QuestMode);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9tb2RlL01vZGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFVYSxRQUFBLEtBQUssR0FBdUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUVuRSxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsUUFBUSxFQUFFLHVCQUFZLENBQUMsQ0FBQztJQUMzQyxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsTUFBTSxFQUFFLG1CQUFVLENBQUMsQ0FBQztJQUN2QyxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsUUFBUSxFQUFFLHVCQUFZLENBQUMsQ0FBQztJQUMzQyxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsVUFBVSxFQUFFLDJCQUFjLENBQUMsQ0FBQztJQUMvQyxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsS0FBSyxFQUFFLGlCQUFTLENBQUMsQ0FBQyJ9