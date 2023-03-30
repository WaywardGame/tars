define(["require", "exports", "game/tile/ITerrain", "renderer/overlay/GenericOverlay"], function (require, exports, ITerrain_1, GenericOverlay_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc092ZXJsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdWkvVGFyc092ZXJsYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUtBLE1BQWEsV0FBWSxTQUFRLHdCQUF5RjtRQUV0RyxlQUFlO1lBQzNCLE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQztRQUVrQixtQkFBbUIsQ0FBQyxJQUFVLEVBQUUsVUFBbUIsRUFBRSxVQUFtQixFQUFFLE9BQWU7WUFDeEcsSUFBSSxLQUFnQixDQUFDO1lBRXJCLElBQUksVUFBVSxFQUFFO2dCQUNaLEtBQUssR0FBRztvQkFDSixHQUFHLEVBQUUsR0FBRztvQkFDUixLQUFLLEVBQUUsQ0FBQztvQkFDUixJQUFJLEVBQUUsQ0FBQztpQkFDVixDQUFDO2FBRUw7aUJBQU07Z0JBQ0gsS0FBSyxHQUFHO29CQUNKLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO29CQUM1QyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUc7b0JBQzNCLElBQUksRUFBRSxDQUFDO2lCQUNWLENBQUM7YUFDTDtZQUVELE9BQU87Z0JBQ0gsSUFBSSxFQUFFLHNCQUFXLENBQUMsTUFBTTtnQkFDeEIsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsR0FBRyxLQUFLO2dCQUNSLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSzthQUNwQixDQUFDO1FBQ04sQ0FBQztLQUNKO0lBakNELGtDQWlDQyJ9