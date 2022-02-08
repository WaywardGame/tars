import type { QuadrantComponentId } from "ui/screen/screens/game/IGameScreenApi";
import type CommandManager from "command/CommandManager";
import type { IEventEmitter } from "event/EventEmitter";
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

import Navigation from "./core/navigation/Navigation";
import TarsDialog from "./ui/TarsDialog";
import { loggerUtilities, logSourceName } from "./utilities/Logger";
import TarsQuadrantComponent from "./ui/components/TarsQuadrantComponent";
import type { ITarsModEvents, ISaveData } from "./ITarsMod";
import { TarsTranslation, setTarsMod, TarsUiSaveDataKey, TARS_ID } from "./ITarsMod";
import Tars from "./core/Tars";
import { ITarsOptions, TarsUseProtectedItems } from "./core/ITars";
import { NavigationSystemState, QuantumBurstStatus, TarsMode } from "./core/ITars";
import planner from "./core/planning/Planner";
import { TarsOverlay } from "./ui/TarsOverlay";
import TarsNPC from "./npc/TarsNPC";
import { TreasureHunterType } from "./modes/TreasureHunter";

export default class TarsMod extends Mod {

	@Mod.instance<TarsMod>(TARS_ID)
	public static readonly INSTANCE: TarsMod;

	////////////////////////////////////

	public override event: IEventEmitter<this, ITarsModEvents>;

	////////////////////////////////////

	@Mod.saveData<TarsMod>()
	public saveData: ISaveData;

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

	@Register.dialog("Main", TarsDialog.description, TarsDialog)
	public readonly dialogMain: DialogId;

	@Register.menuBarButton("Dialog", {
		onActivate: () => gameScreen?.dialogs.toggle(TarsMod.INSTANCE.dialogMain),
		group: MenuBarButtonGroup.Meta,
		bindable: Registry<TarsMod>().get("bindableToggleDialog"),
		tooltip: tooltip => tooltip.dump().addText(text => text.setText(Translation.get(TarsMod.INSTANCE.dictionary, TarsTranslation.DialogTitleMain))),
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

	private gamePlaying = false;

	public get tarsInstance(): Tars | undefined {
		return this.localPlayerTars;
	}

	public override onInitialize(): void {
		setTarsMod(this);

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
		planner.debug = this.saveData.options.debugLogging;

		Log.addPreConsoleCallback(loggerUtilities.preConsoleCallback);

		(window as any).TARS = this;

		// this is to support hot reloading while in game
		if (this.saveData.ui[TarsUiSaveDataKey.DialogOpened]) {
			this.saveData.ui[TarsUiSaveDataKey.DialogOpened] = undefined;
			gameScreen?.dialogs.open(TarsMod.INSTANCE.dialogMain);
		}
	}

	public override onUnload(): void {
		this.localPlayerTars?.unload();
		this.localPlayerTars = undefined;

		this.tarsOverlay.clear();

		Log.removePreConsoleCallback(loggerUtilities.preConsoleCallback);

		(window as any).TARS = undefined;

		// this is to support hot reloading while in game
		if (this.gamePlaying && gameScreen?.dialogs.isVisible(TarsMod.INSTANCE.dialogMain)) {
			this.saveData.ui[TarsUiSaveDataKey.DialogOpened] = true;
			gameScreen?.dialogs.close(TarsMod.INSTANCE.dialogMain);
		}
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
	// Event Handlers

	@EventHandler(EventBus.Game, "play")
	public onGameStart(): void {
		this.gamePlaying = true;

		if (!this.saveData.island[localIsland.id]) {
			this.saveData.island[localIsland.id] = {};
		}

		this.localPlayerTars = this.createAndLoadTars(localPlayer, this.saveData);

		const tarsEvents = this.localPlayerTars.event.until(this.localPlayerTars, "delete");
		tarsEvents.subscribe("enableChange", (_, enabled) => {
			localPlayer.messages
				.source(this.messageSource)
				.type(MessageType.Good)
				.send(this.messageToggle, enabled);

			this.event.emit("enableChange", enabled);
		});
		tarsEvents.subscribe("optionsChange", (_, options) => {
			this.event.emit("optionsChange", options);
		});
		tarsEvents.subscribe("statusChange", (_, status) => {
			this.event.emit("statusChange", typeof (status) === "string" ? status : this.getTranslation(status).getString());
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
		tarsEvents.subscribe("modeFinished", (_, success) => {
			const message = success ? this.messageTaskComplete : this.messageTaskUnableToComplete;
			const messageType = success ? MessageType.Good : MessageType.Bad;

			localPlayer.messages
				.source(this.messageSource)
				.type(messageType)
				.send(message);
		});

		if (!this.localPlayerTars.isRunning() && (this.localPlayerTars.isEnabled() || new URLSearchParams(window.location.search).has("autotars"))) {
			this.localPlayerTars.toggle(true);
		}
	}

	@EventHandler(EventBus.Game, "stoppingPlay")
	public onGameEnd(): void {
		this.gamePlaying = false;

		const tarsInstances = Array.from(this.tarsInstances);
		for (const tars of tarsInstances) {
			tars.disable(true);
			tars.unload();
		}

		this.tarsInstances.clear();

		this.localPlayerTars = undefined;
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

	////////////////////////////////////

	public createAndLoadTars(human: Human, saveData: ISaveData): Tars {
		const tars = new Tars(human, saveData, this.tarsOverlay);
		tars.load();

		this.tarsInstances.add(tars);

		tars.event.waitFor("delete").then(() => {
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

		initial.options = {
			mode: TarsMode.Survival,

			useProtectedItems: TarsUseProtectedItems.No,
			goodCitizen: true,
			stayHealthy: true,

			recoverThresholdHealth: 30,
			recoverThresholdStamina: 20,
			recoverThresholdHunger: 8,
			recoverThresholdThirst: 10,
			recoverThresholdThirstFromMax: -10,

			survivalExploreIslands: true,
			survivalUseOrbsOfInfluence: true,
			survivalReadBooks: true,

			treasureHunterPrecognition: false,
			treasureHunterType: TreasureHunterType.DiscoverAndUnlockTreasure,

			quantumBurst: false,
			debugLogging: false,
			freeze: false,
			...(initial.options ?? {}) as Partial<ITarsOptions>,
		}

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
