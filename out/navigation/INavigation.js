define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.anyWaterTileLocation = exports.freshWaterTileLocation = exports.NavigationMessageType = void 0;
    var NavigationMessageType;
    (function (NavigationMessageType) {
        NavigationMessageType[NavigationMessageType["UpdateAllTiles"] = 0] = "UpdateAllTiles";
        NavigationMessageType[NavigationMessageType["UpdateTile"] = 1] = "UpdateTile";
        NavigationMessageType[NavigationMessageType["GetTileLocations"] = 2] = "GetTileLocations";
    })(NavigationMessageType = exports.NavigationMessageType || (exports.NavigationMessageType = {}));
    exports.freshWaterTileLocation = -1;
    exports.anyWaterTileLocation = -2;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSU5hdmlnYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbmF2aWdhdGlvbi9JTmF2aWdhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBRUEsSUFBWSxxQkFJWDtJQUpELFdBQVkscUJBQXFCO1FBQ2hDLHFGQUFjLENBQUE7UUFDZCw2RUFBVSxDQUFBO1FBQ1YseUZBQWdCLENBQUE7SUFDakIsQ0FBQyxFQUpXLHFCQUFxQixHQUFyQiw2QkFBcUIsS0FBckIsNkJBQXFCLFFBSWhDO0lBOENZLFFBQUEsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFNUIsUUFBQSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsQ0FBQyJ9