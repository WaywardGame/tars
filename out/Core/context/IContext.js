define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MovingToNewIslandState = exports.ContextDataType = void 0;
    var ContextDataType;
    (function (ContextDataType) {
        ContextDataType["Position"] = "Position";
        ContextDataType["LastAcquiredItem"] = "LastAcquiredItem";
        ContextDataType["LastBuiltDoodad"] = "LastBuiltDoodad";
        ContextDataType["AllowOrganizingReservedItemsIntoIntermediateChest"] = "AllowOrganizingReservedItemsIntoIntermediateChest";
        ContextDataType["NextActionAllowsIntermediateChest"] = "NextActionAllowsIntermediateChest";
        ContextDataType["CanCraftFromIntermediateChest"] = "CanCraftFromIntermediateChest";
        ContextDataType["PrioritizeBaseChests"] = "PrioritizeBaseChests";
        ContextDataType["MovingToNewIsland"] = "MovingToNewIsland";
        ContextDataType["DisableMoveAwayFromBaseItemOrganization"] = "DisableMoveAwayFromBaseItemOrganization";
        ContextDataType["TamingCreature"] = "TamingCreature";
        ContextDataType["KeepInInventoryItems"] = "KeepInInventoryItems";
        ContextDataType["IsNearBase"] = "IsNearBase";
    })(ContextDataType = exports.ContextDataType || (exports.ContextDataType = {}));
    var MovingToNewIslandState;
    (function (MovingToNewIslandState) {
        MovingToNewIslandState[MovingToNewIslandState["None"] = 0] = "None";
        MovingToNewIslandState[MovingToNewIslandState["Preparing"] = 1] = "Preparing";
        MovingToNewIslandState[MovingToNewIslandState["Ready"] = 2] = "Ready";
    })(MovingToNewIslandState = exports.MovingToNewIslandState || (exports.MovingToNewIslandState = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSUNvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9jb250ZXh0L0lDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFVQSxJQUFZLGVBaURYO0lBakRELFdBQVksZUFBZTtRQUMxQix3Q0FBcUIsQ0FBQTtRQUNyQix3REFBcUMsQ0FBQTtRQUNyQyxzREFBbUMsQ0FBQTtRQUtuQywwSEFBdUcsQ0FBQTtRQUt2RywwRkFBdUUsQ0FBQTtRQUt2RSxrRkFBK0QsQ0FBQTtRQUsvRCxnRUFBNkMsQ0FBQTtRQUs3QywwREFBdUMsQ0FBQTtRQUt2QyxzR0FBbUYsQ0FBQTtRQUtuRixvREFBaUMsQ0FBQTtRQUtqQyxnRUFBNkMsQ0FBQTtRQUs3Qyw0Q0FBeUIsQ0FBQTtJQUMxQixDQUFDLEVBakRXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBaUQxQjtJQUVELElBQVksc0JBSVg7SUFKRCxXQUFZLHNCQUFzQjtRQUNqQyxtRUFBSSxDQUFBO1FBQ0osNkVBQVMsQ0FBQTtRQUNULHFFQUFLLENBQUE7SUFDTixDQUFDLEVBSlcsc0JBQXNCLEdBQXRCLDhCQUFzQixLQUF0Qiw4QkFBc0IsUUFJakMifQ==