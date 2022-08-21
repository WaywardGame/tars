define(["require", "exports", "../../ITarsMod", "./OptionsPanel"], function (require, exports, ITarsMod_1, OptionsPanel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ModeOptionsPanel extends OptionsPanel_1.default {
        constructor(tarsInstance) {
            super(tarsInstance, ITarsMod_1.uiConfigurableModeOptions);
        }
        getTranslation() {
            return ITarsMod_1.TarsTranslation.DialogPanelModeOptions;
        }
    }
    exports.default = ModeOptionsPanel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kZU9wdGlvbnNQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91aS9wYW5lbHMvTW9kZU9wdGlvbnNQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFNQSxNQUFxQixnQkFBaUIsU0FBUSxzQkFBWTtRQUV0RCxZQUFZLFlBQWtCO1lBQzFCLEtBQUssQ0FBQyxZQUFZLEVBQUUsb0NBQXlCLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRU0sY0FBYztZQUNqQixPQUFPLDBCQUFlLENBQUMsc0JBQXNCLENBQUM7UUFDbEQsQ0FBQztLQUVKO0lBVkQsbUNBVUMifQ==