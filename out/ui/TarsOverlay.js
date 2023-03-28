define(["require", "exports", "game/tile/ITerrain", "renderer/overlay/GenericOverlay"], function (require, exports, ITerrain_1, GenericOverlay_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TarsOverlay = void 0;
    class TarsOverlay extends GenericOverlay_1.default {
        getDefaultAlpha() {
            return 150;
        }
        generateOverlayInfo(tile, isBaseTile, isDisabled, penalty) {
            if (!isBaseTile && !isDisabled && penalty === 0) {
                return undefined;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc092ZXJsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdWkvVGFyc092ZXJsYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUtBLE1BQWEsV0FBWSxTQUFRLHdCQUF5RjtRQUV0RyxlQUFlO1lBQzNCLE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQztRQUVrQixtQkFBbUIsQ0FBQyxJQUFVLEVBQUUsVUFBbUIsRUFBRSxVQUFtQixFQUFFLE9BQWU7WUFDeEcsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsSUFBSSxPQUFPLEtBQUssQ0FBQyxFQUFFO2dCQUM3QyxPQUFPLFNBQVMsQ0FBQzthQUNwQjtZQUVELElBQUksS0FBZ0IsQ0FBQztZQUVyQixJQUFJLFVBQVUsRUFBRTtnQkFDWixLQUFLLEdBQUc7b0JBQ0osR0FBRyxFQUFFLEdBQUc7b0JBQ1IsS0FBSyxFQUFFLENBQUM7b0JBQ1IsSUFBSSxFQUFFLENBQUM7aUJBQ1YsQ0FBQzthQUVMO2lCQUFNO2dCQUNILEtBQUssR0FBRztvQkFDSixHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQztvQkFDNUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHO29CQUMzQixJQUFJLEVBQUUsQ0FBQztpQkFDVixDQUFDO2FBQ0w7WUFFRCxPQUFPO2dCQUNILElBQUksRUFBRSxzQkFBVyxDQUFDLE1BQU07Z0JBQ3hCLElBQUksRUFBRSxFQUFFO2dCQUNSLE9BQU8sRUFBRSxDQUFDO2dCQUNWLE9BQU8sRUFBRSxFQUFFO2dCQUNYLEdBQUcsS0FBSztnQkFDUixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7YUFDcEIsQ0FBQztRQUNOLENBQUM7S0FDSjtJQXJDRCxrQ0FxQ0MifQ==