define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MovingToNewIslandState = exports.nearBaseDataKeys = exports.ContextDataType = void 0;
    var ContextDataType;
    (function (ContextDataType) {
        ContextDataType["Tile"] = "Position";
        ContextDataType["LastAcquiredItem"] = "LastAcquiredItem";
        ContextDataType["LastBuiltDoodad"] = "LastBuiltDoodad";
        ContextDataType["AllowOrganizingReservedItemsIntoIntermediateChest"] = "AllowOrganizingReservedItemsIntoIntermediateChest";
        ContextDataType["NextActionAllowsIntermediateChest"] = "NextActionAllowsIntermediateChest";
        ContextDataType["CanCraftFromIntermediateChest"] = "CanCraftFromIntermediateChest";
        ContextDataType["PrioritizeBaseItems"] = "PrioritizeBaseItems";
        ContextDataType["MovingToNewIsland"] = "MovingToNewIsland";
        ContextDataType["DisableMoveAwayFromBaseItemOrganization"] = "DisableMoveAwayFromBaseItemOrganization";
        ContextDataType["TamingCreature"] = "TamingCreature";
        ContextDataType["KeepInInventoryItems"] = "KeepInInventoryItems";
        ContextDataType["NearBase1"] = "NearBase1";
        ContextDataType["NearBase2"] = "NearBase2";
        ContextDataType["NearBase3"] = "NearBase3";
        ContextDataType["NearBase4"] = "NearBase4";
    })(ContextDataType = exports.ContextDataType || (exports.ContextDataType = {}));
    exports.nearBaseDataKeys = [
        ContextDataType.NearBase1,
        ContextDataType.NearBase2,
        ContextDataType.NearBase3,
        ContextDataType.NearBase4,
    ];
    var MovingToNewIslandState;
    (function (MovingToNewIslandState) {
        MovingToNewIslandState[MovingToNewIslandState["None"] = 0] = "None";
        MovingToNewIslandState[MovingToNewIslandState["Preparing"] = 1] = "Preparing";
        MovingToNewIslandState[MovingToNewIslandState["Ready"] = 2] = "Ready";
    })(MovingToNewIslandState = exports.MovingToNewIslandState || (exports.MovingToNewIslandState = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSUNvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9jb250ZXh0L0lDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFVQSxJQUFZLGVBb0RYO0lBcERELFdBQVksZUFBZTtRQUMxQixvQ0FBaUIsQ0FBQTtRQUNqQix3REFBcUMsQ0FBQTtRQUNyQyxzREFBbUMsQ0FBQTtRQUtuQywwSEFBdUcsQ0FBQTtRQUt2RywwRkFBdUUsQ0FBQTtRQUt2RSxrRkFBK0QsQ0FBQTtRQUsvRCw4REFBMkMsQ0FBQTtRQUszQywwREFBdUMsQ0FBQTtRQUt2QyxzR0FBbUYsQ0FBQTtRQUtuRixvREFBaUMsQ0FBQTtRQUtqQyxnRUFBNkMsQ0FBQTtRQUs3QywwQ0FBdUIsQ0FBQTtRQUN2QiwwQ0FBdUIsQ0FBQTtRQUN2QiwwQ0FBdUIsQ0FBQTtRQUN2QiwwQ0FBdUIsQ0FBQTtJQUN4QixDQUFDLEVBcERXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBb0QxQjtJQUVZLFFBQUEsZ0JBQWdCLEdBQXNCO1FBQ2xELGVBQWUsQ0FBQyxTQUFTO1FBQ3pCLGVBQWUsQ0FBQyxTQUFTO1FBQ3pCLGVBQWUsQ0FBQyxTQUFTO1FBQ3pCLGVBQWUsQ0FBQyxTQUFTO0tBQ3pCLENBQUM7SUFFRixJQUFZLHNCQUlYO0lBSkQsV0FBWSxzQkFBc0I7UUFDakMsbUVBQUksQ0FBQTtRQUNKLDZFQUFTLENBQUE7UUFDVCxxRUFBSyxDQUFBO0lBQ04sQ0FBQyxFQUpXLHNCQUFzQixHQUF0Qiw4QkFBc0IsS0FBdEIsOEJBQXNCLFFBSWpDIn0=