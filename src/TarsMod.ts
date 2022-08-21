import type { QuadrantComponentId } from "ui/screen/screens/game/IGameScreenApi";
import type CommandManager from "command/CommandManager";
import { IEventEmitter, Priority } from "event/EventEmitter";
import type { Source } from "game/entity/player/IMessageManager";
import { MessageType } from "game/entity/player/IMessageManager";
import type Player from "game/entity/player/Player";
import type Dictionary from "language/Dictionary";
import type Message from "language/dictionary/Message";
import Translation from "language/Translation";
import Mod from "mod/Mod";
import Register, { Registry } from "mod/ModRegistry";
import Bind from "ui/input/Bind";
import type Bindable from "ui/input/Bindable";
import { IInput } from "ui/input/IInput";
import type { DialogId } from "ui/screen/screens/game/Dialogs";
import type { MenuBarButtonType } from "ui/screen/screens/game/static/menubar/IMenuBarButton";
import { MenuBarButtonGroup } from "ui/screen/screens/game/static/menubar/IMenuBarButton";
import Log from "utilities/Log";
import { EventBus } from "event/EventBuses";
import { EventHandler } from "event/EventManager";
import TranslationImpl from "language/impl/TranslationImpl";
import { NPCType } from "game/entity/npc/INPCs";
import TileHelpers from "utilities/game/TileHelpers";
import { RenderSource } from "renderer/IRenderer";
import Human from "game/entity/Human";
import { Prompt } from "game/meta/prompt/IPrompt";
import Files from "utilities/Files";
import SearchParams from "utilities/SearchParams";

import Navigation from "./core/navigation/Navigation";
import TarsDialog from "./ui/TarsDialog";
import { logSourceName } from "./utilities/Logger";
import TarsQuadrantComponent from "./ui/components/TarsQuadrantComponent";
import type { ITarsModEvents, ISaveData, IGlobalSaveData, ISaveDataContainer } from "./ITarsMod";
import { TarsTranslation, setTarsMod, TarsUiSaveDataKey, TARS_ID } from "./ITarsMod";
import Tars from "./core/Tars";
import { NavigationSystemState, QuantumBurstStatus, TarsMode } from "./core/ITars";
import { TarsOverlay } from "./ui/TarsOverlay";
import TarsNPC from "./npc/TarsNPC";
import { ITarsOptions, createOptions } from "./core/ITarsOptions";

export default class TarsMod extends Mod {

	@Mod.instance<TarsMod>(TARS_ID)
	public static readonly INSTANCE: TarsMod;

	////////////////////////////////////

	public override event: IEventEmitter<this, ITarsModEvents>;

	////////////////////////////////////

	@Mod.saveData<TarsMod>()
	public saveData: ISaveData;

	@Mod.globalData<TarsMod>()
	public globalSaveData: IGlobalSaveData;

	////////////////////////////////////

	@Register.bindable("ToggleDialog", IInput.key("Comma"))
	public readonly bindableToggleDialog: Bindable;

	@Register.bindable("ToggleTars", IInput.key("Period"))
	public readonly bindableToggleTars: Bindable;

	////////////////////////////////////

	@Register.messageSource("TARS")
	public readonly messageSource: Source;

	@Register.message("Toggle")
	public readonly messageToggle: Message;

	@Register.message("TaskComplete")
	public readonly messageTaskComplete: Message;

	@Register.message("TaskUnableToComplete")
	public readonly messageTaskUnableToComplete: Message;

	@Register.message("NavigationUpdating")
	public readonly messageNavigationUpdating: Message;

	@Register.message("NavigationUpdated")
	public readonly messageNavigationUpdated: Message;

	@Register.message("QuantumBurstStart")
	public readonly messageQuantumBurstStart: Message;

	@Register.message("QuantumBurstCooldownStart")
	public readonly messageQuantumBurstCooldownStart: Message;

	@Register.message("QuantumBurstCooldownEnd")
	public readonly messageQuantumBurstCooldownEnd: Message;

	////////////////////////////////////

	@Register.dictionary("Tars", TarsTranslation)
	public readonly dictionary: Dictionary;

	////////////////////////////////////

	@Register.prompt("TarsDeleteConfirm")
	public readonly promptDeleteConfirmation: Prompt;

	@Register.dialog("Main", TarsDialog.description, TarsDialog)
	public readonly dialogMain: DialogId;

	@Register.menuBarButton("Dialog", {
		onActivate: () => gameScreen?.dialogs.toggle<TarsDialog>(TarsMod.INSTANCE.dialogMain, undefined, dialog => {
			const tarsDialog = dialog as any as TarsDialog;

			const tarsInstance = TarsMod.INSTANCE.tarsInstance;
			if (tarsInstance) {
				tarsDialog.initialize(tarsInstance);
			} else {
				gameScreen?.dialogs.close(TarsMod.INSTANCE.dialogMain);
			}
		}),
		group: MenuBarButtonGroup.Meta,
		bindable: Registry<TarsMod>().get("bindableToggleDialog"),
		tooltip: tooltip => tooltip.dump().addText(text => text.setText(Translation.get(TarsMod.INSTANCE.dictionary, TarsTranslation.Name))),
	})
	public readonly menuBarButton: MenuBarButtonType;

	@Register.quadrantComponent("TARS", TarsQuadrantComponent)
	public readonly quadrantComponent: QuadrantComponentId;

	////////////////////////////////////

	@Register.npc("TARS", TarsNPC)
	public readonly npcType: NPCType;

	////////////////////////////////////

	private readonly tarsInstances: Set<Tars> = new Set();

	private readonly tarsOverlay: TarsOverlay = new TarsOverlay();

	////////////////////////////////////

	private localPlayerTars: Tars | undefined;

	////////////////////////////////////

	public get tarsInstance(): Tars | undefined {
		return this.localPlayerTars;
	}

	public override onInitialize(): void {
		setTarsMod(this);

		if (!this.globalSaveData) {
			this.globalSaveData = {
				dataSlots: [],
			};
		}

		if (!this.globalSaveData.dataSlots) {
			this.globalSaveData.dataSlots = [];
		}

		Navigation.setModPath(this.getPath());

		Log.setSourceFilter(Log.LogType.File, false, logSourceName);
	}

	public override onUninitialize(): void {
		this.localPlayerTars?.disable(true);
		this.localPlayerTars?.unload();
		this.localPlayerTars = undefined;

		setTarsMod(undefined);
	}

	public override onLoad(): void {
		this.initializeTarsSaveData(this.saveData);

		(window as any).TARS = this;
	}

	public override onUnload(): void {
		this.localPlayerTars?.unload();
		this.localPlayerTars = undefined;

		this.tarsOverlay.clear();

		(window as any).TARS = undefined;
	}

	@Register.command("TARS")
	public command(_: CommandManager, _player: Player, _args: string) {
		this.localPlayerTars?.toggle();
	}

	@Bind.onDown(Registry<TarsMod>().get("bindableToggleTars"))
	public onToggleTars() {
		this.localPlayerTars?.toggle();
		return true;
	}

	////////////////////////////////////////////////

	public addDataSlot(container: ISaveDataContainer) {
		this.globalSaveData.dataSlots.push(container);
		this.event.emit("changedGlobalDataSlots");
	}

	public renameDataSlot(container: ISaveDataContainer, newName: string) {
		container.name = newName;
		this.event.emit("changedGlobalDataSlots");
	}

	public removeDataSlot(container: ISaveDataContainer) {
		const index = this.globalSaveData.dataSlots.findIndex(ds => ds === container);
		if (index !== -1) {
			this.globalSaveData.dataSlots.splice(index, 1);
			this.event.emit("changedGlobalDataSlots");
		}
	}

	public importDataSlot(fileData: Uint8Array) {
		const unserializedContainer: { container?: ISaveDataContainer } = {};

		const serializer = saveManager.getSerializer();
		serializer.loadFromUint8Array(unserializedContainer, "container", fileData);

		if (unserializedContainer.container) {
			this.addDataSlot(unserializedContainer.container);
		}
	}

	public exportDataSlot(container: ISaveDataContainer) {
		const serializer = saveManager.getSerializer();
		const serializedData = serializer.saveToUint8Array({ container }, "container");
		if (!serializedData) {
			return;
		}

		Files.download(`TARS_${container.name}.wayward`, serializedData);
	}

	////////////////////////////////////////////////
	// Event Handlers

	// lowest priority will ensure TarsNPC tars instances are initialized before this is ran
	@EventHandler(EventBus.Game, "play", Priority.Lowest)
	public onGameStart(): void {
		if (!this.saveData.island[localIsland.id]) {
			this.saveData.island[localIsland.id] = {};
		}

		this.localPlayerTars = this.createAndLoadTars(localPlayer, this.saveData);

		const tarsEvents = this.localPlayerTars.event.until(this.localPlayerTars, "unload");
		tarsEvents.subscribe("enableChange", (_, enabled) => {
			localPlayer.messages
				.source(this.messageSource)
				.type(MessageType.Good)
				.send(this.messageToggle, enabled);
		});
		tarsEvents.subscribe("statusChange", () => {
			this.event.emit("statusChange");
		});
		tarsEvents.subscribe("quantumBurstChange", (_, status) => {
			switch (status) {
				case QuantumBurstStatus.Start:
					localPlayer.messages
						.source(this.messageSource)
						.type(MessageType.Good)
						.send(this.messageQuantumBurstStart);
					break;

				case QuantumBurstStatus.CooldownStart:
					localPlayer.messages
						.source(this.messageSource)
						.type(MessageType.Good)
						.send(this.messageQuantumBurstCooldownStart, false);
					break;

				case QuantumBurstStatus.CooldownEnd:
					localPlayer.messages
						.source(this.messageSource)
						.type(MessageType.Good)
						.send(this.messageQuantumBurstCooldownEnd, false);
					break;
			}
		});
		tarsEvents.subscribe("navigationChange", (_, status) => {
			switch (status) {
				case NavigationSystemState.Initializing:
					localPlayer.messages
						.source(this.messageSource)
						.type(MessageType.Good)
						.send(this.messageNavigationUpdating);
					break;

				case NavigationSystemState.Initialized:
					localPlayer.messages
						.source(this.messageSource)
						.type(MessageType.Good)
						.send(this.messageNavigationUpdated);
					break;
			}
		});
		tarsEvents.subscribe("modeFinished", (_1, _2, success) => {
			const message = success ? this.messageTaskComplete : this.messageTaskUnableToComplete;
			const messageType = success ? MessageType.Good : MessageType.Bad;

			localPlayer.messages
				.source(this.messageSource)
				.type(messageType)
				.send(message);
		});

		// reopen dialogs
		if (gameScreen) {
			const dialogsOpened = this.saveData.ui[TarsUiSaveDataKey.DialogsOpened] as Array<[DialogId, string]>;
			if (Array.isArray(dialogsOpened)) {
				for (const [dialogId, subId] of dialogsOpened) {
					if (TarsMod.INSTANCE.dialogMain === dialogId) {
						const tarsInstance = Array.from(this.tarsInstances).find(tarsInstance => tarsInstance.getDialogSubId() === subId);
						if (tarsInstance) {
							gameScreen.dialogs.open<TarsDialog>(dialogId, subId)?.initialize(tarsInstance);
						}
					}
				}
			}
		}

		if (!this.localPlayerTars.isRunning() && (this.localPlayerTars.isEnabled() || SearchParams.hasSwitch("autotars"))) {
			this.localPlayerTars.toggle(true);
		}
	}

	// this must run before the game screen is removed
	@EventHandler(EventBus.Game, "stoppingPlay", Priority.Highest)
	public onGameEnd(): void {
		this.saveDialogState();

		const tarsInstances = Array.from(this.tarsInstances);
		for (const tars of tarsInstances) {
			tars.disable(true);
			tars.unload();
		}

		this.tarsInstances.clear();

		this.localPlayerTars = undefined;
	}

	@EventHandler(EventBus.Game, "preSaveGame", Priority.Highest)
	public onPreSaveGame(): void {
		if (game.playing && this.localPlayerTars) {
			this.saveDialogState();
		}
	}

	@EventHandler(EventBus.Multiplayer, "connect")
	public onMultiplayerConnect(): void {
		if (!multiplayer.isServer()) {
			return;
		}

		// remove all TARS npcs when starting a multiplayer server in order to prevent desyncs
		for (const island of game.islands.active) {
			for (const npc of island.npcs) {
				if (npc?.getRegistrarId() === this.npcType) {
					island.npcs.remove(npc);
				}
			}
		}
	}

	private saveDialogState() {
		if (gameScreen) {
			this.saveData.ui[TarsUiSaveDataKey.DialogsOpened] = [];

			for (const [dialogId, subId] of gameScreen.dialogs.getAll(TarsMod.INSTANCE.dialogMain)) {
				if (gameScreen.dialogs.isVisible(dialogId, subId) === true) {
					this.saveData.ui[TarsUiSaveDataKey.DialogsOpened].push([dialogId, subId]);
				}
			}
		}
	}

	////////////////////////////////////

	public createAndLoadTars(human: Human, saveData: ISaveData): Tars {
		const tars = new Tars(human, saveData, this.tarsOverlay);
		tars.load();

		this.tarsInstances.add(tars);

		tars.event.waitFor("unload").then(() => {
			this.tarsInstances.delete(tars);
		});

		return tars;
	}

	public getStatus(): string {
		const status = this.tarsInstance?.getStatus() ?? "Unknown";
		return typeof (status) === "string" ? status : this.getTranslation(status).getString();
	}

	public getTranslation(translation: TarsTranslation | string | Translation): Translation {
		return translation instanceof TranslationImpl ? translation : new TranslationImpl(this.dictionary, translation);
	}

	public initializeTarsSaveData(initial: Partial<ISaveData> = {}): ISaveData {
		if (initial.island === undefined) {
			initial.island = {};
		}

		if (initial.ui === undefined) {
			initial.ui = {};
		}

		initial.options = createOptions((initial.options ?? {}) as Partial<ITarsOptions>);

		if (initial.options.mode === TarsMode.Manual) {
			initial.options.mode = TarsMode.Survival;
		}

		return initial as ISaveData;
	}

	public spawnNpc() {
		if (multiplayer.isConnected()) {
			throw new Error("TARS npcs are not supported in multiplayer");
		}

		const spawnPosition = TileHelpers.findMatchingTile(localIsland, localPlayer, TileHelpers.isSuitableSpawnPointTileForMultiplayer);
		if (!spawnPosition) {
			throw new Error("Invalid spawn position");
		}

		const npc = localIsland.npcs.spawn(this.npcType, spawnPosition.x, spawnPosition.y, spawnPosition.z);
		if (!npc) {
			throw new Error("Failed to spawn npc");
		}

		renderer?.updateView(RenderSource.Mod, true, true);
	}
}
