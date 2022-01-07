import type { QuadrantComponentId } from "ui/screen/screens/game/IGameScreenApi";
import type CommandManager from "command/CommandManager";
import type { IEventEmitter } from "event/EventEmitter";
import type { Source } from "game/entity/player/IMessageManager";
import type Player from "game/entity/player/Player";
import type Dictionary from "language/Dictionary";
import type Message from "language/dictionary/Message";
import Translation from "language/Translation";
import Mod from "mod/Mod";
import type Bindable from "ui/input/Bindable";
import type { DialogId } from "ui/screen/screens/game/Dialogs";
import type { MenuBarButtonType } from "ui/screen/screens/game/static/menubar/IMenuBarButton";
import type { PlayerState } from "game/entity/player/IPlayer";
import type { ITarsModEvents, ISaveData } from "./ITarsMod";
import { TarsTranslation } from "./ITarsMod";
import Tars from "./core/Tars";
export default class TarsMod extends Mod {
    static readonly INSTANCE: TarsMod;
    event: IEventEmitter<this, ITarsModEvents>;
    saveData: ISaveData;
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
    readonly dialogMain: DialogId;
    readonly menuBarButton: MenuBarButtonType;
    readonly quadrantComponent: QuadrantComponentId;
    private tars;
    private readonly tarsOverlay;
    private gamePlaying;
    get tarsInstance(): Tars | undefined;
    onInitialize(): void;
    onUninitialize(): void;
    onLoad(): void;
    onUnload(): void;
    command(_: CommandManager, _player: Player, _args: string): void;
    onToggleTars(): boolean;
    onGameStart(): void;
    onGameEnd(state?: PlayerState): void;
    getStatus(): string;
    getTranslation(translation: TarsTranslation | string | Translation): Translation;
    private ensureSaveData;
}
