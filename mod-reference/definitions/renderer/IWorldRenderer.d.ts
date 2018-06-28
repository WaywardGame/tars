import * as TileAdaptor from "renderer/TileAdaptors";
import WorldLayerRenderer from "renderer/WorldLayerRenderer";
import { IBound3 } from "utilities/math/Bound3";
import Vec2 from "utilities/math/Vector2";
export interface IWorldRenderer {
    positionBuffer: WebGLBuffer;
    layers: WorldLayerRenderer[];
    dirtAdaptor: TileAdaptor.Dirt;
    tillAdaptor: TileAdaptor.Till;
    waterAdaptor: TileAdaptor.Water;
    lavaAdaptor: TileAdaptor.Lava;
    fenceAdaptor: TileAdaptor.Fence;
    mountainAdaptor: TileAdaptor.Mountain;
    wallAdaptor: TileAdaptor.Wall;
    defaultAdaptor: TileAdaptor.Default;
    floorAdaptor: TileAdaptor.Floor;
    updateAll(): void;
    setSpriteTexture(texture: WebGLTexture, textureSizeInversed: Vec2): any;
    getPixelSize(): number;
    getZoom(): number;
    getTileScale(): number;
    setTileScale(tileScale: number): void;
    setZoom(zoom: number): void;
    setViewport(view: Vec2): void;
    getViewport(): Vec2;
    getTileViewport(): Vec2;
    getAmbientColor(): number[];
    renderWorld(x: number, y: number, z: number): void;
    render(): void;
    screenToTile(screenX: number, screenY: number): Vec2;
    getViewportBounds(): IBound3;
    computeSpritesInViewport(): void;
    batchCreatures(): void;
}
export default IWorldRenderer;
