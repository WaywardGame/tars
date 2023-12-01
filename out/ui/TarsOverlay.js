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
define(["require", "exports", "@wayward/game/game/tile/ITerrain", "@wayward/game/renderer/overlay/GenericOverlay"], function (require, exports, ITerrain_1, GenericOverlay_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TarsOverlay = void 0;
    class TarsOverlay extends GenericOverlay_1.default {
        getDefaultAlpha() {
            return 150;
        }
        generateOverlayInfo(tile, isBaseTile, isDisabled, penalty) {
            let color;
            if (isBaseTile) {
                color = {
                    red: 255,
                    green: 0,
                    blue: 0,
                };
            }
            else {
                color = {
                    red: isDisabled ? 0 : Math.min(penalty, 255),
                    green: isDisabled ? 0 : 255,
                    blue: 0,
                };
            }
            return {
                type: ITerrain_1.OverlayType.Arrows,
                size: 16,
                offsetX: 0,
                offsetY: 48,
                ...color,
                alpha: this.alpha,
            };
        }
    }
    exports.TarsOverlay = TarsOverlay;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc092ZXJsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdWkvVGFyc092ZXJsYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQU9ILE1BQWEsV0FBWSxTQUFRLHdCQUF5RjtRQUV6RyxlQUFlO1lBQzlCLE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUVrQixtQkFBbUIsQ0FBQyxJQUFVLEVBQUUsVUFBbUIsRUFBRSxVQUFtQixFQUFFLE9BQWU7WUFDM0csSUFBSSxLQUFnQixDQUFDO1lBRXJCLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssR0FBRztvQkFDUCxHQUFHLEVBQUUsR0FBRztvQkFDUixLQUFLLEVBQUUsQ0FBQztvQkFDUixJQUFJLEVBQUUsQ0FBQztpQkFDUCxDQUFDO1lBRUgsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLEtBQUssR0FBRztvQkFDUCxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQztvQkFDNUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHO29CQUMzQixJQUFJLEVBQUUsQ0FBQztpQkFDUCxDQUFDO1lBQ0gsQ0FBQztZQUVELE9BQU87Z0JBQ04sSUFBSSxFQUFFLHNCQUFXLENBQUMsTUFBTTtnQkFDeEIsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsR0FBRyxLQUFLO2dCQUNSLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSzthQUNqQixDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBakNELGtDQWlDQyJ9