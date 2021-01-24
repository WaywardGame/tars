import { DoodadType, DoodadTypeGroup } from "doodad/IDoodad";
import { ActionType, IActionApi, IActionDescription } from "entity/action/IAction";
import Creature from "entity/creature/Creature";
import { DamageType } from "entity/IEntity";
import { EquipType } from "entity/IHuman";
import { IStat, IStatMax, Stat } from "entity/IStats";
import { MessageType, Source } from "entity/player/IMessageManager";
import { PlayerState, WeightStatus } from "entity/player/IPlayer";
import { INote } from "entity/player/note/NoteManager";
import Player from "entity/player/Player";
import { EventBus } from "event/EventBuses";
import { IEventEmitter } from "event/EventEmitter";
import { EventHandler } from "event/EventManager";
import { TileUpdateType, TurnMode } from "game/IGame";
import { WorldZ } from "game/WorldZ";
import { IContainer, ItemType, ItemTypeGroup } from "item/IItem";
import Item from "item/Item";
import { Dictionary } from "language/Dictionaries";
import Interrupt from "language/dictionary/Interrupt";
import InterruptChoice from "language/dictionary/InterruptChoice";
import Message from "language/dictionary/Message";
import Translation from "language/Translation";
import { HookMethod } from "mod/IHookHost";
import Mod from "mod/Mod";
import Register, { Registry } from "mod/ModRegistry";
import Bind from "newui/input/Bind";
import Bindable from "newui/input/Bindable";
import { IInput } from "newui/input/IInput";
import { NewUi } from "newui/NewUi";
import { DialogId } from "newui/screen/screens/game/Dialogs";
import { MenuBarButtonType } from "newui/screen/screens/game/static/menubar/IMenuBarButton";
import { MenuBarButtonGroup } from "newui/screen/screens/game/static/menubar/MenuBarButtonDescriptions";
import { gameScreen } from "newui/screen/screens/GameScreen";
import { InterruptOptions } from "newui/util/IInterrupt";
import { ITile } from "tile/ITerrain";
import { sleep } from "utilities/Async";
import Log from "utilities/Log";
import { Direction } from "utilities/math/Direction";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import TileHelpers from "utilities/TileHelpers";

import Context from "./Context";
import ContextState from "./ContextState";
import executor, { ExecuteObjectivesResultType } from "./Core/Executor";
import planner from "./Core/Planner";
import { ContextDataType, MovingToNewIslandState } from "./IContext";
import { IObjective, ObjectiveResult } from "./IObjective";
import { IBase, IInventoryItems, inventoryItemInfo, ISaveData, ITarsEvents, TarsTranslation, TARS_ID } from "./ITars";
import Navigation from "./Navigation/Navigation";
import Objective from "./Objective";
import AcquireFood from "./Objectives/Acquire/Item/AcquireFood";
import AcquireItem from "./Objectives/Acquire/Item/AcquireItem";
import AcquireItemByGroup from "./Objectives/Acquire/Item/AcquireItemByGroup";
import AcquireItemByTypes from "./Objectives/Acquire/Item/AcquireItemByTypes";
import AcquireItemForAction from "./Objectives/Acquire/Item/AcquireItemForAction";
import AcquireItemForDoodad from "./Objectives/Acquire/Item/AcquireItemForDoodad";
import AcquireWaterContainer from "./Objectives/Acquire/Item/Specific/AcquireWaterContainer";
import AnalyzeBase from "./Objectives/Analyze/AnalyzeBase";
import AnalyzeInventory from "./Objectives/Analyze/AnalyzeInventory";
import ExecuteAction from "./Objectives/Core/ExecuteAction";
import Lambda from "./Objectives/Core/Lambda";
import Restart from "./Objectives/Core/Restart";
import GatherWater from "./Objectives/Gather/GatherWater";
import CarveCorpse from "./Objectives/Interrupt/CarveCorpse";
import DefendAgainstCreature from "./Objectives/Interrupt/DefendAgainstCreature";
import OptionsInterrupt from "./Objectives/Interrupt/OptionsInterrupt";
import ReduceWeight from "./Objectives/Interrupt/ReduceWeight";
import RepairItem from "./Objectives/Interrupt/RepairItem";
import BuildItem from "./Objectives/Other/BuildItem";
import EmptyWaterContainer from "./Objectives/Other/EmptyWaterContainer";
import Equip from "./Objectives/Other/Equip";
import Idle from "./Objectives/Other/Idle";
import PlantSeed from "./Objectives/Other/PlantSeed";
import ReinforceItem from "./Objectives/Other/ReinforceItem";
import ReturnToBase from "./Objectives/Other/ReturnToBase";
import StartWaterStillDesalination from "./Objectives/Other/StartWaterStillDesalination";
import Unequip from "./Objectives/Other/Unequip";
import UpgradeInventoryItem from "./Objectives/Other/UpgradeInventoryItem";
import RecoverHealth from "./Objectives/Recover/RecoverHealth";
import RecoverHunger from "./Objectives/Recover/RecoverHunger";
import RecoverStamina from "./Objectives/Recover/RecoverStamina";
import RecoverThirst from "./Objectives/Recover/RecoverThirst";
import MoveToLand from "./Objectives/Utility/MoveToLand";
import MoveToNewIsland from "./Objectives/Utility/MoveToNewIsland";
import MoveToZ from "./Objectives/Utility/MoveToZ";
import OrganizeBase from "./Objectives/Utility/OrganizeBase";
import OrganizeInventory from "./Objectives/Utility/OrganizeInventory";
import TarsDialog from "./Ui/TarsDialog";
import * as Action from "./Utilities/Action";
import { getTilesWithItemsNearBase, isNearBase } from "./Utilities/Base";
import { canGatherWater, estimateDamageModifier, getBestActionItem, getBestEquipment, getInventoryItemsWithUse, getPossibleHandEquips, getReservedItems, getSeeds, getUnusedItems, isSafeToDrinkItem } from "./Utilities/Item";
import { log, logSourceName, preConsoleCallback } from "./Utilities/Logger";
import * as movementUtilities from "./Utilities/Movement";
import * as objectUtilities from "./Utilities/Object";
import * as tileUtilities from "./Utilities/Tile";

const tickSpeed = 333;

// can be negative. ex: -8 means [max - 8[]
const recoverThresholds: { [index: number]: number } = {
	[Stat.Health]: 30,
	[Stat.Stamina]: 20,
	[Stat.Hunger]: 8,
	[Stat.Thirst]: 10,
};

// focus on healing if our health is below 85% while poisoned
const poisonHealthPercentThreshold = 0.85;

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

	@Register.bindable("ToggleDialog", IInput.key("KeyT", "Shift"))
	public readonly bindableToggleDialog: Bindable;

	@Register.bindable("ToggleTars", IInput.key("KeyT"))
	public readonly bindableToggleTars: Bindable;

	////////////////////////////////////

	@Register.messageSource("TARS")
	public readonly messageSource: Source;

	@Register.message("Toggle")
	public readonly messageToggle: Message;

	@Register.message("NavigationUpdating")
	public readonly messageNavigationUpdating: Message;

	@Register.message("NavigationUpdated")
	public readonly messageNavigationUpdated: Message;

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
	private navigationQueuedUpdates: Array<() => void>;

	public onInitialize(): void {
		Navigation.setModPath(this.getPath());

		Log.setSourceFilter(Log.LogType.File, false, logSourceName);
	}

	public onUninitialize(): void {
		this.onGameEnd();
	}

	public onLoad(): void {
		this.delete();
		this.navigation = Navigation.get();

		Log.addPreConsoleCallback(preConsoleCallback);

		(window as any).TARS = this;
		(window as any).TARS_Planner = planner;
		(window as any).TARS_TileUtilities = tileUtilities;

		// this is to support hot reloading while in game
		if (this.saveData.shouldOpenDialog) {
			this.saveData.shouldOpenDialog = undefined;
			gameScreen?.openDialog(Tars.INSTANCE.dialogMain);
		}
	}

	public onUnload(): void {
		this.disable(true);
		this.delete();

		Log.removePreConsoleCallback(preConsoleCallback);

		(window as any).TARS = undefined;
		(window as any).TARS_Planner = undefined;
		(window as any).TARS_TileUtilities = undefined;

		// this is to support hot reloading while in game
		if (gameScreen?.isDialogVisible(Tars.INSTANCE.dialogMain)) {
			this.saveData.shouldOpenDialog = true;
			gameScreen?.closeDialog(Tars.INSTANCE.dialogMain);
		}
	}

	////////////////////////////////////////////////
	// Hooks
	////////////////////////////////////////////////

	@EventHandler(EventBus.Game, "play")
	public onGameStart(): void {
		if (this.saveData.enabled && !this.isEnabled()) {
			this.toggle();
		}
	}

	@EventHandler(EventBus.Game, "end")
	public onGameEnd(state?: PlayerState): void {
		this.disable(true);
		this.delete();
	}

	@EventHandler(EventBus.LocalPlayer, "writeNote")
	public onWriteNote(player: Player, note: INote): false | void {
		if (this.isEnabled()) {
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
		if (this.isEnabled() && player.isLocalPlayer()) {
			if (this.navigationSystemState === NavigationSystemState.Initialized && this.navigation) {
				this.navigation.queueUpdateOrigin(player);
			}

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
		if (this.isEnabled()) {
			this.processQueuedNavigationUpdates();
		}
	}

	@EventHandler(EventBus.LocalPlayer, "moveComplete")
	public onMoveComplete(player: Player) {
		movementUtilities.clearOverlay(player.getTile());
	}

	@EventHandler(EventBus.Ui, "interrupt")
	public onInterrupt(host: NewUi, options: Partial<InterruptOptions>, interrupt?: Interrupt): string | boolean | void | InterruptChoice | undefined {
		if (this.isEnabled() && (interrupt === Interrupt.GameDangerousStep || interrupt === Interrupt.GameTravelConfirmation)) {
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
	public onTileUpdate(game: any, tile: ITile, tileX: number, tileY: number, tileZ: number, tileUpdateType: TileUpdateType): void {
		if (this.navigationSystemState === NavigationSystemState.Initializing || localPlayer.isResting()) {
			this.navigationQueuedUpdates.push(() => {
				this.onTileUpdate(game, tile, tileX, tileY, tileZ, tileUpdateType);
			});

		} else if (this.navigationSystemState === NavigationSystemState.Initialized && this.navigation) {
			// update this tile and its neighbors
			for (let x = -1; x <= 1; x++) {
				for (let y = -1; y <= 1; y++) {
					if (x === 0 && y === 0) {
						this.navigation.onTileUpdate(tile, TileHelpers.getType(tile), tileX, tileY, tileZ);

					} else {
						const point = game.ensureValidPoint({ x: tileX + x, y: tileY + y, z: tileZ });
						if (point) {
							const otherTile = game.getTileFromPoint(point);
							this.navigation.onTileUpdate(otherTile, TileHelpers.getType(otherTile), tileX + x, tileY + y, tileZ);
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

		Action.postExecuteAction(api.type);
	}

	@EventHandler(EventBus.LocalPlayer, "walkPathChange")
	public onWalkPathChange(player: Player, walkPath: IVector2[] | undefined) {
		if (!walkPath || walkPath.length === 0 || !this.isEnabled()) {
			return;
		}

		const organizeInventoryInterrupts = this.organizeInventoryInterrupts(this.context, this.interruptContext);
		if (organizeInventoryInterrupts && organizeInventoryInterrupts.length > 0) {
			this.interrupt(...organizeInventoryInterrupts);
		}
	}

	@EventHandler(EventBus.LocalPlayer, "preMove")
	public preMove(player: Player, prevX: number, prevY: number, prevZ: number, prevTile: ITile, nextX: number, nextY: number, nextZ: number, nextTile: ITile) {
		if (!this.isEnabled() || !player.hasWalkPath()) {
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
		if (!this.isEnabled()) {
			return;
		}

		const recoverThreshold = this.getRecoverThreshold(this.context, stat.type);
		if (recoverThreshold !== undefined) {
			if (stat.value <= recoverThreshold) {
				if (!this.statThresholdExceeded[stat.type]) {
					this.statThresholdExceeded[stat.type] = true;

					if (this.isEnabled()) {
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

					if (this.isEnabled()) {
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

	public async moveToFaceTarget(target: IVector3) {
		return movementUtilities.moveToFaceTarget(new Context(localPlayer, this.base, this.inventory), target);
	}

	////////////////////////////////////////////////

	public getTranslation(translation: TarsTranslation) {
		return new Translation(this.dictionary, translation);
	}

	public isEnabled(): boolean {
		return this.tickTimeoutId !== undefined;
	}

	public async toggle() {
		if (this.navigationSystemState === NavigationSystemState.Initializing) {
			return;
		}

		const str = !this.isEnabled() ? "Enabled" : "Disabled";

		log.info(str);

		localPlayer.messages
			.source(this.messageSource)
			.type(MessageType.Good)
			.send(this.messageToggle, !this.isEnabled());

		if (this.navigationSystemState === NavigationSystemState.NotInitialized && this.navigation) {
			this.navigationSystemState = NavigationSystemState.Initializing;

			this.updateStatus();

			localPlayer.messages
				.source(this.messageSource)
				.type(MessageType.Good)
				.send(this.messageNavigationUpdating);

			// give a chance for the message to show up on screen before starting nav update
			await sleep(100);

			await this.navigation.updateAll();

			this.navigation.queueUpdateOrigin(localPlayer);

			this.navigationSystemState = NavigationSystemState.Initialized;

			this.processQueuedNavigationUpdates();

			localPlayer.messages
				.source(this.messageSource)
				.type(MessageType.Good)
				.send(this.messageNavigationUpdated);
		}

		this.context = new Context(localPlayer, this.base, this.inventory);

		this.reset();

		this.saveData.enabled = !this.isEnabled();

		if (this.saveData.enabled) {
			if (this.navigation) {
				this.navigation.showOverlay();

				if (this.navigationSystemState === NavigationSystemState.Initialized) {
					this.navigation.queueUpdateOrigin(localPlayer);
				}
			}

			this.tickTimeoutId = setTimeout(this.tick.bind(this), tickSpeed);

		} else {
			this.disable();
		}

		this.event.emit("enableChange", this.isEnabled());
		// this.updateStatus();
	}

	@Bound
	public getStatus(): Translation | string {
		if (this.navigationSystemState === NavigationSystemState.Initializing) {
			return this.getTranslation(TarsTranslation.DialogStatusNavigatingInitializing);
		}

		if (!this.isEnabled()) {
			return "Waiting to be enabled";
		}

		const plan = executor.getPlan();
		if (plan !== undefined) {
			const statusMessage = plan.tree.objective.getStatusMessage();
			if (this.lastStatusMessage !== statusMessage) {
				this.lastStatusMessage = statusMessage;
				log.info(`Status: ${statusMessage}`, plan.tree.objective);
			}

			return statusMessage;
		}

		return "Idle";
	}

	public updateStatus() {
		this.event.emit("statusChange", this.getStatus());
	}

	////////////////////////////////////////////////

	private reset() {
		executor.reset();
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

		this.reset();

		this.navigationSystemState = NavigationSystemState.NotInitialized;
		this.navigationQueuedUpdates = [];

		Navigation.delete();
	}

	private disable(gameIsEnding: boolean = false) {
		if (this.navigation) {
			this.navigation.hideOverlay();
		}

		if (this.tickTimeoutId !== undefined) {
			clearTimeout(this.tickTimeoutId);
			this.tickTimeoutId = undefined;
		}

		movementUtilities.resetMovementOverlays();

		if (localPlayer) {
			localPlayer.walkAlongPath(undefined);
			OptionsInterrupt.restore();
		}
	}

	private interrupt(...interruptObjectives: IObjective[]) {
		log.info("Interrupt", interruptObjectives.map(objective => objective.getHashCode()).join(" -> "));

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
			await this.onTick();
			this.updateStatus();

		} catch (ex) {
			log.error("onTick error", ex);
		}

		if (this.tickTimeoutId === undefined) {
			this.disable();
			return;
		}

		this.tickTimeoutId = setTimeout(this.tick.bind(this), tickSpeed);
	}

	private async onTick() {
		if (!this.isEnabled() || !executor.isReady(this.context, false)) {
			if (game.playing && this.context.player.isGhost() && game.getGameOptions().respawn) {
				await new ExecuteAction(ActionType.Respawn, (context, action) => {
					action.execute(context.player);
				}).execute(this.context);
			}

			return;
		}

		objectUtilities.resetCachedObjects();
		movementUtilities.resetCachedPaths();
		tileUtilities.resetNearestTileLocationCache();

		// system objectives
		await executor.executeObjectives(this.context, [new AnalyzeInventory(), new AnalyzeBase()], false, false);

		// interrupts
		const interrupts = this.getInterrupts(this.context);
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
		}

		const result = await executor.executeObjectives(this.context, this.determineObjectives(this.context), true, true);
		switch (result.type) {
			case ExecuteObjectivesResultType.Pending:
			case ExecuteObjectivesResultType.ContinuingNextTick:
				// save the active objective
				this.objectivePipeline = result.objectives.length > 0 ? result.objectives : undefined;
				log.info(`Saved objectives - ${ExecuteObjectivesResultType[result.type]}`, Objective.getPipelineString(this.objectivePipeline));
				return;

			default:
				this.objectivePipeline = undefined;
				return;
		}
	}

	private determineObjectives(context: Context): Array<IObjective | IObjective[]> {
		const chest = context.player.getEquippedItem(EquipType.Chest);
		const legs = context.player.getEquippedItem(EquipType.Legs);
		const belt = context.player.getEquippedItem(EquipType.Belt);
		const neck = context.player.getEquippedItem(EquipType.Neck);
		const back = context.player.getEquippedItem(EquipType.Back);
		const head = context.player.getEquippedItem(EquipType.Head);
		const feet = context.player.getEquippedItem(EquipType.Feet);
		const hands = context.player.getEquippedItem(EquipType.Hands);

		const objectives: Array<IObjective | IObjective[]> = [];

		const moveToNewIslandState = context.getData(ContextDataType.MovingToNewIsland) ?? MovingToNewIslandState.None;

		if (moveToNewIslandState === MovingToNewIslandState.Ready) {
			if (this.inventory.sailBoat && !itemManager.isContainableInContainer(this.inventory.sailBoat, context.player.inventory)) {
				// it should grab it from our chest
				objectives.push(new AcquireItem(ItemType.Sailboat));
			}

			objectives.push(new MoveToNewIsland());

			return objectives;
		}

		if (this.inventory.sailBoat && itemManager.isContainableInContainer(this.inventory.sailBoat, context.player.inventory)) {
			// don't carry the sail boat around if we don't have a base - we likely just moved to a new island
			objectives.push([
				new MoveToLand(),
				new ExecuteAction(ActionType.Drop, (context, action) => {
					action.execute(context.player, this.inventory.sailBoat!);
				}).setStatus("Dropping sailboat"),
			]);
		}

		const gatherItem = getBestActionItem(context, ActionType.Gather, DamageType.Slashing);
		if (gatherItem === undefined) {
			objectives.push([new AcquireItemForAction(ActionType.Gather)]);
		}

		if (this.base.campfire.length === 0 && this.inventory.campfire === undefined) {
			log.info("Need campfire");
			objectives.push([new AcquireItemByGroup(ItemTypeGroup.Campfire), new BuildItem(), new AnalyzeBase()]);
		}

		if (this.inventory.fireStarter === undefined) {
			log.info("Need fire starter");
			objectives.push([new AcquireItemForAction(ActionType.StartFire), new AnalyzeInventory()]);
		}

		if (this.inventory.fireKindling === undefined || this.inventory.fireKindling.length === 0) {
			log.info("Need fire kindling");
			objectives.push([new AcquireItemByGroup(ItemTypeGroup.Kindling), new AnalyzeInventory()]);
		}

		if (this.inventory.fireTinder === undefined) {
			log.info("Need fire tinder");
			objectives.push([new AcquireItemByGroup(ItemTypeGroup.Tinder), new AnalyzeInventory()]);
		}

		// if (this.inventory.fireStoker === undefined || this.inventory.fireStoker.length < 4) {
		// 	objectives.push([new AcquireItemForAction(ActionType.StokeFire), new AnalyzeInventory()]);
		// }

		if (this.inventory.shovel === undefined) {
			objectives.push([new AcquireItemForAction(ActionType.Dig), new AnalyzeInventory()]);
		}

		if (this.inventory.knife === undefined) {
			objectives.push([new AcquireItem(ItemType.StoneKnife), new AnalyzeInventory()]);
		}

		if (this.inventory.equipSword === undefined) {
			objectives.push([new AcquireItem(ItemType.WoodenSword), new AnalyzeInventory(), new Equip(EquipType.LeftHand)]);
		}

		if (this.inventory.axe === undefined) {
			objectives.push([new AcquireItem(ItemType.StoneAxe), new AnalyzeInventory()]);
		}

		if (chest === undefined || chest.type === ItemType.TatteredShirt) {
			objectives.push([new AcquireItem(ItemType.BarkTunic), new AnalyzeInventory(), new Equip(EquipType.Chest)]);
		}

		if (legs === undefined || legs.type === ItemType.TatteredPants) {
			objectives.push([new AcquireItem(ItemType.BarkLeggings), new AnalyzeInventory(), new Equip(EquipType.Legs)]);
		}

		if (this.inventory.equipShield === undefined) {
			objectives.push([new AcquireItem(ItemType.WoodenShield), new AnalyzeInventory(), new Equip(EquipType.RightHand)]);
		}

		if (this.base.waterStill.length === 0 && this.inventory.waterStill === undefined) {
			objectives.push([new AcquireItemByGroup(ItemTypeGroup.WaterStill), new BuildItem(), new AnalyzeBase()]);
		}

		let acquireChest = true;

		if (this.base.buildAnotherChest) {
			// build another chest if we're near the base
			acquireChest = isNearBase(context);

		} else if (this.base.chest.length > 0) {
			for (const c of this.base.chest) {
				if ((itemManager.computeContainerWeight(c as IContainer) / c.weightCapacity) < 0.9) {
					acquireChest = false;
					break;
				}
			}
		}

		if (acquireChest && this.inventory.chest === undefined) {
			// mark that we should build a chest (memory)
			// we need to do this to prevent a loop
			// if we take items out of a chest to build another chest,
			// the weight capacity could go back under the threshold. and then it wouldn't want to build another chest
			// this is reset to false in baseInfo.onAdd
			this.base.buildAnotherChest = true;

			objectives.push([new AcquireItemForDoodad(DoodadType.WoodenChest), new BuildItem(), new AnalyzeBase()]);
		}

		if (this.inventory.pickAxe === undefined) {
			objectives.push([new AcquireItem(ItemType.StonePickaxe), new AnalyzeInventory()]);
		}

		if (this.inventory.hammer === undefined) {
			objectives.push([new AcquireItem(ItemType.StoneHammer), new AnalyzeInventory()]);
		}

		if (this.inventory.tongs === undefined) {
			objectives.push([new AcquireItemByGroup(ItemTypeGroup.Tongs), new AnalyzeInventory()]);
		}

		if (isNearBase(context)) {
			// ensure water stills are water stilling
			for (const waterStill of context.base.waterStill) {
				objectives.push(new StartWaterStillDesalination(waterStill));
			}

			// todo: improve seed planting - grab from base chests too! and add reserved items for it
			const seeds = getSeeds(context);
			if (seeds.length > 0) {
				objectives.push(new PlantSeed(seeds[0]));
			}
		}

		if (this.base.kiln.length === 0 && this.inventory.kiln === undefined) {
			objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.LitKiln), new BuildItem(), new AnalyzeBase()]);
		}

		if (this.inventory.heal === undefined) {
			objectives.push([new AcquireItemForAction(ActionType.Heal), new AnalyzeInventory()]);
		}

		const waitingForWater = context.player.stat.get<IStat>(Stat.Thirst).value <= this.getRecoverThreshold(context, Stat.Thirst) &&
			this.base.waterStill.length > 0 && this.base.waterStill[0].description()!.providesFire;

		const shouldUpgradeToLeather = !waitingForWater;
		if (shouldUpgradeToLeather) {
			/*
				Upgrade to leather
				Order is based on recipe level
			*/

			if (belt === undefined) {
				objectives.push([new AcquireItem(ItemType.LeatherBelt), new AnalyzeInventory(), new Equip(EquipType.Belt)]);
			}

			if (neck === undefined) {
				objectives.push([new AcquireItem(ItemType.LeatherGorget), new AnalyzeInventory(), new Equip(EquipType.Neck)]);
			}

			if (head === undefined) {
				objectives.push([new AcquireItem(ItemType.LeatherCap), new AnalyzeInventory(), new Equip(EquipType.Head)]);
			}

			if (back === undefined) {
				objectives.push([new AcquireItem(ItemType.LeatherQuiver), new AnalyzeInventory(), new Equip(EquipType.Back)]);
			}

			if (feet === undefined) {
				objectives.push([new AcquireItem(ItemType.LeatherBoots), new AnalyzeInventory(), new Equip(EquipType.Feet)]);
			}

			if (hands === undefined) {
				objectives.push([new AcquireItem(ItemType.LeatherGloves), new AnalyzeInventory(), new Equip(EquipType.Hands)]);
			}

			if (legs && legs.type === ItemType.BarkLeggings) {
				objectives.push([new AcquireItem(ItemType.LeatherPants), new AnalyzeInventory(), new Equip(EquipType.Legs)]);
			}

			if (chest && chest.type === ItemType.BarkTunic) {
				objectives.push([new AcquireItem(ItemType.LeatherTunic), new AnalyzeInventory(), new Equip(EquipType.Chest)]);
			}
		}

		/*
			Extra objectives
		*/

		if (this.base.well.length === 0 && this.inventory.well === undefined && this.base.availableUnlimitedWellLocation !== undefined) {
			// todo: only build a well if we find a good tile?
			objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.Well), new BuildItem(), new AnalyzeBase()]);
		}

		if (this.base.furnace.length === 0 && this.inventory.furnace === undefined) {
			objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.LitFurnace), new BuildItem(), new AnalyzeBase()]);
		}

		if (this.base.anvil.length === 0 && this.inventory.anvil === undefined) {
			objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.Anvil), new BuildItem(), new AnalyzeBase()]);
		}

		if (this.inventory.waterContainer === undefined) {
			objectives.push([new AcquireWaterContainer(), new AnalyzeInventory()]);
		}

		// run a few extra things before running upgrade objectives if we're near a base 
		if (isNearBase(context)) {
			// build a second water still
			if (context.base.waterStill.length < 2) {
				objectives.push([new AcquireItemByGroup(ItemTypeGroup.WaterStill), new BuildItem(), new AnalyzeBase()]);
			}

			// carry food with you
			if (this.inventory.food === undefined) {
				objectives.push([new AcquireFood(), new AnalyzeInventory()]);
			}

			// carry a bandage with you
			if (this.inventory.bandage === undefined) {
				objectives.push([new AcquireItemByTypes(inventoryItemInfo.bandage.itemTypes as ItemType[]), new AnalyzeInventory()]);
			}

			// carry drinkable water with you
			let availableWaterContainer: Item | undefined;

			if (context.inventory.waterContainer !== undefined) {
				const hasDrinkableWater = context.inventory.waterContainer.some(isSafeToDrinkItem);
				if (!hasDrinkableWater) {
					availableWaterContainer = context.inventory.waterContainer.find(canGatherWater);
					if (!availableWaterContainer) {
						// use the first water container we have - pour it out first
						availableWaterContainer = context.inventory.waterContainer[0];
						objectives.push(new EmptyWaterContainer(availableWaterContainer));
					}

					// we are looking for something drinkable
					// if there is a well, starting the water still will use it
					objectives.push(new GatherWater(availableWaterContainer, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true }));
				}
			}

			if (moveToNewIslandState === MovingToNewIslandState.None) {
				// cleanup base if theres items laying around everywhere
				const tiles = getTilesWithItemsNearBase(context);
				if (tiles.totalCount > (availableWaterContainer ? 0 : 20)) {
					objectives.push(new OrganizeBase(tiles.tiles));
				}
			}

			if (availableWaterContainer) {
				// we are trying to gather water. wait before moving on to upgrade objectives
				objectives.push(new GatherWater(availableWaterContainer, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWaterStill: true }));
			}
		}

		// keep existing equipment in good shape
		if (this.inventory.equipSword && this.inventory.equipSword.type !== ItemType.WoodenSword) {
			objectives.push(new ReinforceItem(this.inventory.equipSword, 0.5));
		}

		if (this.inventory.equipShield && this.inventory.equipShield.type !== ItemType.WoodenShield) {
			objectives.push(new ReinforceItem(this.inventory.equipShield, 0.5));
		}

		if (this.inventory.equipBelt) {
			objectives.push(new ReinforceItem(this.inventory.equipBelt, 0.5));
		}

		if (this.inventory.equipNeck) {
			objectives.push(new ReinforceItem(this.inventory.equipNeck, 0.5));
		}

		if (this.inventory.equipFeet) {
			objectives.push(new ReinforceItem(this.inventory.equipFeet, 0.5));
		}

		if (this.inventory.equipHands) {
			objectives.push(new ReinforceItem(this.inventory.equipHands, 0.5));
		}

		if (this.inventory.equipLegs && this.inventory.equipLegs.type !== ItemType.BarkLeggings) {
			objectives.push(new ReinforceItem(this.inventory.equipLegs, 0.5));
		}

		if (this.inventory.equipChest && this.inventory.equipChest.type !== ItemType.BarkTunic) {
			objectives.push(new ReinforceItem(this.inventory.equipChest, 0.5));
		}

		/*
			Upgrade objectives
		*/

		if (this.inventory.equipSword && this.inventory.equipSword.type === ItemType.WoodenSword) {
			objectives.push([new UpgradeInventoryItem("equipSword"), new AnalyzeInventory(), new Equip(EquipType.LeftHand)]);
		}

		if (this.inventory.equipShield && this.inventory.equipShield.type === ItemType.WoodenShield) {
			objectives.push([new UpgradeInventoryItem("equipShield"), new AnalyzeInventory(), new Equip(EquipType.RightHand)]);
		}

		if (this.inventory.equipBelt && this.inventory.equipBelt.type === ItemType.LeatherBelt) {
			objectives.push([new UpgradeInventoryItem("equipBelt"), new AnalyzeInventory(), new Equip(EquipType.Belt)]);
		}

		if (this.inventory.equipNeck && this.inventory.equipNeck.type === ItemType.LeatherGorget) {
			objectives.push([new UpgradeInventoryItem("equipNeck"), new AnalyzeInventory(), new Equip(EquipType.Neck)]);
		}

		if (this.inventory.equipHead && this.inventory.equipHead.type === ItemType.LeatherCap) {
			objectives.push([new UpgradeInventoryItem("equipHead"), new AnalyzeInventory(), new Equip(EquipType.Head)]);
		}

		if (this.inventory.equipFeet && this.inventory.equipFeet.type === ItemType.LeatherBoots) {
			objectives.push([new UpgradeInventoryItem("equipFeet"), new AnalyzeInventory(), new Equip(EquipType.Feet)]);
		}

		if (this.inventory.equipHands && this.inventory.equipHands.type === ItemType.LeatherGloves) {
			objectives.push([new UpgradeInventoryItem("equipHands"), new AnalyzeInventory(), new Equip(EquipType.Hands)]);
		}

		if (this.inventory.equipLegs && this.inventory.equipLegs.type === ItemType.LeatherPants) {
			objectives.push([new UpgradeInventoryItem("equipLegs"), new AnalyzeInventory(), new Equip(EquipType.Legs)]);
		}

		if (this.inventory.equipChest && this.inventory.equipChest.type === ItemType.LeatherTunic) {
			objectives.push([new UpgradeInventoryItem("equipChest"), new AnalyzeInventory(), new Equip(EquipType.Chest)]);
		}

		if (this.inventory.axe && this.inventory.axe.type === ItemType.StoneAxe) {
			objectives.push([new UpgradeInventoryItem("axe"), new AnalyzeInventory()]);
		}

		if (this.inventory.pickAxe && this.inventory.pickAxe.type === ItemType.StonePickaxe) {
			objectives.push([new UpgradeInventoryItem("pickAxe"), new AnalyzeInventory()]);
		}

		if (this.inventory.shovel && this.inventory.shovel.type === ItemType.StoneShovel) {
			objectives.push([new UpgradeInventoryItem("shovel"), new AnalyzeInventory()]);
		}

		if (this.inventory.hoe && this.inventory.hoe.type === ItemType.StoneHoe) {
			objectives.push([new UpgradeInventoryItem("hoe"), new AnalyzeInventory()]);
		}

		/*
			End game objectives
		*/

		if (!multiplayer.isConnected()) {
			// move to a new island

			const needsFood = this.inventory.food === undefined || this.inventory.food.length < 2;

			switch (moveToNewIslandState) {
				case MovingToNewIslandState.None:
					objectives.push(new Lambda(async () => {
						const initialState = new ContextState();
						initialState.set(ContextDataType.MovingToNewIsland, MovingToNewIslandState.Preparing);
						this.context.setInitialState(initialState);
						return ObjectiveResult.Complete;
					}));

				case MovingToNewIslandState.Preparing:
					// make a sail boat
					if (!this.inventory.sailBoat) {
						objectives.push([new AcquireItem(ItemType.Sailboat), new AnalyzeInventory()]);

						if (needsFood) {
							// this lets TARS drop the sailboat until we're ready
							objectives.push(new Restart());
						}
					}

					// stock up on food
					if (needsFood) {
						objectives.push([new AcquireFood(), new AnalyzeInventory()]);
					}

					objectives.push(new Lambda(async () => {
						const initialState = new ContextState();
						initialState.set(ContextDataType.MovingToNewIsland, MovingToNewIslandState.Ready);
						this.context.setInitialState(initialState);
						return ObjectiveResult.Complete;
					}));

				case MovingToNewIslandState.Ready:
					if (this.inventory.sailBoat && !itemManager.isContainableInContainer(this.inventory.sailBoat, context.player.inventory)) {
						// it should grab it from our chest
						objectives.push(new AcquireItem(ItemType.Sailboat));
					}

					objectives.push(new MoveToNewIsland());

					break;
			}

		} else {
			const health = context.player.stat.get<IStatMax>(Stat.Health);
			if (health.value / health.max < 0.9) {
				objectives.push(new RecoverHealth());
			}

			const hunger = context.player.stat.get<IStatMax>(Stat.Hunger);
			if (hunger.value / hunger.max < 0.7) {
				objectives.push(new RecoverHunger(true));
			}

			objectives.push(new ReturnToBase());

			objectives.push(new OrganizeInventory());
		}

		if (!multiplayer.isConnected()) {
			if (shouldUpgradeToLeather && game.getTurnMode() !== TurnMode.RealTime) {
				objectives.push(new Lambda(async () => {
					log.info("Done with all objectives! Disabling...");

					localPlayer.messages
						.source(this.messageSource)
						.type(MessageType.Good)
						.send(this.messageToggle, false);

					this.disable();

					return ObjectiveResult.Complete;
				}));

			} else {
				objectives.push(new Idle());
			}
		}

		return objectives;
	}

	// todo: add severity to stat interrupts to prioritize which one to run
	private getInterrupts(context: Context): Array<IObjective | IObjective[] | undefined> {
		let interrupts = [
			this.optionsInterrupt(),
			this.equipmentInterrupt(context),
			this.nearbyCreatureInterrupt(context),
			this.staminaInterrupt(context),
			this.buildItemObjectives(),
			this.healthInterrupt(context),
			this.reduceWeightInterrupt(context),
			this.thirstInterrupt(context),
			this.gatherFromCorpsesInterrupt(context),
			this.hungerInterrupt(context),
			this.repairsInterrupt(context),
			this.escapeCavesInterrupt(context),
			this.returnToBaseInterrupt(context),
		];

		const organizeInventoryInterrupts = this.organizeInventoryInterrupts(context);
		if (organizeInventoryInterrupts) {
			interrupts = interrupts.concat(organizeInventoryInterrupts);
		}

		return interrupts;
	}

	private optionsInterrupt(): IObjective | undefined {
		return new OptionsInterrupt();
	}

	private equipmentInterrupt(context: Context): IObjective | undefined {
		return this.handsEquipInterrupt(context) ||
			this.equipInterrupt(context, EquipType.Chest) ||
			this.equipInterrupt(context, EquipType.Legs) ||
			this.equipInterrupt(context, EquipType.Head) ||
			this.equipInterrupt(context, EquipType.Belt) ||
			this.equipInterrupt(context, EquipType.Feet) ||
			this.equipInterrupt(context, EquipType.Hands) ||
			this.equipInterrupt(context, EquipType.Neck) ||
			this.equipInterrupt(context, EquipType.Back);
	}

	private equipInterrupt(context: Context, equip: EquipType): IObjective | undefined {
		const item = context.player.getEquippedItem(equip);
		if (item && item.type === ItemType.SlitherSucker) {
			// brain slugs are bad
			return new Unequip(item);
		}

		const bestEquipment = getBestEquipment(context, equip);
		if (bestEquipment.length > 0) {
			const itemToEquip = bestEquipment[0];
			if (itemToEquip === item) {
				return undefined;
			}

			if (item !== undefined) {
				return new Unequip(item);
			}

			return new Equip(equip, itemToEquip);
		}
	}

	private handsEquipInterrupt(context: Context, preferredDamageType?: DamageType): IObjective | undefined {
		const leftHandEquipInterrupt = this.handEquipInterrupt(context, EquipType.LeftHand, ActionType.Attack);
		if (leftHandEquipInterrupt) {
			return leftHandEquipInterrupt;
		}

		if (context.inventory.equipShield && !context.inventory.equipShield.isEquipped()) {
			return new Equip(EquipType.RightHand, context.inventory.equipShield);
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
					ui.changeEquipmentOption("leftHand");
				}

				if (rightHandDamageTypeMatches !== context.player.options.rightHand) {
					ui.changeEquipmentOption("rightHand");
				}

			} else if (leftHandEquipped || rightHandEquipped) {
				if (leftHandEquipped && !context.player.options.leftHand) {
					ui.changeEquipmentOption("leftHand");
				}

				if (rightHandEquipped && !context.player.options.rightHand) {
					ui.changeEquipmentOption("rightHand");
				}

			} else {
				if (!context.player.options.leftHand) {
					ui.changeEquipmentOption("leftHand");
				}

				if (!context.player.options.rightHand) {
					ui.changeEquipmentOption("rightHand");
				}
			}

		} else {
			if (!leftHandEquipped && !rightHandEquipped) {
				// if we have nothing equipped in both hands, make sure the left hand is enabled
				if (!context.player.options.leftHand) {
					ui.changeEquipmentOption("leftHand");
				}

			} else if (leftHandEquipped !== context.player.options.leftHand) {
				ui.changeEquipmentOption("leftHand");
			}

			if (leftHandEquipped) {
				// if we have the left hand equipped, disable right hand
				if (context.player.options.rightHand) {
					ui.changeEquipmentOption("rightHand");
				}

			} else if (rightHandEquipped !== context.player.options.rightHand) {
				ui.changeEquipmentOption("rightHand");
			}
		}
	}

	private handEquipInterrupt(context: Context, equipType: EquipType, use?: ActionType, itemTypes?: Array<ItemType | ItemTypeGroup>, preferredDamageType?: DamageType): IObjective | undefined {
		const equippedItem = context.player.getEquippedItem(equipType);

		let possibleEquips: Item[];
		if (use) {
			possibleEquips = getPossibleHandEquips(context, use, preferredDamageType, false);

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
						.sort((a, b) => estimateDamageModifier(b, closestCreature!) - estimateDamageModifier(a, closestCreature!));

				} else if (context.player.getEquippedItem(equipType) !== undefined) {
					// don't switch until we're close to a creature
					return undefined;
				}
			}

			if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
				// fall back to not caring about the damage type
				possibleEquips = getPossibleHandEquips(context, use, undefined, false);
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
					return new Equip(equipType, possibleEquips[i]);
				}
			}
		}
	}

	private healthInterrupt(context: Context): IObjective | undefined {
		const health = context.player.stat.get<IStatMax>(Stat.Health);
		if (health.value > this.getRecoverThreshold(context, Stat.Health) && !context.player.status.Bleeding &&
			(!context.player.status.Poisoned || (context.player.status.Poisoned && (health.value / health.max) >= poisonHealthPercentThreshold))) {
			return undefined;
		}

		log.info("Heal");
		return new RecoverHealth();
	}

	private staminaInterrupt(context: Context): IObjective | undefined {
		if (context.player.stat.get<IStat>(Stat.Stamina).value > this.getRecoverThreshold(context, Stat.Stamina)) {
			return undefined;
		}

		log.info("Stamina");
		return new RecoverStamina();
	}

	private hungerInterrupt(context: Context): IObjective | undefined {
		return new RecoverHunger(context.player.stat.get<IStat>(Stat.Hunger).value <= this.getRecoverThreshold(context, Stat.Hunger));
	}

	private thirstInterrupt(context: Context): IObjective | undefined {
		return new RecoverThirst(context.player.stat.get<IStat>(Stat.Thirst).value <= this.getRecoverThreshold(context, Stat.Thirst));
	}

	private repairsInterrupt(context: Context): IObjective | undefined {
		if (this.inventory.hammer === undefined) {
			return undefined;
		}

		let objective = this.repairInterrupt(context, context.player.getEquippedItem(EquipType.LeftHand)) ||
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.RightHand)) ||
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Chest)) ||
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Legs)) ||
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Head)) ||
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Belt)) ||
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Feet)) ||
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Neck)) ||
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Hands)) ||
			this.repairInterrupt(context, context.player.getEquippedItem(EquipType.Back)) ||
			this.repairInterrupt(context, this.inventory.knife) ||
			this.repairInterrupt(context, this.inventory.fireStarter) ||
			this.repairInterrupt(context, this.inventory.hoe) ||
			this.repairInterrupt(context, this.inventory.axe) ||
			this.repairInterrupt(context, this.inventory.pickAxe) ||
			this.repairInterrupt(context, this.inventory.shovel) ||
			this.repairInterrupt(context, this.inventory.equipSword) ||
			this.repairInterrupt(context, this.inventory.equipShield) ||
			this.repairInterrupt(context, this.inventory.bed);
		if (objective) {
			return objective;
		}

		if (this.inventory.waterContainer) {
			for (const waterContainer of this.inventory.waterContainer) {
				objective = this.repairInterrupt(context, waterContainer);
				if (objective) {
					return objective;
				}
			}
		}

		return undefined;
	}

	private repairInterrupt(context: Context, item: Item | undefined): IObjective | undefined {
		if (item === undefined || item.minDur === undefined || item.maxDur === undefined) {
			return undefined;
		}

		const threshold = isNearBase(context) ? 0.2 : 0.1;
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
		for (const facingDirecton of Direction.DIRECTIONS) {
			const creature = this.checkNearbyCreature(context, facingDirecton);
			if (creature !== undefined) {
				log.info(`Defend against ${creature.getName().getString()}`);
				return new DefendAgainstCreature(creature);
			}
		}
	}

	private checkNearbyCreature(context: Context, direction: Direction): Creature | undefined {
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
		if (getInventoryItemsWithUse(context, ActionType.Carve).length === 0) {
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
			allowReservedItems: !isNearBase(context) && this.weightStatus === WeightStatus.Overburdened,
			disableDrop: this.weightStatus !== WeightStatus.Overburdened && !isNearBase(context),
		});
	}

	private returnToBaseInterrupt(context: Context): IObjective | undefined {
		if (!isNearBase(context) &&
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
		const walkPath = context.player.walkPath;
		if (walkPath === undefined || walkPath.path.length === 0) {
			return undefined;
		}

		if (!isNearBase(context)) {
			return undefined;
		}

		const target = walkPath.path[walkPath.path.length - 1];
		if (isNearBase(context, { x: target.x, y: target.y, z: context.player.z })) {
			return undefined;
		}

		let objectives: IObjective[] = [];

		const reservedItems = getReservedItems(context);

		const interruptReservedItems = interruptContext ? getReservedItems(interruptContext) : undefined;
		// if (interruptReservedItems) {
		// 	reservedItems = reservedItems.filter(item => !interruptReservedItems.includes(item));
		// }

		if (reservedItems.length > 0) {
			const organizeInventoryObjectives = OrganizeInventory.moveIntoChestsObjectives(context, reservedItems);
			if (organizeInventoryObjectives) {
				objectives = objectives.concat(organizeInventoryObjectives);
			}
		}

		let unusedItems = getUnusedItems(context);

		// todo: this might be hiding a bug related to CompleteRequirements running after aquiring items from chests (infinite looping)
		const interruptUnusedItems = interruptContext ? getUnusedItems(interruptContext) : undefined;
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
			`Reserved items: ${reservedItems.join(",")}, Unused items: ${unusedItems.join(",")}`,
			`Context reserved items: ${Array.from(context.state.reservedItems).join(",")}`,
			`Interrupt context reserved items: ${Array.from(interruptContext?.state.reservedItems ?? []).join(",")}`);

		return objectives;
	}

	private processQueuedNavigationUpdates() {
		for (const queuedUpdate of this.navigationQueuedUpdates) {
			queuedUpdate();
		}

		this.navigationQueuedUpdates = [];
	}

	private getRecoverThreshold(context: Context, stat: Stat) {
		const recoverThreshold = recoverThresholds[stat];
		return recoverThreshold > 0 ? recoverThreshold : context.player.stat.get<IStatMax>(stat).max + recoverThreshold;
	}
}
