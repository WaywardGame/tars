import EventEmitter from "event/EventEmitter";
import type { IActionApi } from "game/entity/action/IAction";
import { ActionType } from "game/entity/action/IAction";
import Corpse from "game/entity/creature/corpse/Corpse";
import CorpseManager from "game/entity/creature/corpse/CorpseManager";
import type Creature from "game/entity/creature/Creature";
import CreatureManager from "game/entity/creature/CreatureManager";
import Human from "game/entity/Human";
import type { IStat } from "game/entity/IStats";
import NPC from "game/entity/npc/NPC";
import type { INote } from "game/entity/player/note/NoteManager";
import type Player from "game/entity/player/Player";
import { TileUpdateType } from "game/IGame";
import type Island from "game/island/Island";
import Item from "game/item/Item";
import ItemManager from "game/item/ItemManager";
import type { IPromptDescriptionBase } from "game/meta/prompt/IPrompt";
import type Prompts from "game/meta/prompt/Prompts";
import type { IPrompt } from "game/meta/prompt/Prompts";
import { ITile } from "game/tile/ITerrain";
import { WorldZ } from "game/WorldZ";
import InterruptChoice from "language/dictionary/InterruptChoice";
import Translation from "language/Translation";
import { ISaveData, ISaveDataContainer } from "../ITarsMod";
import type TarsNPC from "../npc/TarsNPC";
import { TarsOverlay } from "../ui/TarsOverlay";
import Context from "./context/Context";
import { ITarsEvents } from "./ITars";
import { ITarsOptions } from "./ITarsOptions";
import type { ITarsMode } from "./mode/IMode";
import { AttackType } from "game/entity/IEntity";
export default class Tars extends EventEmitter.Host<ITarsEvents> {
    readonly human: Human;
    readonly saveData: ISaveData;
    private readonly overlay;
    private readonly log;
    private readonly planner;
    private readonly executor;
    private base;
    private inventory;
    private readonly utilities;
    private readonly statThresholdExceeded;
    private quantumBurstCooldown;
    private weightStatus;
    private previousWeightStatus;
    private lastStatusMessage;
    private context;
    private objectivePipeline;
    private interruptObjectivePipeline;
    private interruptContext;
    private readonly interruptContexts;
    private interruptIds;
    private tickTimeoutId;
    private navigationSystemState;
    private navigationUpdatePromise;
    private readonly navigationQueuedUpdates;
    private readonly modeCache;
    private loaded;
    constructor(human: Human, saveData: ISaveData, overlay: TarsOverlay);
    getName(): import("../../node_modules/@wayward/types/definitions/game/language/impl/TranslationImpl").default;
    getDialogSubId(): string;
    private delete;
    getSaveDataContainer(): ISaveDataContainer;
    loadSaveData(container: ISaveDataContainer): void;
    load(): void;
    unload(): void;
    disable(gameIsTravelingOrEnding?: boolean): void;
    onPlayerSpawn(player: Player): void;
    onWriteNote(player: Player, note: INote): false | void;
    onPlayerDeath(): void;
    onPlayerRespawn(): void;
    onItemRemove(_: ItemManager, item: Item): void;
    onCreatureRemove(_: CreatureManager, creature: Creature): void;
    onCorpseRemove(_: CorpseManager, corpse: Corpse): void;
    onRestEnd(human: Human): void;
    onCreaturePostMove(creature: Creature, fromX: number, fromY: number, fromZ: number, fromTile: ITile, toX: number, toY: number, toZ: number, toTile: ITile): Promise<void>;
    onNpcRenamed(npc: NPC): void;
    onHumanPostMove(human: Human, fromX: number, fromY: number, fromZ: number, fromTile: ITile, toX: number, toY: number, toZ: number, toTile: ITile): Promise<void>;
    onMoveComplete(human: Human): void;
    onPrompt(host: Prompts.Events, prompt: IPrompt<IPromptDescriptionBase<any[]>>): string | boolean | void | InterruptChoice | undefined;
    onTileUpdate(island: Island, tile: ITile, tileX: number, tileY: number, tileZ: number, tileUpdateType: TileUpdateType): void;
    postExecuteAction(_: any, actionType: ActionType, api: IActionApi, args: any[]): void;
    processInput(human: Human): false | undefined;
    onChangeZ(human: Human, z: WorldZ, lastZ: WorldZ): void;
    onPreMove(human: Human, prevX: number, prevY: number, prevZ: number, prevTile: ITile, nextX: number, nextY: number, nextZ: number, nextTile: ITile): void;
    onCanAttack(human: Human, weapon: Item | undefined, attackType: AttackType): boolean | undefined;
    onStatChange(human: Human, stat: IStat): void;
    onStatMaxChanged(human: Human, stat: IStat, oldValue: number | undefined): void;
    private onWeightChange;
    onMoveToIsland(human: Human): Promise<void>;
    getContext(): Context;
    get asNPC(): TarsNPC | undefined;
    isEnabled(): boolean;
    isRunning(): boolean;
    isQuantumBurstEnabled(): boolean;
    canToggle(): boolean;
    toggle(enabled?: boolean): Promise<void>;
    updateOptions(options: Partial<ITarsOptions>): void;
    updateWalkPath(path: IVector2[]): void;
    activateManualMode(modeInstance: ITarsMode): Promise<void>;
    getStatus(): Translation | string;
    updateStatus(): void;
    ensureSailingMode(sailingMode: boolean): Promise<void>;
    private ensureNavigation;
    private getOrCreateModeInstance;
    private initializeMode;
    private disposeMode;
    private reset;
    private createContext;
    private clearCaches;
    private getCurrentObjective;
    private interrupt;
    private fullInterrupt;
    private tick;
    private onTick;
    private getInterrupts;
    private getRecoverInterrupts;
    private optionsInterrupt;
    private equipmentInterrupt;
    private equipInterrupt;
    private repairsInterrupt;
    private repairInterrupt;
    private nearbyCreatureInterrupt;
    private checkNearbyCreature;
    private buildItemObjectives;
    private gatherFromCorpsesInterrupt;
    private reduceWeightInterrupt;
    private returnToBaseInterrupt;
    private escapeCavesInterrupt;
    private organizeInventoryInterrupts;
    private organizeBackpackInterrupts;
    private processQueuedNavigationUpdates;
    private processQuantumBurst;
}
