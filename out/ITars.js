define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultMaxTilesChecked = 3000;
    exports.gardenMaxTilesChecked = 1024;
    exports.desertCutoff = 512;
    var MoveResult;
    (function (MoveResult) {
        MoveResult[MoveResult["NoTarget"] = 0] = "NoTarget";
        MoveResult[MoveResult["NoPath"] = 1] = "NoPath";
        MoveResult[MoveResult["Moving"] = 2] = "Moving";
        MoveResult[MoveResult["Complete"] = 3] = "Complete";
    })(MoveResult = exports.MoveResult || (exports.MoveResult = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBTWEsUUFBQSxzQkFBc0IsR0FBRyxJQUFJLENBQUM7SUFFOUIsUUFBQSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7SUFFN0IsUUFBQSxZQUFZLEdBQUcsR0FBRyxDQUFDO0lBRWhDLElBQVksVUFLWDtJQUxELFdBQVksVUFBVTtRQUNyQixtREFBUSxDQUFBO1FBQ1IsK0NBQU0sQ0FBQTtRQUNOLCtDQUFNLENBQUE7UUFDTixtREFBUSxDQUFBO0lBQ1QsQ0FBQyxFQUxXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBS3JCIn0=