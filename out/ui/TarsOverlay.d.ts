import { IOverlayInfo } from "game/tile/ITerrain";
import Tile from "game/tile/Tile";
import GenericOverlay from "renderer/overlay/GenericOverlay";
export declare class TarsOverlay extends GenericOverlay<IOverlayInfo, [isBaseTile: boolean, isDisabled: boolean, penalty: number]> {
    getDefaultAlpha(): number;
    protected generateOverlayInfo(tile: Tile, isBaseTile: boolean, isDisabled: boolean, penalty: number): IOverlayInfo | undefined;
}
