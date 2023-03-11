define(["require", "exports", "game/tile/ITerrain"], function (require, exports, ITerrain_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TarsOverlay = void 0;
    class TarsOverlay {
        constructor() {
            this.overlay = new Map();
            this.alpha = 0;
        }
        show() {
            this.updateAlpha(150);
        }
        hide() {
            this.updateAlpha(0);
        }
        addOrUpdate(tile, isBaseTile, isDisabled, penalty) {
            const key = `${tile.x},${tile.y},${tile.z}`;
            let overlay = this.overlay.get(key);
            if (overlay) {
                tile.removeOverlay(overlay);
            }
            if (isBaseTile || isDisabled || penalty !== 0) {
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
                overlay = {
                    type: ITerrain_1.OverlayType.Arrows,
                    size: 16,
                    offsetX: 0,
                    offsetY: 48,
                    ...color,
                    alpha: this.alpha,
                };
                this.overlay.set(key, overlay);
                tile.addOverlay(overlay);
            }
            else if (overlay) {
                this.overlay.delete(key);
            }
        }
        clear() {
            if (localIsland) {
                for (const [key, overlay] of this.overlay.entries()) {
                    const [x, y, z] = key.split(",");
                    localIsland.getTile(parseInt(x, 10), parseInt(y, 10), parseInt(z, 10)).removeOverlay(overlay);
                }
            }
            this.overlay.clear();
        }
        updateAlpha(alpha) {
            this.alpha = alpha;
            for (const [, overlay] of this.overlay.entries()) {
                overlay.alpha = this.alpha;
            }
        }
    }
    exports.TarsOverlay = TarsOverlay;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFyc092ZXJsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdWkvVGFyc092ZXJsYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUlBLE1BQWEsV0FBVztRQUF4QjtZQUVxQixZQUFPLEdBQThCLElBQUksR0FBRyxFQUFFLENBQUM7WUFFeEQsVUFBSyxHQUFHLENBQUMsQ0FBQztRQXlFdEIsQ0FBQztRQXZFVSxJQUFJO1lBQ1AsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBRU0sSUFBSTtZQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUVNLFdBQVcsQ0FBQyxJQUFVLEVBQUUsVUFBbUIsRUFBRSxVQUFtQixFQUFFLE9BQWU7WUFDcEYsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRTVDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLElBQUksT0FBTyxFQUFFO2dCQUNULElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDL0I7WUFFRCxJQUFJLFVBQVUsSUFBSSxVQUFVLElBQUksT0FBTyxLQUFLLENBQUMsRUFBRTtnQkFDM0MsSUFBSSxLQUFnQixDQUFDO2dCQUVyQixJQUFJLFVBQVUsRUFBRTtvQkFDWixLQUFLLEdBQUc7d0JBQ0osR0FBRyxFQUFFLEdBQUc7d0JBQ1IsS0FBSyxFQUFFLENBQUM7d0JBQ1IsSUFBSSxFQUFFLENBQUM7cUJBQ1YsQ0FBQztpQkFFTDtxQkFBTTtvQkFDSCxLQUFLLEdBQUc7d0JBQ0osR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUM7d0JBQzVDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRzt3QkFDM0IsSUFBSSxFQUFFLENBQUM7cUJBQ1YsQ0FBQztpQkFDTDtnQkFFRCxPQUFPLEdBQUc7b0JBQ04sSUFBSSxFQUFFLHNCQUFXLENBQUMsTUFBTTtvQkFDeEIsSUFBSSxFQUFFLEVBQUU7b0JBQ1IsT0FBTyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxFQUFFLEVBQUU7b0JBQ1gsR0FBRyxLQUFLO29CQUNSLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztpQkFDcEIsQ0FBQztnQkFFRixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRS9CLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7YUFFNUI7aUJBQU0sSUFBSSxPQUFPLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzVCO1FBQ0wsQ0FBQztRQUVNLEtBQUs7WUFDUixJQUFJLFdBQVcsRUFBRTtnQkFDYixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRTtvQkFDakQsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDakMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDakc7YUFDSjtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDekIsQ0FBQztRQUVPLFdBQVcsQ0FBQyxLQUFhO1lBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBRW5CLEtBQUssTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDOUMsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO2FBQzlCO1FBQ0wsQ0FBQztLQUVKO0lBN0VELGtDQTZFQyJ9