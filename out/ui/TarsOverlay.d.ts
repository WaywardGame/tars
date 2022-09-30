import { ITile } from "game/tile/ITerrain";
export declare class TarsOverlay {
    private readonly overlay;
    private alpha;
    show(): void;
    hide(): void;
    addOrUpdate(tile: ITile, tileX: number, tileY: number, tileZ: number, isBaseTile: boolean, isDisabled: boolean, penalty: number): void;
    clear(): void;
    private updateAlpha;
}
