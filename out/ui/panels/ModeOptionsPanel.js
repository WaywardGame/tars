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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kZU9wdGlvbnNQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91aS9wYW5lbHMvTW9kZU9wdGlvbnNQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFRSCxNQUFxQixnQkFBaUIsU0FBUSxzQkFBWTtRQUV0RCxZQUFZLFlBQWtCO1lBQzFCLEtBQUssQ0FBQyxZQUFZLEVBQUUsb0NBQXlCLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRU0sY0FBYztZQUNqQixPQUFPLDBCQUFlLENBQUMsc0JBQXNCLENBQUM7UUFDbEQsQ0FBQztLQUVKO0lBVkQsbUNBVUMifQ==