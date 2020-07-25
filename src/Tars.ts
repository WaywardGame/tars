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
import Message from "language/dictionary/Message";
import { HookMethod } from "mod/IHookHost";
import Mod from "mod/Mod";
import Register, { Registry } from "mod/ModRegistry";
import Bind from "newui/input/Bind";
import Bindable from "newui/input/Bindable";
import { IInput } from "newui/input/IInput";
import { ITile } from "tile/ITerrain";
import { sleep } from "utilities/Async";
import { Direction } from "utilities/math/Direction";
import Vector2 from "utilities/math/Vector2";
import TileHelpers from "utilities/TileHelpers";

import Context from "./Context";
import Planner from "./Core/Planner";
import { IObjective, ObjectiveResult } from "./IObjective";
import { desertCutoff, IBase, IInventoryItems } from "./ITars";
import Navigation from "./Navigation/Navigation";
import AcquireItem from "./Objectives/Acquire/Item/AcquireItem";
import AcquireItemByGroup from "./Objectives/Acquire/Item/AcquireItemByGroup";
import AcquireItemForAction from "./Objectives/Acquire/Item/AcquireItemForAction";
import AcquireItemForDoodad from "./Objectives/Acquire/Item/AcquireItemForDoodad";
import AcquireWaterContainer from "./Objectives/Acquire/Item/Specific/AcquireWaterContainer";
import AnalyzeBase from "./Objectives/Analyze/AnalyzeBase";
import AnalyzeInventory from "./Objectives/Analyze/AnalyzeInventory";
import Lambda from "./Objectives/Core/Lambda";
import CarveCorpse from "./Objectives/Interrupt/CarveCorpse";
import DefendAgainstCreature from "./Objectives/Interrupt/DefendAgainstCreature";
import OptionsInterrupt from "./Objectives/Interrupt/OptionsInterrupt";
import ReduceWeight from "./Objectives/Interrupt/ReduceWeight";
import RepairItem from "./Objectives/Interrupt/RepairItem";
import BuildItem from "./Objectives/Other/BuildItem";
import Equip from "./Objectives/Other/Equip";
import Idle from "./Objectives/Other/Idle";
import PlantSeed from "./Objectives/Other/PlantSeed";
import ReturnToBase from "./Objectives/Other/ReturnToBase";
import StartWaterStillDesalination from "./Objectives/Other/StartWaterStillDesalination";
import Unequip from "./Objectives/Other/Unequip";
import UpgradeInventoryItem from "./Objectives/Other/UpgradeInventoryItem";
import RecoverHealth from "./Objectives/Recover/RecoverHealth";
import RecoverHunger from "./Objectives/Recover/RecoverHunger";
import RecoverStamina from "./Objectives/Recover/RecoverStamina";
import RecoverThirst from "./Objectives/Recover/RecoverThirst";
import LeaveDesert from "./Objectives/Utility/LeaveDesert";
import OrganizeInventory from "./Objectives/Utility/OrganizeInventory";
import * as Action from "./Utilities/Action";
import { isNearBase } from "./Utilities/Base";
import { estimateDamageModifier, getBestActionItem, getBestEquipment, getInventoryItemsWithUse, getPossibleHandEquips, getSeeds } from "./Utilities/Item";
import { log } from "./Utilities/Logger";
import * as movementUtilities from "./Utilities/Movement";
import * as objectUtilities from "./Utilities/Object";
import * as tileUtilities from "./Utilities/Tile";

const tickSpeed = 333;

const recoverThresholds: { [index: number]: number } = {
	[Stat.Health]: 30,
	[Stat.Stamina]: 20,
	[Stat.Hunger]: 10,
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
	private weightChanged: boolean;

	private context: Context;
	private objective: IObjective | undefined;
	private interruptObjective: IObjective | undefined;
	private interruptContext: Context | undefined;
	private readonly interruptContexts: Map<number, Context> = new Map();
	private interruptsId: string | undefined;
	private interrupted = false;

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

	////////////////////////////////////////////////
	// Hooks
	////////////////////////////////////////////////

	@HookMethod
	public onGameStart(isLoadingSave: boolean, playedCount: number): void {
		this.delete();

		this.navigation = Navigation.get();
	}

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

	@EventHandler(EventBus.LocalPlayer, "processMovement")
	public async processMovement(player: Player): Promise<void> {
		if (this.isEnabled() && player.isLocalPlayer()) {
			if (this.navigationInitialized === NavigationSystemState.Initialized && this.navigation) {
				this.navigation.queueUpdateOrigin(player);
			}

			const objective = this.interruptObjective || this.objective;
			if (objective !== undefined) {
				const result = await objective.onMove(this.context);
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
		if (this.isEnabled()) {
			movementUtilities.clearOverlay(player.getTile());
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

	@EventHandler(EventBus.LocalPlayer, "statChanged")
	public onStatChange(player: Player, stat: IStat) {
		const recoverThreshold = recoverThresholds[stat.type];
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
				this.weightChanged = true;

				const weightStatus = player.getWeightStatus();
				if (this.weightStatus !== weightStatus) {
					const previousWeightStatus = this.weightStatus;

					this.weightStatus = weightStatus;

					if (weightStatus === WeightStatus.None) {
						return;
					}

					if (this.isEnabled()) {
						// players weight status changed
						// reset objectives so we'll handle this immediately
						log.info(`Weight status changed from ${previousWeightStatus !== undefined ? WeightStatus[previousWeightStatus] : "N/A"} to ${WeightStatus[this.weightStatus]}`);

						this.interrupt();
					}
				}

				break;
		}
	}

	////////////////////////////////////////////////

	@Register.command("TARS")
	protected command(_player: Player, _args: string) {
		this.toggle();
	}

	private reset() {
		this.objective = undefined;
		this.interruptObjective = undefined;
		this.interruptsId = undefined;
		this.interrupted = false;
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

	private isReady(checkForInterrupts: boolean) {
		return this.isEnabled() &&
			!this.context.player.isResting() &&
			!this.context.player.isMovingClientside &&
			!this.context.player.hasDelay() &&
			!this.context.player.isGhost() &&
			!game.paused &&
			(!checkForInterrupts || !this.interrupted);
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

		if (localPlayer && !gameIsEnding) {
			movementUtilities.resetMovementOverlays();
			localPlayer.walkAlongPath(undefined);
		}
	}

	private interrupt(interruptObjective?: IObjective) {
		log.info("Interrupt", interruptObjective);

		this.interrupted = true;

		this.objective = undefined;

		if (interruptObjective) {
			this.interruptObjective = interruptObjective;
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
		if (!this.isReady(false)) {
			return;
		}

		objectUtilities.resetCachedObjects();
		movementUtilities.resetCachedPaths();
		tileUtilities.resetNearestTileLocationCache();

		// system objectives
		await this.executeObjectives(this.context, [new AnalyzeInventory(), new AnalyzeBase()], false, false);

		// interrupts
		const interrupts = this.getInterrupts(this.context);
		const interruptsId = interrupts
			.map(objective => objective && (Array.isArray(objective) ? objective.map(o => o.getIdentifier()).join(" -> ") : objective.getIdentifier()))
			.join(", ");

		if (this.interruptsId !== interruptsId) {
			log.info(`Interrupts changed from ${this.interruptsId} to ${interruptsId}`);
			this.interruptsId = interruptsId;
			this.interruptObjective = undefined;
		}

		if (this.interruptObjective || interrupts.length > 0) {
			if (!this.interruptContext) {
				// we should use our main context when running interrupt objectives
				// this will prevent interrupts from messing with reserved items
				// when the context is reset, it goes back to this initial state
				this.interruptContext = this.context.clone();
				this.interruptContext.setInitialState();

				this.interruptContexts.clear();

				log.debug(`Created interrupt context with hash code: ${this.interruptContext.getHashCode()}`);
			}

			if (this.interruptObjective) {
				this.interruptObjective.log.info("Continuing interrupt execution...");

				const result = await this.executeObjectives(this.interruptContext, [this.interruptObjective], false);
				if (result !== true) {
					// still working on it
					return;
				}

				this.interruptObjective = undefined;
			}

			if (interrupts.length > 0) {
				// return interrupts.filter(objective => objective !== undefined && (!Array.isArray(objective) || objective.length > 0)) as Array<IObjective | IObjective[]>;

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

					const result = await this.executeObjectives(this.interruptContext, [interruptObjectives], true);

					log.debug("Interrupt result", result);

					if (!this.interruptContext) {
						// tars was disabled mid run
						return;
					}

					if (result === true) {
						// finished working on it
						// update the initial state of the interrupt context
						// it's possible interrupt() was called, so we'll come back here with the same context
						// this.interruptContext.setInitialState();
						// todo: nest interrupt support / contexts?

						// ensure the current objective is cleared
						this.interruptObjective = undefined;

						if (this.interruptContexts.has(i)) {
							this.interruptContexts.delete(i);
							log.debug(`Deleting saved context from ${i}`);
						}

					} else {
						// in progress. run again during the next tick

						// save this context so it will be restored next time
						this.interruptContexts.set(i, this.interruptContext.clone());
						log.debug(`Saving context to ${i} with new initial state. ${this.interruptContext}`);

						// update the initial state so we don't mess with items between interrupts
						this.interruptContext.setInitialState();

						if (result !== false) {
							// save the active objective
							this.interruptObjective = result.find(objective => !objective.canSaveChildObjectives()) || result[result.length - 1];

							// reset main objective
							this.objective = undefined;
						}

						return;
					}
				}
			}

			// console.log.info("this.objective", this.objective ? this.objective.getHashCode() : undefined);

			if (this.interrupted) {
				this.interrupted = false;

				// nested interrupt. update interrupt context
				this.interruptContext.setInitialState();

				log.debug(`Nested interrupt. Updating context with hash code: ${this.interruptContext.getHashCode()}`);

				return;
			}
		}

		if (this.interrupted) {
			this.interrupted = false;
			return;
		}

		// no longer working on interrupts
		this.interruptContext = undefined;

		if (this.objective !== undefined) {
			// we have an objective we are working on
			this.objective.log.info("Continuing execution...");

			const result = await this.executeObjectives(this.context, [this.objective], false, true);
			if (result !== true) {
				// still working on it
				return;
			}
		}

		const result = await this.executeObjectives(this.context, this.determineObjectives(this.context), true, true);
		if (result === true || result === false) {
			this.objective = undefined;

		} else {
			// save the active objective
			this.objective = result.find(objective => !objective.canSaveChildObjectives()) || result[result.length - 1];

			// console.log.info("saved objective", this.objective, this.objective.getHashCode());
		}
	}

	/**
	 * Execute objectives
	 * @param objectives Array of objectives
	 * @param resetContextState True to reset the context before running each objective
	 * @param checkForInterrupts True to interrupt objective execution when an interrupt occurs
	 * @returns An objective (if it's still being worked on), True if all the objectives are completed
	 * False if objectives are waiting for the next tick to continue running
	 */
	private async executeObjectives(
		context: Context,
		objectives: Array<IObjective | IObjective[]>,
		resetContextState: boolean,
		checkForInterrupts: boolean = false): Promise<IObjective[] | boolean> {
		for (const objective of objectives) {
			if (!this.isReady(checkForInterrupts)) {
				return false;
			}

			if (resetContextState) {
				// reset before running objectives
				context.reset();
				log.debug(`Reset context state. Context hash code: ${context.getHashCode()}.`);
			}

			let objs: IObjective[];
			if (Array.isArray(objective)) {
				objs = objective;
			} else {
				objs = [objective];
			}

			Planner.reset();

			for (const o of objs) {
				const plan = await Planner.createPlan(context, o);
				if (!plan) {
					log.warn(`No valid plan for ${o.getHashCode()}`);
					break;
				}

				const result = await plan.execute(
					() => {
						this.weightChanged = false;
						return true;
					},
					() => {
						if (this.weightChanged && context.player.getWeightStatus() !== WeightStatus.None) {
							log.info("Weight changed. Stopping execution");
							return false;
						}

						return this.isReady(checkForInterrupts);
					});

				if (result === ObjectiveResult.Restart) {
					return false;
				}

				if (result === false) {
					return false;
				}

				if (typeof (result) !== "boolean") {
					return result;
				}
			}
		}

		return true;
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
			objectives.push([new AcquireItemByGroup(ItemTypeGroup.Campfire), new BuildItem(), new AnalyzeBase()]);
		}

		if (this.inventory.fireStarter === undefined) {
			objectives.push([new AcquireItemForAction(ActionType.StartFire), new AnalyzeInventory()]);
		}

		if (this.inventory.fireKindling === undefined) {
			objectives.push([new AcquireItemByGroup(ItemTypeGroup.Kindling), new AnalyzeInventory()]);
		}

		if (this.inventory.fireTinder === undefined) {
			objectives.push([new AcquireItemByGroup(ItemTypeGroup.Tinder), new AnalyzeInventory()]);
		}

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

		if (!this.base.buildAnotherChest && this.base.chest.length > 0) {
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

		if (context.base.waterStill.length > 0) {
			objectives.push(new StartWaterStillDesalination(context.base.waterStill[0]));

			// if (context.inventory.waterContainer !== undefined && !canDrinkItem(context.inventory.waterContainer)) {
			// 	objectives.push(new GatherWaterFromStill(context.base.waterStill, context.inventory.waterContainer));
			// }
		}

		if (isNearBase(context)) {
			// todo: improve seed planting - grab from base chests too! and add reserved items for it
			const seeds = getSeeds(context);
			if (seeds.length > 0) {
				objectives.push(new PlantSeed(seeds[0]));
			}
		}

		if (this.base.kiln.length === 0 && this.inventory.kiln === undefined) {
			objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.LitKiln), new BuildItem(), new AnalyzeBase()]);
		}

		const waitingForWater = context.player.stat.get<IStat>(Stat.Thirst).value <= recoverThresholds[Stat.Thirst] &&
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

		// todo: add inventory bandage (it's good to have one on you!)
		if (this.inventory.waterContainer === undefined) {
			objectives.push([new AcquireWaterContainer(), new AnalyzeInventory()]);
		}

		/*
			Upgrade objectives
		*/

		// objectives.push([new EnsureReservableItem(ItemType.WroughtIron, 12)]);

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
		return [
			this.optionsInterrupt(),
			this.equipmentInterrupt(context),
			this.nearbyCreatureInterrupt(context),
			this.staminaInterrupt(context),
			this.buildItemObjectives(),
			this.healthInterrupt(context),
			this.weightInterrupt(),
			this.leaveDesertInterrupt(context),
			this.thirstInterrupt(context),
			this.gatherFromCorpsesInterrupt(context),
			this.hungerInterrupt(context),
			this.repairsInterrupt(context),
		];
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
			if (leftHandEquipped !== context.player.options.leftHand) {
				ui.changeEquipmentOption("leftHand");
			}

			if (rightHandEquipped !== context.player.options.rightHand) {
				ui.changeEquipmentOption("rightHand");
			}

			if (!context.player.options.leftHand && !context.player.options.rightHand) {
				ui.changeEquipmentOption("leftHand");
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
								const distance = Vector2.distance(context.player, tile.creature.getPoint());
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
		if (health.value > recoverThresholds[Stat.Health] && !context.player.status.Bleeding &&
			(!context.player.status.Poisoned || (context.player.status.Poisoned && (health.value / health.max) >= poisonHealthPercentThreshold))) {
			return undefined;
		}

		log.info("Heal");
		return new RecoverHealth();
	}

	private staminaInterrupt(context: Context): IObjective | undefined {
		if (context.player.stat.get<IStat>(Stat.Stamina).value > recoverThresholds[Stat.Stamina]) {
			return undefined;
		}

		log.info("Stamina");
		return new RecoverStamina();
	}

	private hungerInterrupt(context: Context): IObjective | undefined {
		return new RecoverHunger(context.player.stat.get<IStat>(Stat.Hunger).value <= recoverThresholds[Stat.Hunger]);
	}

	private thirstInterrupt(context: Context): IObjective | undefined {
		return new RecoverThirst(context.player.stat.get<IStat>(Stat.Thirst).value <= recoverThresholds[Stat.Thirst]);
	}

	private repairsInterrupt(context: Context): IObjective | undefined {
		if (this.inventory.hammer === undefined) {
			return undefined;
		}

		return this.repairInterrupt(context, context.player.getEquippedItem(EquipType.LeftHand)) ||
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
			this.repairInterrupt(context, this.inventory.fireKindling) ||
			this.repairInterrupt(context, this.inventory.hoe) ||
			this.repairInterrupt(context, this.inventory.axe) ||
			this.repairInterrupt(context, this.inventory.pickAxe) ||
			this.repairInterrupt(context, this.inventory.shovel) ||
			this.repairInterrupt(context, this.inventory.equipSword) ||
			this.repairInterrupt(context, this.inventory.equipShield) ||
			this.repairInterrupt(context, this.inventory.bed) ||
			this.repairInterrupt(context, this.inventory.waterContainer);
	}

	private repairInterrupt(context: Context, item: Item | undefined): IObjective | undefined {
		if (item === undefined || item.minDur === undefined || item.maxDur === undefined) {
			return undefined;
		}

		if (item.minDur / item.maxDur >= 0.6) {
			return undefined;
		}

		if (item === this.inventory.waterContainer && context.player.stat.get<IStat>(Stat.Thirst).value < 2) {
			// don't worry about reparing the water container if it's an emergency
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

	private weightInterrupt(): IObjective | undefined {
		return new ReduceWeight();
	}

	private leaveDesertInterrupt(context: Context): IObjective | undefined {
		if (context.player.y < desertCutoff) {
			return undefined;
		}

		return new LeaveDesert();
	}

	private processQueuedNavigationUpdates() {
		for (const queuedUpdate of this.navigationQueuedUpdates) {
			queuedUpdate();
		}

		this.navigationQueuedUpdates = [];
	}
}
