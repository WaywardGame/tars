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
import type CommandManager from "command/CommandManager";
import { IEventEmitter } from "event/EventEmitter";
import Human from "game/entity/Human";
import type { Source } from "game/entity/player/IMessageManager";
import type Player from "game/entity/player/Player";
import { IPromptConfirmDescription } from "game/meta/prompt/IPrompt";
import type Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import type Message from "language/dictionary/Message";
import Mod from "mod/Mod";
import type Bindable from "ui/input/Bindable";
import type { DialogId } from "ui/screen/screens/game/Dialogs";
import type { QuadrantComponentId } from "ui/screen/screens/game/IGameScreenApi";
import type { MenuBarButtonType } from "ui/screen/screens/game/static/menubar/IMenuBarButton";
import NPC from "game/entity/npc/NPC";
import { TranslationArg } from "language/ITranslation";
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
