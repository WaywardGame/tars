import { IOverlayInfo, ITile, OverlayType } from "game/tile/ITerrain";
import { IColorFul } from "utilities/Color";
import TileHelpers from "utilities/game/TileHelpers";

export class TarsOverlay {

    private readonly overlay: Map<string, IOverlayInfo> = new Map();

    private alpha = 0;

    public show() {
        this.updateAlpha(150);
    }

    public hide() {
        this.updateAlpha(0);
    }

    public addOrUpdate(tile: ITile, tileX: number, tileY: number, tileZ: number, isBaseTile: boolean, isDisabled: boolean, penalty: number) {
        const key = `${tileX},${tileY},${tileZ}`;

        let overlay = this.overlay.get(key);
        if (overlay) {
            TileHelpers.Overlay.remove(tile, overlay);
        }

        if (isBaseTile || isDisabled || penalty !== 0) {
            let color: IColorFul;

            if (isBaseTile) {
                color = {
                    red: 255,
                    green: 0,
                    blue: 0,
                };

            } else {
                color = {
                    red: isDisabled ? 0 : Math.min(penalty, 255),
                    green: isDisabled ? 0 : 255,
                    blue: 0,
                };
            }

            overlay = {
                type: OverlayType.Arrows,
                size: 16,
                offsetX: 0,
                offsetY: 48,
                ...color,
                alpha: this.alpha,
            };

            this.overlay.set(key, overlay);

            TileHelpers.Overlay.add(tile, overlay);

        } else if (overlay) {
            this.overlay.delete(key);
        }
    }

    public clear() {
        if (localIsland) {
            for (const [key, overlay] of this.overlay.entries()) {
                const [x, y, z] = key.split(",");
                TileHelpers.Overlay.remove(localIsland.getTile(parseInt(x, 10), parseInt(y, 10), parseInt(z, 10)), overlay);
            }
        }

        this.overlay.clear();
    }

    private updateAlpha(alpha: number) {
        this.alpha = alpha;

        for (const [, overlay] of this.overlay.entries()) {
            overlay.alpha = this.alpha;
        }
    }

}
