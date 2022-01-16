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
import type { PlayerState } from "game/entity/player/IPlayer";
import TranslationImpl from "language/impl/TranslationImpl";

import Navigation from "./core/navigation/Navigation";
import TarsDialog from "./ui/TarsDialog";
import { loggerUtilities, logSourceName } from "./utilities/Logger";
import TarsQuadrantComponent from "./ui/components/TarsQuadrantComponent";
import type { ITarsModEvents, ISaveData } from "./ITarsMod";
import { TarsTranslation, setTarsMod, TarsUiSaveDataKey, TARS_ID } from "./ITarsMod";
import Tars from "./core/Tars";
import type { ITarsOptions } from "./core/ITars";
import { NavigationSystemState, QuantumBurstStatus, TarsMode } from "./core/ITars";
import planner from "./core/planning/Planner";
import { TarsOverlay } from "./ui/TarsOverlay";

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

	private tars: Tars | undefined;

	private readonly tarsOverlay: TarsOverlay = new TarsOverlay();

	private gamePlaying = false;

	public get tarsInstance(): Tars | undefined {
		return this.tars;
	}

	public override onInitialize(): void {
		setTarsMod(this);

		Navigation.setModPath(this.getPath());

		Log.setSourceFilter(Log.LogType.File, false, logSourceName);
	}

	public override onUninitialize(): void {
		this.tars?.disable(true);
		this.tars?.unload();
		this.tars = undefined;

		setTarsMod(undefined);
	}

	public override onLoad(): void {
		this.ensureSaveData();

		this.tars = new Tars(this.saveData, this.tarsOverlay);
		this.tars.load();

		const tarsEvents = this.tars.event.until(this.tars, "delete");
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

		Log.addPreConsoleCallback(loggerUtilities.preConsoleCallback);

		(window as any).TARS = this;

		// this is to support hot reloading while in game
		if (this.saveData.ui[TarsUiSaveDataKey.DialogOpened]) {
			this.saveData.ui[TarsUiSaveDataKey.DialogOpened] = undefined;
			gameScreen?.dialogs.open(TarsMod.INSTANCE.dialogMain);
		}
	}

	public override onUnload(): void {
		this.tars?.unload();
		this.tars = undefined;

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
		this.tars?.toggle();
	}

	@Bind.onDown(Registry<TarsMod>().get("bindableToggleTars"))
	public onToggleTars() {
		this.tars?.toggle();
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

		if (this.tars && !this.tars.isRunning() && (this.tars.isEnabled() || new URLSearchParams(window.location.search).has("autotars"))) {
			this.tars.toggle(true);
		}
	}

	@EventHandler(EventBus.Game, "stoppingPlay")
	public onGameEnd(state?: PlayerState): void {
		this.gamePlaying = false;

		if (!this.tars) {
			return;
		}

		this.tars.disable(true);
		this.tars.unload();
		this.tars = undefined;
	}

	////////////////////////////////////

	public getStatus(): string {
		const status = this.tarsInstance?.getStatus() ?? "Unknown";
		return typeof (status) === "string" ? status : this.getTranslation(status).getString();
	}

	public getTranslation(translation: TarsTranslation | string | Translation): Translation {
		return translation instanceof TranslationImpl ? translation : new TranslationImpl(this.dictionary, translation);
	}

	////////////////////////////////////

	/**
	 * Ensure save data is valid
	 */
	private ensureSaveData() {
		if (this.saveData.island === undefined) {
			this.saveData.island = {};
		}

		if (this.saveData.ui === undefined) {
			this.saveData.ui = {};
		}

		this.saveData.options = {
			mode: TarsMode.Survival,
			exploreIslands: true,
			useOrbsOfInfluence: true,
			goodCitizen: true,
			stayHealthy: true,
			recoverThresholdHealth: 30,
			recoverThresholdStamina: 20,
			recoverThresholdHunger: 8,
			recoverThresholdThirst: 10,
			recoverThresholdThirstFromMax: -10,
			quantumBurst: false,
			developerMode: false,
			...(this.saveData.options ?? {}) as Partial<ITarsOptions>,
		}

		if (this.saveData.options.mode === TarsMode.Manual) {
			this.saveData.options.mode = TarsMode.Survival;
		}

		planner.debug = this.saveData.options.developerMode;
	}
}
