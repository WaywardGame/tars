/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "../../modes/Angler", "../../modes/Gardener", "../../modes/Harvester", "../../modes/Quest", "../../modes/Survival", "../../modes/Terminator", "../../modes/TidyUp", "../../modes/TreasureHunter", "../ITars"], function (require, exports, Angler_1, Gardener_1, Harvester_1, Quest_1, Survival_1, Terminator_1, TidyUp_1, TreasureHunter_1, ITars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.modes = void 0;
    exports.modes = new Map();
    exports.modes.set(ITars_1.TarsMode.Survival, Survival_1.SurvivalMode);
    exports.modes.set(ITars_1.TarsMode.TidyUp, TidyUp_1.TidyUpMode);
    exports.modes.set(ITars_1.TarsMode.Gardener, Gardener_1.GardenerMode);
    exports.modes.set(ITars_1.TarsMode.Harvester, Harvester_1.HarvesterMode);
    exports.modes.set(ITars_1.TarsMode.Terminator, Terminator_1.TerminatorMode);
    exports.modes.set(ITars_1.TarsMode.TreasureHunter, TreasureHunter_1.TreasureHunterMode);
    exports.modes.set(ITars_1.TarsMode.Quest, Quest_1.QuestMode);
    exports.modes.set(ITars_1.TarsMode.Angler, Angler_1.AnglerMode);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9tb2RlL01vZGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7SUFlVSxRQUFBLEtBQUssR0FBdUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUVuRSxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsUUFBUSxFQUFFLHVCQUFZLENBQUMsQ0FBQztJQUMzQyxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsTUFBTSxFQUFFLG1CQUFVLENBQUMsQ0FBQztJQUN2QyxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsUUFBUSxFQUFFLHVCQUFZLENBQUMsQ0FBQztJQUMzQyxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsU0FBUyxFQUFFLHlCQUFhLENBQUMsQ0FBQztJQUM3QyxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsVUFBVSxFQUFFLDJCQUFjLENBQUMsQ0FBQztJQUMvQyxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFRLENBQUMsY0FBYyxFQUFFLG1DQUFrQixDQUFDLENBQUM7SUFDdkQsYUFBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBUSxDQUFDLEtBQUssRUFBRSxpQkFBUyxDQUFDLENBQUM7SUFDckMsYUFBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBUSxDQUFDLE1BQU0sRUFBRSxtQkFBVSxDQUFDLENBQUMifQ==