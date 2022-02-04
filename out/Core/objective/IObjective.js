define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CalculatedDifficultyStatus = exports.ObjectiveResult = void 0;
    var ObjectiveResult;
    (function (ObjectiveResult) {
        ObjectiveResult[ObjectiveResult["Complete"] = -1] = "Complete";
        ObjectiveResult[ObjectiveResult["Pending"] = -2] = "Pending";
        ObjectiveResult[ObjectiveResult["Ignore"] = -3] = "Ignore";
        ObjectiveResult[ObjectiveResult["Restart"] = -4] = "Restart";
        ObjectiveResult[ObjectiveResult["Impossible"] = -5] = "Impossible";
    })(ObjectiveResult = exports.ObjectiveResult || (exports.ObjectiveResult = {}));
    var CalculatedDifficultyStatus;
    (function (CalculatedDifficultyStatus) {
        CalculatedDifficultyStatus[CalculatedDifficultyStatus["Impossible"] = -5] = "Impossible";
        CalculatedDifficultyStatus[CalculatedDifficultyStatus["NotCalculatedYet"] = -6] = "NotCalculatedYet";
        CalculatedDifficultyStatus[CalculatedDifficultyStatus["NotPlausible"] = -7] = "NotPlausible";
        CalculatedDifficultyStatus[CalculatedDifficultyStatus["Possible"] = -26] = "Possible";
    })(CalculatedDifficultyStatus = exports.CalculatedDifficultyStatus || (exports.CalculatedDifficultyStatus = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSU9iamVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL29iamVjdGl2ZS9JT2JqZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFTQSxJQUFZLGVBaUJYO0lBakJELFdBQVksZUFBZTtRQUUxQiw4REFBYSxDQUFBO1FBR2IsNERBQVksQ0FBQTtRQUlaLDBEQUFXLENBQUE7UUFJWCw0REFBWSxDQUFBO1FBR1osa0VBQWUsQ0FBQTtJQUNoQixDQUFDLEVBakJXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBaUIxQjtJQVlELElBQVksMEJBS1g7SUFMRCxXQUFZLDBCQUEwQjtRQUNyQyx3RkFBZSxDQUFBO1FBQ2Ysb0dBQXFCLENBQUE7UUFDckIsNEZBQWlCLENBQUE7UUFDakIscUZBQWMsQ0FBQTtJQUNmLENBQUMsRUFMVywwQkFBMEIsR0FBMUIsa0NBQTBCLEtBQTFCLGtDQUEwQixRQUtyQyJ9