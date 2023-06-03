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
        ContextDataType["RecoverStamina"] = "RecoverStamina";
    })(ContextDataType || (exports.ContextDataType = ContextDataType = {}));
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
    })(MovingToNewIslandState || (exports.MovingToNewIslandState = MovingToNewIslandState = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSUNvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9jb250ZXh0L0lDb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7SUFZSCxJQUFZLGVBeURYO0lBekRELFdBQVksZUFBZTtRQUMxQixvQ0FBaUIsQ0FBQTtRQUNqQix3REFBcUMsQ0FBQTtRQUNyQyxzREFBbUMsQ0FBQTtRQUtuQywwSEFBdUcsQ0FBQTtRQUt2RywwRkFBdUUsQ0FBQTtRQUt2RSxrRkFBK0QsQ0FBQTtRQUsvRCw4REFBMkMsQ0FBQTtRQUszQywwREFBdUMsQ0FBQTtRQUt2QyxzR0FBbUYsQ0FBQTtRQUtuRixvREFBaUMsQ0FBQTtRQUtqQyxnRUFBNkMsQ0FBQTtRQUs3QywwQ0FBdUIsQ0FBQTtRQUN2QiwwQ0FBdUIsQ0FBQTtRQUN2QiwwQ0FBdUIsQ0FBQTtRQUN2QiwwQ0FBdUIsQ0FBQTtRQUt2QixvREFBaUMsQ0FBQTtJQUNsQyxDQUFDLEVBekRXLGVBQWUsK0JBQWYsZUFBZSxRQXlEMUI7SUFFWSxRQUFBLGdCQUFnQixHQUFzQjtRQUNsRCxlQUFlLENBQUMsU0FBUztRQUN6QixlQUFlLENBQUMsU0FBUztRQUN6QixlQUFlLENBQUMsU0FBUztRQUN6QixlQUFlLENBQUMsU0FBUztLQUN6QixDQUFDO0lBRUYsSUFBWSxzQkFJWDtJQUpELFdBQVksc0JBQXNCO1FBQ2pDLG1FQUFJLENBQUE7UUFDSiw2RUFBUyxDQUFBO1FBQ1QscUVBQUssQ0FBQTtJQUNOLENBQUMsRUFKVyxzQkFBc0Isc0NBQXRCLHNCQUFzQixRQUlqQyJ9