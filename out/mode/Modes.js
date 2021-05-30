define(["require", "exports", "../ITars", "./modes/Survival", "./modes/TidyUp"], function (require, exports, ITars_1, Survival_1, TidyUp_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.modes = void 0;
    exports.modes = new Map();
    exports.modes.set(ITars_1.TarsMode.Survival, new Survival_1.SurvivalMode());
    exports.modes.set(ITars_1.TarsMode.TidyUp, new TidyUp_1.TidyUpMode());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZS9Nb2Rlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBTWEsUUFBQSxLQUFLLEdBQTZCLElBQUksR0FBRyxFQUFFLENBQUM7SUFFekQsYUFBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLHVCQUFZLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELGFBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxtQkFBVSxFQUFFLENBQUMsQ0FBQyJ9