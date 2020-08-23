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
import { EventHandler } from "event/EventManager";
import { TileUpdateType, TurnMode } from "game/IGame";
import { IContainer, ItemType, ItemTypeGroup } from "item/IItem";
import Item from "item/Item";
import Interrupt from "language/dictionary/Interrupt";
import InterruptChoice from "language/dictionary/InterruptChoice";
import Message from "language/dictionary/Message";
import { HookMethod } from "mod/IHookHost";
import Mod from "mod/Mod";
import Register, { Registry } from "mod/ModRegistry";
import Bind from "newui/input/Bind";
import Bindable from "newui/input/Bindable";
import { IInput } from "newui/input/IInput";
import { NewUi } from "newui/NewUi";
import { InterruptOptions } from "newui/util/IInterrupt";
import { ITile } from "tile/ITerrain";
import { sleep } from "utilities/Async";
import Log from "utilities/Log";
import { Direction } from "utilities/math/Direction";
import Vector2 from "utilities/math/Vector2";
import TileHelpers from "utilities/TileHelpers";

import Context from "./Context";
import executor, { ExecuteObjectivesResultType } from "./Core/Executor";
import planner from "./Core/Planner";
import { IObjective, ObjectiveResult } from "./IObjective";
import { IBase, IInventoryItems, inventoryItemInfo } from "./ITars";
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
import OrganizeBase from "./Objectives/Utility/OrganizeBase";
import OrganizeInventory from "./Objectives/Utility/OrganizeInventory";
import * as Action from "./Utilities/Action";
import { getTilesWithItemsNearBase, isNearBase } from "./Utilities/Base";
import { canGatherWater, estimateDamageModifier, getBestActionItem, getBestEquipment, getInventoryItemsWithUse, getPossibleHandEquips, getReservedItems, getSeeds, getUnusedItems, isSafeToDrinkItem } from "./Utilities/Item";
import { log, preConsoleCallback } from "./Utilities/Logger";
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

	@Register.bindable("Toggle", IInput.key("KeyT"))
	public readonly keyBind: Bindable;

	@Register.messageSource("TARS")
	public readonly messageSource: Source;

	@Register.message("Toggle")
	public readonly messageToggle: Message;

	@Register.message("NavigationUpdating")
	public readonly messageNavigationUpdating: Message;

	@Register.message("NavigationUpdated")
	public readonly messageNavigationUpdated: Message;

	private base: IBase;
	private inventory: IInventoryItems;

	private readonly statThresholdExceeded: { [index: number]: boolean } = {};
	private weightStatus: WeightStatus | undefined;
	private previousWeightStatus: WeightStatus | undefined;

	private context: Context;
	private objectivePipeline: Array<IObjective | IObjective[]> | undefined;
	private interruptObjectivePipeline: Array<IObjective | IObjective[]> | undefined;
	private interruptContext: Context | undefined;
	private readonly interruptContexts: Map<number, Context> = new Map();
	private interruptsId: string | undefined;

	private tickTimeoutId: number | undefined;

	private navigation: Navigation | undefined;
	private navigationInitialized: NavigationSystemState;
	private navigationQueuedUpdates: Array<() => void>;

	public onInitialize(): void {
		Navigation.setModPath(this.getPath());
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
	}

	public onUnload(): void {
		this.disable(true);
		this.delete();

		Log.removePreConsoleCallback(preConsoleCallback);

		(window as any).TARS = undefined;
		(window as any).TARS_Planner = undefined;
		(window as any).TARS_TileUtilities = undefined;
	}

	////////////////////////////////////////////////
	// Hooks
	////////////////////////////////////////////////

	@EventHandler(EventBus.Game, "end")
	public onGameEnd(state?: PlayerState): void {
		this.disable(true);
		this.delete();
	}

	@HookMethod
	public onWriteNote(player: Player, note: INote): false | undefined {
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

		if (this.navigationInitialized === NavigationSystemState.Initialized && this.navigation) {
			this.navigation.queueUpdateOrigin(localPlayer);
		}
	}

	@EventHandler(EventBus.LocalPlayer, "processMovement")
	public async processMovement(player: Player): Promise<void> {
		if (this.isEnabled() && player.isLocalPlayer()) {
			if (this.navigationInitialized === NavigationSystemState.Initialized && this.navigation) {
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
		if (this.isEnabled() && interrupt === Interrupt.GameDangerousStep) {
			return true;
		}
	}

	@Bind.onDown(Registry<Tars>().get("keyBind"))
	public onToggleBind() {
		this.toggle();
		return true;
	}

	@EventHandler(EventBus.Game, "tileUpdate")
	public onTileUpdate(game: any, tile: ITile, tileX: number, tileY: number, tileZ: number, tileUpdateType: TileUpdateType): void {
		if (this.navigationInitialized === NavigationSystemState.Initializing || localPlayer.isResting()) {
			this.navigationQueuedUpdates.push(() => {
				this.onTileUpdate(game, tile, tileX, tileY, tileZ, tileUpdateType);
			});

		} else if (this.navigationInitialized === NavigationSystemState.Initialized && this.navigation) {
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

		const organizeInventoryInterrupts = this.organizeInventoryInterrupts(this.context);
		if (organizeInventoryInterrupts && organizeInventoryInterrupts.length > 0) {
			this.interrupt(...organizeInventoryInterrupts);
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

	@Register.command("TARS")
	protected command(_player: Player, _args: string) {
		this.toggle();
	}

	private reset() {
		executor.reset();
		this.objectivePipeline = undefined;
		this.interruptObjectivePipeline = undefined;
		this.interruptsId = undefined;
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

		this.navigationInitialized = NavigationSystemState.NotInitialized;
		this.navigationQueuedUpdates = [];

		Navigation.delete();
	}

	private isEnabled(): boolean {
		return this.tickTimeoutId !== undefined;
	}

	private async toggle() {
		if (this.navigationInitialized === NavigationSystemState.Initializing) {
			return;
		}

		const str = !this.isEnabled() ? "Enabled" : "Disabled";

		log.info(str);

		localPlayer.messages
			.source(this.messageSource)
			.type(MessageType.Good)
			.send(this.messageToggle, !this.isEnabled());

		if (this.navigationInitialized === NavigationSystemState.NotInitialized && this.navigation) {
			this.navigationInitialized = NavigationSystemState.Initializing;

			localPlayer.messages
				.source(this.messageSource)
				.type(MessageType.Good)
				.send(this.messageNavigationUpdating);

			// give a chance for the message to show up on screen before starting nav update
			await sleep(100);

			await this.navigation.updateAll();

			this.navigation.queueUpdateOrigin(localPlayer);

			this.navigationInitialized = NavigationSystemState.Initialized;

			this.processQueuedNavigationUpdates();

			localPlayer.messages
				.source(this.messageSource)
				.type(MessageType.Good)
				.send(this.messageNavigationUpdated);
		}

		this.context = new Context(localPlayer, this.base, this.inventory);

		this.reset();

		if (this.isEnabled()) {
			this.disable();

		} else {
			if (this.navigation) {
				this.navigation.showOverlay();

				if (this.navigationInitialized === NavigationSystemState.Initialized) {
					this.navigation.queueUpdateOrigin(localPlayer);
				}
			}

			this.tickTimeoutId = setTimeout(this.tick.bind(this), tickSpeed);
		}
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
		const interruptsId = interrupts
			.filter(objective => objective !== undefined)
			.map(objective => Array.isArray(objective) ? objective.map(o => o.getIdentifier()).join(" -> ") : objective!.getIdentifier())
			.join(", ");

		if (this.interruptsId !== interruptsId) {
			log.info(`Interrupts changed from ${this.interruptsId} to ${interruptsId}`);
			this.interruptsId = interruptsId;
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
							log.info(`Ignoring continuing interrupt objectives due to changed interrupts - ${ExecuteObjectivesResultType[result.type]}`);
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

		if (this.inventory.shovel === undefined) {
			objectives.push([new AcquireItem(ItemType.StoneShovel), new AnalyzeInventory()]);
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

					objectives.push(new GatherWater(availableWaterContainer, { disallowTerrain: true, allowStartingWaterStill: true }));
				}
			}

			// cleanup base if theres items laying around everywhere
			const tiles = getTilesWithItemsNearBase(context);
			if (tiles.totalCount > (availableWaterContainer ? 0 : 20)) {
				objectives.push(new OrganizeBase(tiles.tiles));
			}

			if (availableWaterContainer) {
				// we are trying to gather water. wait before moving on to upgrade objectives
				objectives.push(new GatherWater(availableWaterContainer, { disallowTerrain: true, allowStartingWaterStill: true, allowWaitingForWaterStill: true }));
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

		// if (!this.inventory.sailBoat) {
		// 	objectives.push([new AcquireItem(ItemType.Sailboat), new AnalyzeInventory(), new Equip(EquipType.Chest)]);
		// }

		/*
			End game objectives
		*/
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
						.sort((a, b) => estimateDamageModifier(a, closestCreature!) < estimateDamageModifier(b, closestCreature!) ? 1 : -1);

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
						const resources = corpseManager.getResources(corpse, true);
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
		if (!isNearBase(context) && this.weightStatus !== WeightStatus.None && this.previousWeightStatus === WeightStatus.Overburdened) {
			return new ReturnToBase();
		}
	}

	/**
	 * Move reserved items into intermediate chests if the player is near the base and is moving away
	 * Explicitly not using OrganizeInventory for this - the exact objectives should be specified to prevent issues
	 */
	private organizeInventoryInterrupts(context: Context): IObjective[] | undefined {
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

		const chests = context.base.chest.slice().concat(context.base.intermediateChest);

		let objectives: IObjective[] = [];

		const reservedItems = getReservedItems(context);
		if (reservedItems.length > 0) {
			for (const chest of chests) {
				const organizeInventoryObjectives = OrganizeInventory.moveIntoChestObjectives(context, chest, reservedItems);
				if (organizeInventoryObjectives) {
					objectives = objectives.concat(organizeInventoryObjectives);
					break;
				}
			}
		}

		const unusedItems = getUnusedItems(context);
		if (unusedItems.length > 0) {
			for (const chest of chests) {
				const organizeInventoryObjectives = OrganizeInventory.moveIntoChestObjectives(context, chest, unusedItems);
				if (organizeInventoryObjectives) {
					objectives = objectives.concat(organizeInventoryObjectives);
					break;
				}
			}
		}

		if (objectives.length > 0) {
			log.info("Going to organize inventory space");
		} else {
			log.info(`Will not organize inventory space. Reserved items: ${reservedItems.length}, Unused items: ${reservedItems.length}`);
		}

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
