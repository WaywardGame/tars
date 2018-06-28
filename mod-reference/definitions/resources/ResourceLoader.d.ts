import { IImageOverrideDescription } from "mod/IModInfo";
import { IResourceContainer, IResourceLoader } from "resources/IResourceLoader";
export default class ResourceLoader implements IResourceLoader {
    private concurrent;
    private loadingCount;
    private loadingInterval;
    private waitingSlots;
    private callback;
    private readonly maxConcurrent;
    private spritePacker;
    private tilePacker;
    private imageOverrides;
    initialize(gl: WebGL2RenderingContext): void;
    loadResources(container: IResourceContainer, callback: () => void): void;
    continueLoading(): void;
    takeLoadingSlot(callback: () => void): void;
    releaseLoadingSlot(): void;
    getImageOverride(src: string): Partial<IImageOverrideDescription> | undefined;
    updateImageOverrides(): void;
    private loadResourcesInternal;
    private loadCharacter;
    private loadCreatures;
    private loadCreature;
    private loadCorpses;
    private loadCorpse;
    private loadItems;
    private loadItem;
    private loadEquip;
    private loadSleep;
    private loadTerrains;
    private loadTerrain;
    private loadDoodads;
    private loadDoodad;
    private loadDoodadItems;
    private loadDoodadItem;
    private loadTileEvents;
    private loadTileEvent;
    private loadHairstyles;
    private loadHairstyle;
    private loadStatuses;
    private loadStatus;
    private loadOverlays;
    private loadOverlay;
    private loadOthers;
}
