/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
import type CommandManager from "@wayward/game/command/CommandManager";
import { IEventEmitter } from "@wayward/utilities/event/EventEmitter";
import Human from "@wayward/game/game/entity/Human";
import type { Source } from "@wayward/game/game/entity/player/IMessageManager";
import type Player from "@wayward/game/game/entity/player/Player";
import { IPromptConfirmDescription } from "@wayward/game/game/meta/prompt/IPrompt";
import type Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";
import type Message from "@wayward/game/language/dictionary/Message";
import Mod from "@wayward/game/mod/Mod";
import type Bindable from "@wayward/game/ui/input/Bindable";
import type { DialogId } from "@wayward/game/ui/screen/screens/game/Dialogs";
import type { QuadrantComponentId } from "@wayward/game/ui/screen/screens/game/IGameScreenApi";
import { type MenuBarButtonType } from "@wayward/game/ui/screen/screens/game/static/menubar/IMenuBarButton";
import NPC from "@wayward/game/game/entity/npc/NPC";
import { TranslationArg } from "@wayward/game/language/ITranslation";
import type { IGlobalSaveData, ISaveData, ISaveDataContainer, ITarsModEvents } from "./ITarsMod";
import { TarsTranslation } from "./ITarsMod";
import Tars from "./core/Tars";
export default class TarsMod extends Mod {
    static readonly INSTANCE: TarsMod;
    event: IEventEmitter<this, ITarsModEvents>;
    saveData: ISaveData;
    globalSaveData: IGlobalSaveData;
    readonly bindableToggleDialog: Bindable;
    readonly bindableToggleTars: Bindable;
    readonly messageSource: Source;
    readonly messageToggle: Message;
    readonly messageTaskComplete: Message;
    readonly messageTaskUnableToComplete: Message;
    readonly messageNavigationUpdating: Message;
    readonly messageNavigationUpdated: Message;
    readonly messageQuantumBurstStart: Message;
    readonly messageQuantumBurstCooldownStart: Message;
    readonly messageQuantumBurstCooldownEnd: Message;
    readonly dictionary: Dictionary;
    readonly promptDeleteConfirmation: IPromptConfirmDescription<[deleteName: TranslationArg]>;
    readonly dialogMain: DialogId;
    readonly menuBarButton: MenuBarButtonType;
    readonly quadrantComponent: QuadrantComponentId;
    private readonly tarsInstances;
    private readonly tarsOverlay;
    private readonly tarsNavigationKdTrees;
    private localPlayerTars;
    get tarsInstance(): Tars | undefined;
    onInitialize(): void;
    onUninitialize(): void;
    onLoad(): void;
    onUnload(): void;
    command(_: CommandManager, _player: Player, _args: string): void;
    onToggleTars(): boolean;
    addDataSlot(container: ISaveDataContainer): void;
    renameDataSlot(container: ISaveDataContainer, newName: string): void;
    removeDataSlot(container: ISaveDataContainer): void;
    importDataSlot(fileData: Uint8Array): void;
    exportDataSlot(container: ISaveDataContainer): void;
    refreshTarsInstanceReferences(): void;
    onGameStart(): Promise<void>;
    onGameEnd(): void;
    onPreSaveGame(): void;
    private saveDialogState;
    createAndLoadTars(human: Human, saveData: ISaveData): Tars;
    getStatus(): string;
    getTranslation(translation: TarsTranslation | string | Translation): Translation;
    initializeTarsSaveData(initial?: Partial<ISaveData>): ISaveData;
    onNPCSpawn(host: any, npc: NPC): void;
    spawnNpc(): void;
    private bindControllableNpc;
}
