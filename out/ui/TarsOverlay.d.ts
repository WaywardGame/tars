import Tile from "game/tile/Tile";
export declare class TarsOverlay {
    private readonly overlay;
    private alpha;
    show(): void;
    hide(): void;
    addOrUpdate(tile: Tile, isBaseTile: boolean, isDisabled: boolean, penalty: number): void;
    clear(): void;
    private updateAlpha;
}
