define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.missionImpossible = 1000000;
    var ObjectiveStatus;
    (function (ObjectiveStatus) {
        ObjectiveStatus[ObjectiveStatus["Complete"] = -1] = "Complete";
    })(ObjectiveStatus = exports.ObjectiveStatus || (exports.ObjectiveStatus = {}));
    var ObjectiveType;
    (function (ObjectiveType) {
        ObjectiveType[ObjectiveType["AcquireItem"] = 0] = "AcquireItem";
        ObjectiveType[ObjectiveType["Build"] = 1] = "Build";
        ObjectiveType[ObjectiveType["DefendAgainstCreature"] = 2] = "DefendAgainstCreature";
        ObjectiveType[ObjectiveType["GatherDoodad"] = 3] = "GatherDoodad";
        ObjectiveType[ObjectiveType["GatherFromCreature"] = 4] = "GatherFromCreature";
        ObjectiveType[ObjectiveType["GatherFromTerrain"] = 5] = "GatherFromTerrain";
        ObjectiveType[ObjectiveType["GatherWater"] = 6] = "GatherWater";
        ObjectiveType[ObjectiveType["Idle"] = 7] = "Idle";
        ObjectiveType[ObjectiveType["None"] = 8] = "None";
        ObjectiveType[ObjectiveType["PlantSeed"] = 9] = "PlantSeed";
        ObjectiveType[ObjectiveType["RecoverHunger"] = 10] = "RecoverHunger";
        ObjectiveType[ObjectiveType["RecoverStamina"] = 11] = "RecoverStamina";
        ObjectiveType[ObjectiveType["RecoverThirst"] = 12] = "RecoverThirst";
        ObjectiveType[ObjectiveType["ReduceWeight"] = 13] = "ReduceWeight";
        ObjectiveType[ObjectiveType["Rest"] = 14] = "Rest";
        ObjectiveType[ObjectiveType["UseItem"] = 15] = "UseItem";
    })(ObjectiveType = exports.ObjectiveType || (exports.ObjectiveType = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSU9iamVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9JT2JqZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUdhLFFBQUEsaUJBQWlCLEdBQUcsT0FBTyxDQUFDO0lBRXpDLElBQVksZUFFWDtJQUZELFdBQVksZUFBZTtRQUMxQiw4REFBYSxDQUFBO0lBQ2QsQ0FBQyxFQUZXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBRTFCO0lBRUQsSUFBWSxhQWlCWDtJQWpCRCxXQUFZLGFBQWE7UUFDeEIsK0RBQVcsQ0FBQTtRQUNYLG1EQUFLLENBQUE7UUFDTCxtRkFBcUIsQ0FBQTtRQUNyQixpRUFBWSxDQUFBO1FBQ1osNkVBQWtCLENBQUE7UUFDbEIsMkVBQWlCLENBQUE7UUFDakIsK0RBQVcsQ0FBQTtRQUNYLGlEQUFJLENBQUE7UUFDSixpREFBSSxDQUFBO1FBQ0osMkRBQVMsQ0FBQTtRQUNULG9FQUFhLENBQUE7UUFDYixzRUFBYyxDQUFBO1FBQ2Qsb0VBQWEsQ0FBQTtRQUNiLGtFQUFZLENBQUE7UUFDWixrREFBSSxDQUFBO1FBQ0osd0RBQU8sQ0FBQTtJQUNSLENBQUMsRUFqQlcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFpQnhCIn0=