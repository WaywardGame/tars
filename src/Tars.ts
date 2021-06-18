import { EventBus } from "event/EventBuses";
import { IEventEmitter } from "event/EventEmitter";
import EventManager, { EventHandler } from "event/EventManager";
import { ActionType, IActionApi, IActionDescription } from "game/entity/action/IAction";
import Creature from "game/entity/creature/Creature";
import { DamageType } from "game/entity/IEntity";
import { EquipType } from "game/entity/IHuman";
import { IStat, IStatMax, Stat } from "game/entity/IStats";
import { MessageType, Source } from "game/entity/player/IMessageManager";
import { PlayerState, WeightStatus } from "game/entity/player/IPlayer";
import { INote } from "game/entity/player/note/NoteManager";
import Player from "game/entity/player/Player";
import { TileUpdateType } from "game/IGame";
import { ItemType, ItemTypeGroup } from "game/item/IItem";
import Item from "game/item/Item";
import { ITile } from "game/tile/ITerrain";
import { WorldZ } from "game/WorldZ";
import { Dictionary } from "language/Dictionaries";
import Interrupt from "language/dictionary/Interrupt";
import InterruptChoice from "language/dictionary/InterruptChoice";
import Message from "language/dictionary/Message";
import Translation from "language/Translation";
import { HookMethod } from "mod/IHookHost";
import Mod from "mod/Mod";
import Register, { Registry } from "mod/ModRegistry";
import Bind from "ui/input/Bind";
import Bindable from "ui/input/Bindable";
import { IInput } from "ui/input/IInput";
import { DialogId } from "ui/screen/screens/game/Dialogs";
import { MenuBarButtonType } from "ui/screen/screens/game/static/menubar/IMenuBarButton";
import { MenuBarButtonGroup } from "ui/screen/screens/game/static/menubar/MenuBarButtonDescriptions";
import { gameScreen } from "ui/screen/screens/GameScreen";
import { Ui } from "ui/Ui";
import { InterruptOptions } from "ui/util/IInterrupt";
import TileHelpers from "utilities/game/TileHelpers";
import Log from "utilities/Log";
import { Direction } from "utilities/math/Direction";
import { IVector2 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import { sleep } from "utilities/promise/Async";
import ResolvablePromise from "utilities/promise/ResolvablePromise";

import Context from "./Context";
import executor, { ExecuteObjectivesResultType } from "./core/Executor";
import planner from "./core/Planner";
import { ContextDataType, MovingToNewIslandState } from "./IContext";
import { IObjective, ObjectiveResult } from "./IObjective";
import { IBase, IInventoryItems, ISaveData, ITarsEvents, ITarsOptions, setTarsInstance, TarsMode, TarsTranslation, TarsUiSaveDataKey, TARS_ID } from "./ITars";
import { ITarsMode } from "./mode/IMode";
import { modes } from "./mode/Modes";
import Navigation, { tileUpdateRadius } from "./navigation/Navigation";
import Objective from "./Objective";
import AnalyzeBase from "./objectives/analyze/AnalyzeBase";
import AnalyzeInventory from "./objectives/analyze/AnalyzeInventory";
import ExecuteAction from "./objectives/core/ExecuteAction";
import CarveCorpse from "./objectives/interrupt/CarveCorpse";
import DefendAgainstCreature from "./objectives/interrupt/DefendAgainstCreature";
import OptionsInterrupt from "./objectives/interrupt/OptionsInterrupt";
import ReduceWeight from "./objectives/interrupt/ReduceWeight";
import RepairItem from "./objectives/interrupt/RepairItem";
import BuildItem from "./objectives/other/item/BuildItem";
import EquipItem from "./objectives/other/item/EquipItem";
import ReturnToBase from "./objectives/other/ReturnToBase";
import UnequipItem from "./objectives/other/item/UnequipItem";
import MoveToZ from "./objectives/utility/MoveToZ";
import OrganizeInventory from "./objectives/utility/OrganizeInventory";
import TarsDialog from "./ui/TarsDialog";
import { actionUtilities } from "./utilities/Action";
import { log, loggerUtilities, logSourceName } from "./utilities/Logger";
import { movementUtilities } from "./utilities/Movement";
import { objectUtilities } from "./utilities/Object";
import { tileUtilities } from "./utilities/Tile";
import { baseUtilities } from "./utilities/Base";
import { playerUtilities } from "./utilities/Player";
import { itemUtilities } from "./utilities/Item";
import { creatureUtilities } from "./utilities/Creature";
import RunAwayFromTarget from "./objectives/other/RunAwayFromTarget";
import RecoverHealth from "./objectives/recover/RecoverHealth";
import RecoverHunger from "./objectives/recover/RecoverHunger";
import RecoverStamina from "./objectives/recover/RecoverStamina";
import RecoverThirst from "./objectives/recover/RecoverThirst";

const tickSpeed = 333;

enum NavigationSystemState {
	NotInitialized,
	Initializing,
	Initialized,
}

export default class Tars extends Mod {

	@Mod.instance<Tars>(TARS_ID)
	public static readonly INSTANCE: Tars;

	////////////////////////////////////

	public event: IEventEmitter<this, ITarsEvents>;

	////////////////////////////////////

	@Mod.saveData<Tars>()
	public saveData: ISaveData;

	////////////////////////////////////

	@Register.bindable("ToggleDialog", IInput.key("KeyT"))
	public readonly bindableToggleDialog: Bindable;

	@Register.bindable("ToggleTars", IInput.key("KeyT", "Shift"))
	public readonly bindableToggleTars: Bindable;

	////////////////////////////////////

	@Register.messageSource("TARS")
	public readonly messageSource: Source;

	@Register.message("Toggle")
	public readonly messageToggle: Message;

	@Register.message("Finished")
	public readonly messageFinished: Message;

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
		onActivate: () => gameScreen?.toggleDialog(Tars.INSTANCE.dialogMain),
		group: MenuBarButtonGroup.Meta,
		bindable: Registry<Tars>().get("bindableToggleDialog"),
		tooltip: tooltip => tooltip.addText(text => text.setText(new Translation(Tars.INSTANCE.dictionary, TarsTranslation.DialogTitleMain))),
	})
	public readonly menuBarButton: MenuBarButtonType;

	////////////////////////////////////

	private base: IBase;
	private inventory: IInventoryItems;

	private readonly statThresholdExceeded: { [index: number]: boolean } = {};
	private gamePlaying = false;
	private quantumBurstCooldown = 0;
	private weightStatus: WeightStatus | undefined;
	private previousWeightStatus: WeightStatus | undefined;
	private lastStatusMessage: string | undefined;

	private context: Context;
	private objectivePipeline: Array<IObjective | IObjective[]> | undefined;
	private interruptObjectivePipeline: Array<IObjective | IObjective[]> | undefined;
	private interruptContext: Context | undefined;
	private readonly interruptContexts: Map<number, Context> = new Map();
	private interruptIds: Set<string> | undefined;

	private tickTimeoutId: number | undefined;

	private navigation: Navigation | undefined;
	private navigationSystemState: NavigationSystemState;
	private navigationUpdatePromise: ResolvablePromise<void> | undefined;
	private navigationQueuedUpdates: Array<() => void>;

	private readonly modeCache: Map<TarsMode, ITarsMode> = new Map();

	public onInitialize(): void {
		setTarsInstance(this);

		Navigation.setModPath(this.getPath());

		Log.setSourceFilter(Log.LogType.File, false, logSourceName);
	}

	public onUninitialize(): void {
		this.onGameEnd();

		setTarsInstance(undefined);
	}

	public onLoad(): void {
		this.ensureSaveData();

		this.delete();

		this.navigation = Navigation.get();

		Log.addPreConsoleCallback(loggerUtilities.preConsoleCallback);

		(window as any).TARS = this;

		// this is to support hot reloading while in game
		if (this.saveData.ui[TarsUiSaveDataKey.DialogOpened]) {
			this.saveData.ui[TarsUiSaveDataKey.DialogOpened] = undefined;
			gameScreen?.openDialog(Tars.INSTANCE.dialogMain);
		}
	}

	public onUnload(): void {
		this.delete();

		Log.removePreConsoleCallback(loggerUtilities.preConsoleCallback);

		(window as any).TARS = undefined;

		// this is to support hot reloading while in game
		if (this.gamePlaying && gameScreen?.isDialogVisible(Tars.INSTANCE.dialogMain)) {
			this.saveData.ui[TarsUiSaveDataKey.DialogOpened] = true;
			gameScreen?.closeDialog(Tars.INSTANCE.dialogMain);
		}
	}

	////////////////////////////////////////////////
	// Hooks
	////////////////////////////////////////////////

	@EventHandler(EventBus.Game, "play")
	public onGameStart(): void {
		this.gamePlaying = true;

		if (!this.saveData.island[island.id]) {
			this.saveData.island[island.id] = {};
		}

		if (!this.isRunning() && (this.isEnabled() || new URLSearchParams(window.location.search).has("autotars"))) {
			this.toggle(true);
		}
	}

	@EventHandler(EventBus.Game, "end")
	public onGameEnd(state?: PlayerState): void {
		this.gamePlaying = false;

		this.disable(true);
		this.delete();
	}

	@EventHandler(EventBus.LocalPlayer, "writeNote")
	public onWriteNote(player: Player, note: INote): false | void {
		if (this.isRunning()) {
			// hide notes
			return false;
		}

		return undefined;
	}

	@EventHandler(EventBus.LocalPlayer, "die")
	public onPlayerDeath() {
		this.interrupt();
		movementUtilities.resetMovementOverlays();
	}

	@EventHandler(EventBus.LocalPlayer, "respawn")
	public onPlayerRespawn() {
		this.interrupt();
		movementUtilities.resetMovementOverlays();

		if (this.navigationSystemState === NavigationSystemState.Initialized && this.navigation) {
			this.navigation.queueUpdateOrigin(localPlayer);
		}
	}

	@EventHandler(EventBus.LocalPlayer, "processMovement")
	public async processMovement(player: Player): Promise<void> {
		if (this.isRunning() && player.isLocalPlayer()) {
			if (this.navigationSystemState === NavigationSystemState.Initialized && this.navigation) {
				this.navigation.queueUpdateOrigin(player);
			}

			this.processQuantumBurst();

			const objective = this.interruptObjectivePipeline || this.objectivePipeline;
			if (objective !== undefined && !Array.isArray(objective[0])) {
				const result = await objective[0].onMove(this.context);
				if (result === true) {
					this.interrupt();

				} else if (result) {
					this.interrupt(result);
				}
			}
		}
	}

	@EventHandler(EventBus.LocalPlayer, "restEnd")
	public restEnd() {
		if (this.isRunning()) {
			this.processQueuedNavigationUpdates();
		}
	}

	@EventHandler(EventBus.LocalPlayer, "moveComplete")
	public onMoveComplete(player: Player) {
		movementUtilities.clearOverlay(player.getTile());
	}

	@EventHandler(EventBus.Ui, "interrupt")
	public onInterrupt(host: Ui, options: Partial<InterruptOptions>, interrupt?: Interrupt): string | boolean | void | InterruptChoice | undefined {
		if (this.isRunning() && (interrupt === Interrupt.GameDangerousStep || interrupt === Interrupt.GameTravelConfirmation)) {
			log.info(`Returning true for interrupt ${Interrupt[interrupt]}`);
			return InterruptChoice.Yes;
		}
	}

	@Register.command("TARS")
	public command(_player: Player, _args: string) {
		this.toggle();
	}

	@Bind.onDown(Registry<Tars>().get("bindableToggleTars"))
	public onToggleTars() {
		this.toggle();
		return true;
	}

	@EventHandler(EventBus.Game, "tileUpdate")
	public onTileUpdate(_: any, tile: ITile, tileX: number, tileY: number, tileZ: number, tileUpdateType: TileUpdateType): void {
		if (this.navigationSystemState === NavigationSystemState.Initializing || localPlayer.isResting()) {
			this.navigationQueuedUpdates.push(() => {
				this.onTileUpdate(undefined, tile, tileX, tileY, tileZ, tileUpdateType);
			});

		} else if (this.navigationSystemState === NavigationSystemState.Initialized && this.navigation) {
			this.navigation.onTileUpdate(tile, TileHelpers.getType(tile), tileX, tileY, tileZ, undefined, tileUpdateType);

			const updateNeighbors = tileUpdateType === TileUpdateType.Creature || tileUpdateType === TileUpdateType.CreatureSpawn;
			if (updateNeighbors) {
				for (let x = -tileUpdateRadius; x <= tileUpdateRadius; x++) {
					for (let y = -tileUpdateRadius; y <= tileUpdateRadius; y++) {
						if (x !== 0 || y !== 0) {
							const point = game.ensureValidPoint({ x: tileX + x, y: tileY + y, z: tileZ });
							if (point) {
								const otherTile = game.getTileFromPoint(point);
								this.navigation.onTileUpdate(otherTile, TileHelpers.getType(otherTile), tileX + x, tileY + y, tileZ, undefined, tileUpdateType);
							}
						}
					}
				}
			}
		}
	}

	@HookMethod
	public postExecuteAction(api: IActionApi, action: IActionDescription, args: any[]): void {
		if (api.executor !== localPlayer) {
			return;
		}
		this.processQuantumBurst();

		actionUtilities.postExecuteAction(api.type);
	}

	@HookMethod
	public processInput(player: Player): boolean | undefined {
		this.processQuantumBurst();
		return undefined;
	}

	@EventHandler(EventBus.LocalPlayer, "walkPathChange")
	public onWalkPathChange(player: Player, walkPath: IVector2[] | undefined) {
		if (!walkPath || walkPath.length === 0 || !this.isRunning()) {
			return;
		}

		const organizeInventoryInterrupts = this.organizeInventoryInterrupts(this.context, this.interruptContext);
		if (organizeInventoryInterrupts && organizeInventoryInterrupts.length > 0) {
			this.interrupt(...organizeInventoryInterrupts);
		}
	}

	@EventHandler(EventBus.LocalPlayer, "preMove")
	public preMove(player: Player, prevX: number, prevY: number, prevZ: number, prevTile: ITile, nextX: number, nextY: number, nextZ: number, nextTile: ITile) {
		if (!this.isRunning() || !player.hasWalkPath()) {
			return;
		}

		if (nextTile.npc || (nextTile.doodad && nextTile.doodad.blocksMove()) || game.isPlayerAtTile(nextTile, false, true)) {
			log.info("Interrupting due to blocked movement");
			this.interrupt();
		}
	}

	/*
	@EventHandler(EventBus.LocalPlayer, "inventoryItemAdd")
	@EventHandler(EventBus.LocalPlayer, "inventoryItemRemove")
	@EventHandler(EventBus.LocalPlayer, "inventoryItemUpdate")
	public onInventoryChange(player: Player, container: IContainer) {
		if (!this.isEnabled()) {
			return;
		}

		// todo: analyze inventory?
	}
	*/

	@EventHandler(EventBus.LocalPlayer, "statChanged")
	public onStatChange(player: Player, stat: IStat) {
		if (!this.isRunning()) {
			return;
		}

		const recoverThreshold = playerUtilities.getRecoverThreshold(this.context, stat.type);
		if (recoverThreshold !== undefined) {
			if (stat.value <= recoverThreshold) {
				if (!this.statThresholdExceeded[stat.type]) {
					this.statThresholdExceeded[stat.type] = true;

					if (this.isRunning()) {
						log.info(`Stat threshold exceeded for ${Stat[stat.type]}. ${stat.value} < ${recoverThreshold}`);

						this.interrupt();
					}
				}

			} else if (this.statThresholdExceeded[stat.type]) {
				this.statThresholdExceeded[stat.type] = false;
			}
		}

		switch (stat.type) {
			case Stat.Weight:
				executor.markWeightChanged();

				const weightStatus = player.getWeightStatus();
				if (this.weightStatus !== weightStatus) {
					this.previousWeightStatus = this.weightStatus;

					this.weightStatus = weightStatus;

					if (weightStatus === WeightStatus.None) {
						return;
					}

					if (this.isRunning()) {
						// players weight status changed
						// reset objectives so we'll handle this immediately
						log.info(`Weight status changed from ${this.previousWeightStatus !== undefined ? WeightStatus[this.previousWeightStatus] : "N/A"} to ${WeightStatus[this.weightStatus]}`);

						this.interrupt();
					}
				}

				break;
		}
	}

	////////////////////////////////////////////////

	public getTranslation(translation: TarsTranslation | string | Translation): Translation {
		return translation instanceof Translation ? translation : new Translation(this.dictionary, translation);
	}

	public isEnabled(): boolean {
		return this.saveData.enabled;
	}

	public isRunning(): boolean {
		return this.tickTimeoutId !== undefined;
	}

	public isQuantumBurstEnabled(): boolean {
		return this.isEnabled() && this.saveData.options.quantumBurst && !multiplayer.isConnected();
	}

	public async toggle(enabled = !this.saveData.enabled) {
		if (this.navigationSystemState === NavigationSystemState.Initializing) {
			return;
		}

		this.saveData.enabled = enabled;
		this.event.emit("enableChange", true);

		log.info(this.saveData.enabled ? "Enabled" : "Disabled");

		localPlayer.messages
			.source(this.messageSource)
			.type(MessageType.Good)
			.send(this.messageToggle, this.saveData.enabled);

		this.context = new Context(localPlayer, this.base, this.inventory, this.saveData.options);

		await this.ensureNavigation(this.context.player.vehicleItemId !== undefined);

		await this.reset();

		if (this.saveData.enabled) {
			if (this.navigation) {
				this.navigation.showOverlay();
				this.navigation.queueUpdateOrigin(localPlayer);
			}

			this.tickTimeoutId = setTimeout(this.tick.bind(this), tickSpeed);

		} else {
			this.disable();
		}
	}

	public updateOptions(options: Partial<ITarsOptions>) {
		const changedOptions: Array<keyof ITarsOptions> = [];

		for (const key of (Object.keys(options) as Array<keyof ITarsOptions>)) {
			const newValue = options[key];
			if (newValue !== undefined && this.saveData.options[key] !== newValue) {
				(this.saveData.options as any)[key] = newValue;
				changedOptions.push(key);
			}
		}

		if (changedOptions.length > 0) {
			log.info(`Updating options: ${changedOptions.join(", ")}`);

			this.event.emit("optionsChange", this.saveData.options);

			let shouldInterrupt = this.isRunning();

			for (const changedOption of changedOptions) {
				switch (changedOption) {
					case "exploreIslands":
						this.context?.setData(ContextDataType.MovingToNewIsland, MovingToNewIslandState.None);
						break;

					case "quantumBurst":
						shouldInterrupt = false;

						if (this.saveData.options.quantumBurst) {
							localPlayer.messages
								.source(this.messageSource)
								.type(MessageType.Good)
								.send(this.messageQuantumBurstStart);

						} else {
							this.quantumBurstCooldown = 2;
						}

						break;

					case "developerMode":
						shouldInterrupt = false;
						planner.debug = this.saveData.options.developerMode;
						break;
				}
			}

			if (shouldInterrupt) {
				this.interrupt();
			}
		}
	}

	public async activateManualMode(modeInstance: ITarsMode) {
		this.updateOptions({ mode: TarsMode.Manual });

		if (!this.isRunning()) {
			this.toggle();
		}

		await this.initializeMode(this.context, TarsMode.Manual, modeInstance);
	}

	@Bound
	public getStatus(): Translation | string {
		if (this.navigationSystemState === NavigationSystemState.Initializing) {
			return this.getTranslation(TarsTranslation.DialogStatusNavigatingInitializing);
		}

		if (!this.isRunning()) {
			return "Not running";
		}

		let statusMessage: string = "Idle";

		let planStatusMessage: string | undefined;

		const plan = executor.getPlan();
		if (plan !== undefined) {
			planStatusMessage = plan.tree.objective.getStatusMessage();
		}

		const objectivePipeline = this.objectivePipeline ?? this.interruptObjectivePipeline;
		if (objectivePipeline) {
			statusMessage = objectivePipeline.flat()[0].getStatusMessage();

			// todo: make this more generic. only show statusMessage if it's interesting
			if (planStatusMessage && planStatusMessage !== statusMessage && statusMessage !== "Miscellaneous processing" && statusMessage !== "Calculating objective...") {
				statusMessage = `${planStatusMessage} - ${statusMessage}`;
			}

		} else if (planStatusMessage) {
			statusMessage = planStatusMessage;
		}

		if (this.lastStatusMessage !== statusMessage) {
			this.lastStatusMessage = statusMessage;
			log.info(`Status: ${statusMessage}`);
		}

		return statusMessage;
	}

	public updateStatus() {
		this.event.emit("statusChange", this.getStatus());
	}

	public async ensureSailingMode(sailingMode: boolean) {
		if (!this.navigation) {
			return;
		}

		if (this.navigationUpdatePromise) {
			return this.navigationUpdatePromise;
		}

		if (this.navigation.shouldUpdateSailingMode(sailingMode)) {
			log.info("Updating sailing mode", sailingMode);

			this.navigationUpdatePromise = new ResolvablePromise();

			this.navigationSystemState = NavigationSystemState.NotInitialized;

			await this.ensureNavigation(sailingMode);

			this.navigationUpdatePromise.resolve();
			this.navigationUpdatePromise = undefined;
		}
	}

	////////////////////////////////////////////////

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
			stayHealthy: true,
			exploreIslands: true,
			useOrbsOfInfluence: true,
			quantumBurst: false,
			developerMode: false,
			...(this.saveData.options ?? {}) as Partial<ITarsOptions>,
		}

		if (this.saveData.options.mode === TarsMode.Manual) {
			this.saveData.options.mode = TarsMode.Survival;
		}

		planner.debug = this.saveData.options.developerMode;
	}

	/**
	 * Ensure navigation is running and up to date
	 */
	private async ensureNavigation(sailingMode: boolean) {
		if (this.navigationSystemState === NavigationSystemState.NotInitialized && this.navigation) {
			this.navigationSystemState = NavigationSystemState.Initializing;

			this.updateStatus();

			localPlayer.messages
				.source(this.messageSource)
				.type(MessageType.Good)
				.send(this.messageNavigationUpdating);

			// give a chance for the message to show up on screen before starting nav update
			await sleep(100);

			await this.navigation.updateAll(sailingMode);

			this.navigation.queueUpdateOrigin(localPlayer);

			this.navigationSystemState = NavigationSystemState.Initialized;

			this.processQueuedNavigationUpdates();

			localPlayer.messages
				.source(this.messageSource)
				.type(MessageType.Good)
				.send(this.messageNavigationUpdated);
		}
	}

	private async getOrCreateModeInstance(context: Context): Promise<ITarsMode> {
		const mode = this.saveData.options.mode;

		let modeInstance = this.modeCache.get(mode);
		if (!modeInstance) {
			modeInstance = modes.get(mode);
			if (!modeInstance) {
				this.disable();
				throw new Error(`Missing mode initializer for ${TarsMode[mode]}`);
			}

			await this.initializeMode(context, mode, modeInstance);
		}

		return modeInstance;
	}

	private async initializeMode(context: Context, mode: TarsMode, modeInstance: ITarsMode) {
		await this.disposeMode(context, mode);

		EventManager.registerEventBusSubscriber(modeInstance);
		await modeInstance.initialize?.(context, () => { this.stop(true); });
		this.modeCache.set(mode, modeInstance);
	}

	private async disposeMode(context: Context, mode: TarsMode) {
		const modeInstance = this.modeCache.get(TarsMode.Manual);
		if (modeInstance) {
			await modeInstance.dispose?.(this.context);
			EventManager.deregisterEventBusSubscriber(modeInstance);
			this.modeCache.delete(mode);
		}
	}

	private async reset(deleting: boolean = false) {
		executor.reset();

		for (const mode of Array.from(this.modeCache.keys())) {
			if (deleting || mode !== TarsMode.Manual) {
				await this.disposeMode(this.context, mode);
			}
		}

		this.lastStatusMessage = undefined;
		this.objectivePipeline = undefined;
		this.interruptObjectivePipeline = undefined;
		this.interruptIds = undefined;
		this.interruptContext = undefined;
		this.interruptContexts.clear();
	}

	private delete() {
		this.base = {
			anvil: [],
			campfire: [],
			chest: [],
			furnace: [],
			intermediateChest: [],
			kiln: [],
			waterStill: [],
			well: [],
			buildAnotherChest: false,
			availableUnlimitedWellLocation: undefined,
		};

		this.inventory = {};

		baseUtilities.clearCache();

		this.reset(true);

		this.navigationSystemState = NavigationSystemState.NotInitialized;
		this.navigationQueuedUpdates = [];

		Navigation.delete();
	}

	private disable(gameIsEnding: boolean = false) {
		if (!gameIsEnding) {
			this.saveData.enabled = false;
			this.event.emit("enableChange", false);
		}

		this.navigation?.hideOverlay();

		if (this.tickTimeoutId !== undefined) {
			clearTimeout(this.tickTimeoutId);
			this.tickTimeoutId = undefined;
		}

		movementUtilities.resetMovementOverlays();

		if (localPlayer) {
			localPlayer.walkAlongPath(undefined);
			OptionsInterrupt.restore(localPlayer);
		}

		if (!gameIsEnding && this.saveData.options.mode === TarsMode.Manual) {
			this.updateOptions({ mode: TarsMode.Survival });
		}

		this.updateStatus();
	}

	private interrupt(...interruptObjectives: IObjective[]) {
		log.info("Interrupt", Objective.getPipelineString(interruptObjectives));

		executor.interrupt();

		this.objectivePipeline = undefined;

		if (interruptObjectives && interruptObjectives.length > 0) {
			this.interruptObjectivePipeline = interruptObjectives;
		}

		movementUtilities.resetMovementOverlays();
		localPlayer.walkAlongPath(undefined);
	}

	private async tick() {
		try {
			if (this.context.player.hasDelay()) {
				this.processQuantumBurst();
			}

			await this.onTick();
			this.updateStatus();

		} catch (ex) {
			log.error("onTick error", ex);
		}

		if (this.tickTimeoutId === undefined) {
			this.disable();
			return;
		}

		if (this.context.player.hasDelay()) {
			this.processQuantumBurst();
		}

		this.tickTimeoutId = setTimeout(this.tick.bind(this), this.isQuantumBurstEnabled() ? game.interval : tickSpeed);
	}

	private async onTick() {
		if (!this.isRunning() || !executor.isReady(this.context, false)) {
			if (this.quantumBurstCooldown === 2) {
				this.quantumBurstCooldown--;

				localPlayer.messages
					.source(this.messageSource)
					.type(MessageType.Good)
					.send(this.messageQuantumBurstCooldownStart, false);
			}

			if (game.playing && this.context.player.isGhost() && game.getGameOptions().respawn) {
				await new ExecuteAction(ActionType.Respawn, (context, action) => {
					action.execute(context.player);
					return ObjectiveResult.Complete;
				}).execute(this.context);
			}

			return;
		}

		if (this.quantumBurstCooldown === 1) {
			this.quantumBurstCooldown--;

			localPlayer.messages
				.source(this.messageSource)
				.type(MessageType.Good)
				.send(this.messageQuantumBurstCooldownEnd, false);
		}

		objectUtilities.clearCache();
		tileUtilities.clearCache();
		itemUtilities.clearCache();
		movementUtilities.clearCache();

		// system objectives
		await executor.executeObjectives(this.context, [new AnalyzeInventory(), new AnalyzeBase()], false, false);

		// interrupts
		const modeInstance = await this.getOrCreateModeInstance(this.context);

		const interrupts = modeInstance.getInterrupts ?
			await modeInstance.getInterrupts(this.context) :
			this.getInterrupts(this.context);

		const interruptIds = new Set<string>(interrupts
			.filter(objective => Array.isArray(objective) ? objective.length > 0 : objective !== undefined)
			.map(objective => Array.isArray(objective) ? objective.map(o => o.getIdentifier()).join(" -> ") : objective!.getIdentifier()));

		let interruptsChanged = this.interruptIds === undefined && interruptIds.size > 0;
		if (!interruptsChanged && this.interruptIds !== undefined) {
			// change if a new interrupt was added - ignore removes
			for (const interruptId of interruptIds) {
				if (!this.interruptIds.has(interruptId)) {
					// a new interrupt was added
					interruptsChanged = true;
					break;
				}
			}
		}

		if (interruptsChanged) {
			log.info(`Interrupts changed from ${this.interruptIds ? Array.from(this.interruptIds).join(", ") : undefined} to ${Array.from(interruptIds).join(", ")}`);
			this.interruptIds = interruptIds;
			this.interruptObjectivePipeline = undefined;
		}

		// log.debug("objectivePipeline", this.objectivePipeline?.map(objective => objective.getHashCode()).join(" -> "));
		// log.debug("interruptObjectivePipeline", this.interruptObjectivePipeline?.map(objective => objective.getHashCode()).join(" -> "));

		if (this.interruptObjectivePipeline || interrupts.length > 0) {
			if (!this.interruptContext) {
				// we should use our main context when running interrupt objectives
				// this will prevent interrupts from messing with reserved items
				// when the context is reset, it goes back to this initial state
				this.interruptContext = this.context.clone();
				this.interruptContext.setInitialState();

				this.interruptContexts.clear();

				log.debug(`Created interrupt context with hash code: ${this.interruptContext.getHashCode()}`);
			}

			if (this.interruptObjectivePipeline) {
				const interruptHashCode = Objective.getPipelineString(this.interruptObjectivePipeline);

				log.info("Continuing interrupt execution", interruptHashCode);

				const result = await executor.executeObjectives(this.interruptContext, this.interruptObjectivePipeline, false);
				switch (result.type) {
					case ExecuteObjectivesResultType.Completed:
						this.interruptObjectivePipeline = undefined;
						log.info("Completed interrupt objectives");
						break;

					case ExecuteObjectivesResultType.Restart:
						this.interruptObjectivePipeline = undefined;
						return;

					case ExecuteObjectivesResultType.Pending:
						const afterInterruptHashCode = Objective.getPipelineString(this.interruptObjectivePipeline);

						if (interruptHashCode === afterInterruptHashCode) {
							this.interruptObjectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
							// this.objectivePipeline = undefined;
							log.info(`Updated continuing interrupt objectives - ${ExecuteObjectivesResultType[result.type]}`, Objective.getPipelineString(this.interruptObjectivePipeline));

						} else {
							log.info(`Ignoring continuing interrupt objectives due to changed interrupts - ${ExecuteObjectivesResultType[result.type]}. Before: ${interruptHashCode}. After: ${afterInterruptHashCode}`);
						}

						return;

					case ExecuteObjectivesResultType.ContinuingNextTick:
						this.interruptObjectivePipeline = undefined;
						// this.objectivePipeline = undefined;
						log.info("Clearing interrupt objective pipeline");
						return;
				}
			}

			if (interrupts.length > 0) {
				for (let i = 0; i < interrupts.length; i++) {
					const interruptObjectives = interrupts[i];
					if (interruptObjectives === undefined || (Array.isArray(interruptObjectives) && interruptObjectives.length === 0)) {
						continue;
					}

					const savedContext = this.interruptContexts.get(i);
					if (savedContext) {
						this.interruptContext = savedContext;

						log.debug(`Restored saved context from ${i}. ${this.interruptContext}`);
					}

					const result = await executor.executeObjectives(this.interruptContext, [interruptObjectives], true);

					log.debug("Interrupt result", result);

					if (!this.interruptContext) {
						// tars was disabled mid run
						return;
					}

					switch (result.type) {
						case ExecuteObjectivesResultType.Completed:
							// finished working on it
							// update the initial state of the interrupt context
							// it's possible interrupt() was called, so we'll come back here with the same context
							// this.interruptContext.setInitialState();
							// todo: nest interrupt support / contexts?

							// ensure the current objective is cleared
							this.interruptObjectivePipeline = undefined;

							if (this.interruptContexts.has(i)) {
								this.interruptContexts.delete(i);
								log.debug(`Deleting saved context from ${i}`);
							}
							break;

						default:
							// in progress. run again during the next tick

							// save this context so it will be restored next time
							this.interruptContexts.set(i, this.interruptContext.clone());
							log.debug(`Saving context to ${i} with new initial state. ${this.interruptContext}`);

							// update the initial state so we don't mess with items between interrupts
							this.interruptContext.setInitialState();

							if (result.type === ExecuteObjectivesResultType.Pending || result.type === ExecuteObjectivesResultType.ContinuingNextTick) {
								// save the active objective
								this.interruptObjectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;

								// reset main objective
								this.objectivePipeline = undefined;
							}

							return;
					}
				}
			}

			// console.log.info("this.objective", this.objective ? this.objective.getHashCode() : undefined);

			if (executor.tryClearInterrupt()) {
				// nested interrupt. update interrupt context
				this.interruptContext.setInitialState();

				log.debug(`Nested interrupt. Updating context with hash code: ${this.interruptContext.getHashCode()}`);

				return;
			}
		}

		if (executor.tryClearInterrupt()) {
			return;
		}

		// no longer working on interrupts
		this.interruptContext = undefined;

		if (this.objectivePipeline !== undefined) {
			// we have an objective we are working on
			const hashCode = Objective.getPipelineString(this.objectivePipeline);

			log.info("Continuing execution of objectives", hashCode);

			const result = await executor.executeObjectives(this.context, this.objectivePipeline, false, true);
			switch (result.type) {
				case ExecuteObjectivesResultType.Completed:
					this.objectivePipeline = undefined;
					break;

				case ExecuteObjectivesResultType.Restart:
					this.objectivePipeline = undefined;
					return;

				case ExecuteObjectivesResultType.Pending:
				case ExecuteObjectivesResultType.ContinuingNextTick:
					const afterHashCode = Objective.getPipelineString(this.objectivePipeline);

					if (hashCode === afterHashCode) {
						this.objectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
						log.info(`Updated continuing objectives - ${ExecuteObjectivesResultType[result.type]}`, Objective.getPipelineString(this.objectivePipeline));

					} else {
						log.info(`Ignoring continuing objectives due to changed objectives - ${ExecuteObjectivesResultType[result.type]}. Resetting. Before: ${hashCode}. After: ${afterHashCode}`);

						// todo: the hash code might change because a StoneWaterStill became a LitStoneWaterStill. that might be okay
						this.objectivePipeline = undefined;
					}

					return;
			}

			if (!this.isEnabled()) {
				// execution finished from running the objectivePipeline
				return;
			}
		}

		// reset before determining objectives
		this.context.reset();
		log.debug(`Reset context state. Context hash code: ${this.context.getHashCode()}.`);

		const objectives = await modeInstance.determineObjectives(this.context);

		const result = await executor.executeObjectives(this.context, objectives, true, true);
		switch (result.type) {
			case ExecuteObjectivesResultType.Pending:
			case ExecuteObjectivesResultType.ContinuingNextTick:
				// save the active objective
				this.objectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
				log.info(`Saved objectives - ${ExecuteObjectivesResultType[result.type]}`, Objective.getPipelineString(this.objectivePipeline));
				this.updateStatus();
				return;

			default:
				this.objectivePipeline = undefined;
				return;
		}
	}

	@Bound
	private stop(finished?: boolean) {
		localPlayer.messages
			.source(this.messageSource)
			.type(MessageType.Good)
			.send(finished ? this.messageFinished : this.messageToggle, false);

		this.disable();
	}

	// todo: add severity to stat interrupts to prioritize which one to run
	private getInterrupts(context: Context): Array<IObjective | IObjective[] | undefined> {
		const stayHealthy = this.saveData.options.stayHealthy;

		let interrupts: Array<IObjective | IObjective[] | undefined> = [
			this.optionsInterrupt(),
			...this.equipmentInterrupt(context),
			this.nearbyCreatureInterrupt(context),
		];

		if (stayHealthy) {
			interrupts.push(...this.getRecoverInterrupts(context, true));
		}

		interrupts = interrupts.concat([
			this.buildItemObjectives(),
			this.reduceWeightInterrupt(context),
		]);

		if (stayHealthy) {
			interrupts.push(...this.getRecoverInterrupts(context, false));
		}

		interrupts = interrupts.concat([
			this.gatherFromCorpsesInterrupt(context),
			this.repairsInterrupt(context),
			this.escapeCavesInterrupt(context),
			this.returnToBaseInterrupt(context),
		]);

		const organizeInventoryInterrupts = this.organizeInventoryInterrupts(context);
		if (organizeInventoryInterrupts) {
			interrupts = interrupts.concat(organizeInventoryInterrupts);
		}

		return interrupts;
	}

	private getRecoverInterrupts(context: Context, onlyUseAvailableItems: boolean) {
		// focus on healing if our health is below 85% while poisoned
		const poisonHealthPercentThreshold = 0.85;

		const health = context.player.stat.get<IStatMax>(Stat.Health);
		const needsHealthRecovery = health.value <= playerUtilities.getRecoverThreshold(context, Stat.Health) ||
			context.player.status.Bleeding ||
			(context.player.status.Poisoned && (health.value / health.max) <= poisonHealthPercentThreshold);

		const exceededThirstThreshold = context.player.stat.get<IStat>(Stat.Thirst).value <= playerUtilities.getRecoverThreshold(context, Stat.Thirst);
		const exceededHungerThreshold = context.player.stat.get<IStat>(Stat.Hunger).value <= playerUtilities.getRecoverThreshold(context, Stat.Hunger);
		const exceededStaminaThreshold = context.player.stat.get<IStat>(Stat.Stamina).value <= playerUtilities.getRecoverThreshold(context, Stat.Stamina);

		const objectives: IObjective[] = [];

		if (needsHealthRecovery) {
			objectives.push(new RecoverHealth(onlyUseAvailableItems));
		}

		objectives.push(new RecoverThirst({
			onlyUseAvailableItems: onlyUseAvailableItems,
			exceededThreshold: exceededThirstThreshold,
			onlyEmergencies: false,
		}));

		objectives.push(new RecoverHunger(onlyUseAvailableItems, exceededHungerThreshold));

		if (exceededStaminaThreshold) {
			objectives.push(new RecoverStamina());
		}

		objectives.push(new RecoverThirst({
			onlyUseAvailableItems: onlyUseAvailableItems,
			exceededThreshold: exceededThirstThreshold,
			onlyEmergencies: true,
		}));

		return objectives;
	}

	private optionsInterrupt(): IObjective | undefined {
		return new OptionsInterrupt();
	}

	private equipmentInterrupt(context: Context): Array<IObjective | undefined> {
		return [
			this.handsEquipInterrupt(context),
			this.equipInterrupt(context, EquipType.Chest),
			this.equipInterrupt(context, EquipType.Legs),
			this.equipInterrupt(context, EquipType.Head),
			this.equipInterrupt(context, EquipType.Belt),
			this.equipInterrupt(context, EquipType.Feet),
			this.equipInterrupt(context, EquipType.Hands),
			this.equipInterrupt(context, EquipType.Neck),
			this.equipInterrupt(context, EquipType.Back),
		];
	}

	private equipInterrupt(context: Context, equip: EquipType): IObjective | undefined {
		const item = context.player.getEquippedItem(equip);
		if (item && item.type === ItemType.SlitherSucker) {
			// brain slugs are bad
			return new UnequipItem(item);
		}

		const bestEquipment = itemUtilities.getBestEquipment(context, equip);
		if (bestEquipment.length > 0) {
			const itemToEquip = bestEquipment[0];
			if (itemToEquip === item) {
				return undefined;
			}

			if (item !== undefined) {
				return new UnequipItem(item);
			}

			return new EquipItem(equip, itemToEquip);
		}
	}

	private handsEquipInterrupt(context: Context, preferredDamageType?: DamageType): IObjective | undefined {
		const leftHandEquipInterrupt = this.handEquipInterrupt(context, EquipType.LeftHand, ActionType.Attack);
		if (leftHandEquipInterrupt) {
			return leftHandEquipInterrupt;
		}

		if (context.inventory.equipShield && !context.inventory.equipShield.isEquipped()) {
			return new EquipItem(EquipType.RightHand, context.inventory.equipShield);
		}

		const leftHandItem = context.player.getEquippedItem(EquipType.LeftHand);
		const rightHandItem = context.player.getEquippedItem(EquipType.RightHand);

		const leftHandDescription = leftHandItem ? leftHandItem.description() : undefined;
		const leftHandEquipped = leftHandDescription ? leftHandDescription.attack !== undefined : false;

		const rightHandDescription = rightHandItem ? rightHandItem.description() : undefined;
		const rightHandEquipped = rightHandDescription ? rightHandDescription.attack !== undefined : false;

		if (preferredDamageType !== undefined) {
			let leftHandDamageTypeMatches = false;
			if (leftHandEquipped) {
				const itemDescription = leftHandItem!.description();
				leftHandDamageTypeMatches = itemDescription && itemDescription.damageType !== undefined && (itemDescription.damageType & preferredDamageType) !== 0 ? true : false;
			}

			let rightHandDamageTypeMatches = false;
			if (rightHandEquipped) {
				const itemDescription = rightHandItem!.description();
				rightHandDamageTypeMatches = itemDescription && itemDescription.damageType !== undefined && (itemDescription.damageType & preferredDamageType) !== 0 ? true : false;
			}

			if (leftHandDamageTypeMatches || rightHandDamageTypeMatches) {
				if (leftHandDamageTypeMatches !== context.player.options.leftHand) {
					oldui.changeEquipmentOption("leftHand");
				}

				if (rightHandDamageTypeMatches !== context.player.options.rightHand) {
					oldui.changeEquipmentOption("rightHand");
				}

			} else if (leftHandEquipped || rightHandEquipped) {
				if (leftHandEquipped && !context.player.options.leftHand) {
					oldui.changeEquipmentOption("leftHand");
				}

				if (rightHandEquipped && !context.player.options.rightHand) {
					oldui.changeEquipmentOption("rightHand");
				}

			} else {
				if (!context.player.options.leftHand) {
					oldui.changeEquipmentOption("leftHand");
				}

				if (!context.player.options.rightHand) {
					oldui.changeEquipmentOption("rightHand");
				}
			}

		} else {
			if (!leftHandEquipped && !rightHandEquipped) {
				// if we have nothing equipped in both hands, make sure the left hand is enabled
				if (!context.player.options.leftHand) {
					oldui.changeEquipmentOption("leftHand");
				}

			} else if (leftHandEquipped !== context.player.options.leftHand) {
				oldui.changeEquipmentOption("leftHand");
			}

			if (leftHandEquipped) {
				// if we have the left hand equipped, disable right hand
				if (context.player.options.rightHand) {
					oldui.changeEquipmentOption("rightHand");
				}

			} else if (rightHandEquipped !== context.player.options.rightHand) {
				oldui.changeEquipmentOption("rightHand");
			}
		}
	}

	private handEquipInterrupt(context: Context, equipType: EquipType, use?: ActionType, itemTypes?: Array<ItemType | ItemTypeGroup>, preferredDamageType?: DamageType): IObjective | undefined {
		const equippedItem = context.player.getEquippedItem(equipType);

		let possibleEquips: Item[];
		if (use) {
			possibleEquips = itemUtilities.getPossibleHandEquips(context, use, preferredDamageType, false);

			if (use === ActionType.Attack) {
				// equip based on how effective it will be against nearby creatures
				let closestCreature: Creature | undefined;
				let closestCreatureDistance: number | undefined;

				for (let x = -2; x <= 2; x++) {
					for (let y = -2; y <= 2; y++) {
						const point = game.ensureValidPoint({ x: context.player.x + x, y: context.player.y + y, z: context.player.z });
						if (point) {
							const tile = game.getTileFromPoint(point);
							if (tile.creature && !tile.creature.isTamed()) {
								const distance = Vector2.squaredDistance(context.player, tile.creature.getPoint());
								if (closestCreatureDistance === undefined || closestCreatureDistance > distance) {
									closestCreatureDistance = distance;
									closestCreature = tile.creature;
								}
							}
						}
					}
				}

				if (closestCreature) {
					// creature is close, calculate it
					possibleEquips
						.sort((a, b) => itemUtilities.estimateDamageModifier(b, closestCreature!) - itemUtilities.estimateDamageModifier(a, closestCreature!));

				} else if (context.player.getEquippedItem(equipType) !== undefined) {
					// don't switch until we're close to a creature
					return undefined;
				}
			}

			if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
				// fall back to not caring about the damage type
				possibleEquips = itemUtilities.getPossibleHandEquips(context, use, undefined, false);
			}

		} else if (itemTypes) {
			possibleEquips = [];

			for (const itemType of itemTypes) {
				if (itemManager.isGroup(itemType)) {
					possibleEquips.push(...itemManager.getItemsInContainerByGroup(context.player.inventory, itemType));

				} else {
					possibleEquips.push(...itemManager.getItemsInContainerByType(context.player.inventory, itemType));
				}
			}

		} else {
			return undefined;
		}

		if (possibleEquips.length > 0) {
			// always try to equip the two best items
			for (let i = 0; i < 2; i++) {
				const possibleEquipItem = possibleEquips[i];
				if (!possibleEquipItem || possibleEquipItem === equippedItem) {
					return undefined;
				}

				if (!possibleEquipItem.isEquipped()) {
					return new EquipItem(equipType, possibleEquips[i]);
				}
			}
		}
	}

	private repairsInterrupt(context: Context): IObjective[] | undefined {
		if (this.inventory.hammer === undefined) {
			return undefined;
		}

		const objectives = [
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.LeftHand)),
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.RightHand)),
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Chest)),
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Legs)),
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Head)),
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Belt)),
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Feet)),
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Neck)),
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Hands)),
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Back)),
			this.repairInterrupt(context, this.inventory.knife),
			this.repairInterrupt(context, this.inventory.fireStarter),
			this.repairInterrupt(context, this.inventory.hoe),
			this.repairInterrupt(context, this.inventory.axe),
			this.repairInterrupt(context, this.inventory.pickAxe),
			this.repairInterrupt(context, this.inventory.shovel),
			this.repairInterrupt(context, this.inventory.equipSword),
			this.repairInterrupt(context, this.inventory.equipShield),
			this.repairInterrupt(context, this.inventory.tongs),
			this.repairInterrupt(context, this.inventory.bed),
		];

		if (this.inventory.waterContainer) {
			for (const waterContainer of this.inventory.waterContainer) {
				objectives.push(this.repairInterrupt(context, waterContainer));
			}
		}

		return objectives.filter(objective => objective !== undefined) as IObjective[];
	}

	private repairInterrupt(context: Context, item: Item | undefined): IObjective | undefined {
		if (item === undefined || item.minDur === undefined || item.maxDur === undefined) {
			return undefined;
		}

		const threshold = baseUtilities.isNearBase(context) ? 0.2 : 0.1;
		if (item.minDur / item.maxDur >= threshold) {
			return undefined;
		}

		if (this.inventory.waterContainer?.includes(item) && context.player.stat.get<IStat>(Stat.Thirst).value < 2) {
			// don't worry about repairing a water container if it's an emergency
			return undefined;
		}

		return new RepairItem(item);
	}

	private nearbyCreatureInterrupt(context: Context): IObjective | undefined {
		const shouldRunAwayFromAllCreatures = creatureUtilities.shouldRunAwayFromAllCreatures(context);

		for (const facingDirecton of Direction.CARDINALS_AND_NONE) {
			const creature = this.checkNearbyCreature(context, facingDirecton);
			if (creature !== undefined) {
				log.info(`Defend against ${creature.getName().getString()}`);
				return new DefendAgainstCreature(creature, shouldRunAwayFromAllCreatures || creatureUtilities.isScaredOfCreature(context, creature));
			}
		}

		const nearbyCreatures = creatureUtilities.getNearbyCreatures(context.player);
		for (const creature of nearbyCreatures) {
			if (shouldRunAwayFromAllCreatures || creatureUtilities.isScaredOfCreature(context, creature)) {
				// only run away if the creature can path to us
				const path = creature.findPath(context.player, 16, context.player);
				if (path) {
					log.info(`Run away from ${creature.getName().getString()}`);
					return new RunAwayFromTarget(creature);
				}
			}
		}
	}

	private checkNearbyCreature(context: Context, direction: Direction.Cardinal | Direction.None): Creature | undefined {
		if (direction !== Direction.None) {
			const point = game.directionToMovement(direction);
			const validPoint = game.ensureValidPoint({ x: context.player.x + point.x, y: context.player.y + point.y, z: context.player.z });
			if (validPoint) {
				const tile = game.getTileFromPoint(validPoint);
				if (tile && tile.creature && !tile.creature.isTamed()) {
					//  && (tile.creature.ai & AiType.Hostile) !== 0
					return tile.creature;
				}
			}
		}
	}

	private buildItemObjectives(): IObjective[] {
		const objectives: IObjective[] = [];

		// prioritize building items that are in the inventory
		if (this.inventory.campfire !== undefined) {
			objectives.push(new BuildItem(this.inventory.campfire));
		}

		if (this.inventory.waterStill !== undefined) {
			objectives.push(new BuildItem(this.inventory.waterStill));
		}

		if (this.inventory.chest !== undefined) {
			objectives.push(new BuildItem(this.inventory.chest));
		}

		if (this.inventory.kiln !== undefined) {
			objectives.push(new BuildItem(this.inventory.kiln));
		}

		if (this.inventory.well !== undefined) {
			objectives.push(new BuildItem(this.inventory.well));
		}

		if (this.inventory.furnace !== undefined) {
			objectives.push(new BuildItem(this.inventory.furnace));
		}

		if (this.inventory.anvil !== undefined) {
			objectives.push(new BuildItem(this.inventory.anvil));
		}

		return objectives;
	}

	private gatherFromCorpsesInterrupt(context: Context): IObjective[] | undefined {
		if (itemUtilities.getInventoryItemsWithUse(context, ActionType.Carve).length === 0) {
			return undefined;
		}

		const targets = objectUtilities.findCarvableCorpses(context, "gatherFromCorpsesInterrupt", corpse => Vector2.distance(context.player, corpse) < 16);
		if (targets) {
			const objectives: IObjective[] = [];

			for (const target of targets) {
				const tile = game.getTileFromPoint(target);
				const corpses = tile.corpses;
				if (corpses && corpses.length > 0) {
					for (const corpse of corpses) {
						const resources = corpse.getResources(true);
						if (!resources || resources.length === 0) {
							continue;
						}

						const step = corpse.step || 0;
						const carveCount = resources.length - step;

						for (let i = 0; i < carveCount; i++) {
							objectives.push(new CarveCorpse(corpse));
						}
					}
				}
			}

			return objectives;
		}
	}

	private reduceWeightInterrupt(context: Context): IObjective | undefined {
		return new ReduceWeight({
			allowReservedItems: !baseUtilities.isNearBase(context) && this.weightStatus === WeightStatus.Overburdened,
			disableDrop: this.weightStatus !== WeightStatus.Overburdened && !baseUtilities.isNearBase(context),
		});
	}

	private returnToBaseInterrupt(context: Context): IObjective | undefined {
		if (!baseUtilities.isNearBase(context) &&
			this.weightStatus !== WeightStatus.None &&
			this.previousWeightStatus === WeightStatus.Overburdened &&
			context.getData(ContextDataType.MovingToNewIsland) !== MovingToNewIslandState.Ready) {
			return new ReturnToBase();
		}
	}

	private escapeCavesInterrupt(context: Context) {
		if (context.player.z === WorldZ.Cave) {
			return new MoveToZ(WorldZ.Overworld);
		}
	}

	/**
	 * Move reserved items into intermediate chests if the player is near the base and is moving away
	 * Explicitly not using OrganizeInventory for this - the exact objectives should be specified to prevent issues
	 */
	private organizeInventoryInterrupts(context: Context, interruptContext?: Context): IObjective[] | undefined {
		if (context.getDataOrDefault(ContextDataType.DisableMoveAwayFromBaseItemOrganization, false) ||
			context.getData(ContextDataType.MovingToNewIsland) === MovingToNewIslandState.Ready) {
			return undefined;
		}

		const walkPath = context.player.walkPath;
		if (walkPath === undefined || walkPath.path.length === 0) {
			return undefined;
		}

		if (!baseUtilities.isNearBase(context)) {
			return undefined;
		}

		const target = walkPath.path[walkPath.path.length - 1];
		if (baseUtilities.isNearBase(context, { x: target.x, y: target.y, z: context.player.z })) {
			return undefined;
		}

		let objectives: IObjective[] = [];

		const reservedItems = itemUtilities.getReservedItems(context);

		const interruptReservedItems = interruptContext ? itemUtilities.getReservedItems(interruptContext) : undefined;
		// if (interruptReservedItems) {
		// 	reservedItems = reservedItems.filter(item => !interruptReservedItems.includes(item));
		// }

		if (reservedItems.length > 0) {
			const organizeInventoryObjectives = OrganizeInventory.moveIntoChestsObjectives(context, reservedItems);
			if (organizeInventoryObjectives) {
				objectives = objectives.concat(organizeInventoryObjectives);
			}
		}

		let unusedItems = itemUtilities.getUnusedItems(context);

		// todo: this might be hiding a bug related to CompleteRequirements running after aquiring items from chests (infinite looping)
		const interruptUnusedItems = interruptContext ? itemUtilities.getUnusedItems(interruptContext) : undefined;
		if (interruptUnusedItems) {
			unusedItems = unusedItems.filter(item => !interruptReservedItems?.includes(item) && !interruptUnusedItems.includes(item));
		}

		if (unusedItems.length > 0) {
			const organizeInventoryObjectives = OrganizeInventory.moveIntoChestsObjectives(context, unusedItems);
			if (organizeInventoryObjectives) {
				objectives = objectives.concat(organizeInventoryObjectives);
			}
		}

		log.info(
			objectives.length > 0 ? "Going to organize inventory space" : "Will not organize inventory space",
			`Reserved items: ${reservedItems.join(",")}`,
			`Unused items: ${unusedItems.join(",")}`,
			`Context reserved items: ${Array.from(context.state.reservedItems).join(",")}`,
			`Interrupt context reserved items: ${Array.from(interruptContext?.state.reservedItems ?? []).join(",")}`,
			`Objectives: ${Objective.getPipelineString(objectives)}`);

		return objectives;
	}

	private processQueuedNavigationUpdates() {
		for (const queuedUpdate of this.navigationQueuedUpdates) {
			queuedUpdate();
		}

		this.navigationQueuedUpdates = [];
	}

	private processQuantumBurst() {
		if (!this.isQuantumBurstEnabled()) {
			return;
		}

		this.context.player.nextMoveTime = 0;
		this.context.player.movementFinishTime = 0;
		this.context.player.attackAnimationEndTime = 0;

		while (this.context.player.hasDelay()) {
			game.absoluteTime += 100;
		}
	}
}
