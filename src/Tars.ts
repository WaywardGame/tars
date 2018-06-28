import { IActionArgument, IActionResult } from "action/IAction";
import { ICreature } from "creature/ICreature";
import Doodads from "doodad/Doodads";
import { IStat, IStatMax, Stat } from "entity/IStats";
import { ActionType, Bindable, CreatureType, DamageType, DoodadType, DoodadTypeGroup, EquipType, Direction, ItemType, ItemTypeGroup } from "Enums";
import { IContainer, IItem } from "item/IItem";
import { MessageType } from "language/IMessages";
import { HookMethod } from "mod/IHookHost";
import Mod from "mod/Mod";
import { BindCatcherApi } from "newui/BindingManager";
import { IPlayer } from "player/IPlayer";
import { ITile } from "tile/ITerrain";
import Enums from "utilities/enum/Enums";
import Vector2 from "utilities/math/Vector2";
import TileHelpers from "utilities/TileHelpers";
import * as Helpers from "./Helpers";
import { IObjective, ObjectiveStatus } from "./IObjective";
import { desertCutoff, IBase, IInventoryItems } from "./ITars";
import { deleteNavigation, getNavigation, Navigation } from "./Navigation";
import AcquireItem from "./Objectives/AcquireItem";
import AcquireItemByGroup from "./Objectives/AcquireItemByGroup";
import AcquireItemForAction from "./Objectives/AcquireItemForAction";
import AcquireItemForDoodad from "./Objectives/AcquireItemForDoodad";
import AcquireWaterContainer from "./Objectives/AcquireWaterContainer";
import BuildItem from "./Objectives/BuildItem";
import CarveCorpse from "./Objectives/CarveCorpse";
import DefendAgainstCreature from "./Objectives/DefendAgainstCreature";
import Equip from "./Objectives/Equip";
import Idle from "./Objectives/Idle";
import LeaveDesert from "./Objectives/LeaveDesert";
import OptionsInterrupt from "./Objectives/OptionsInterrupt";
import OrganizeInventory from "./Objectives/OrganizeInventory";
import PlantSeed from "./Objectives/PlantSeed";
import RecoverHealth from "./Objectives/RecoverHealth";
import RecoverHunger from "./Objectives/RecoverHunger";
import RecoverStamina from "./Objectives/RecoverStamina";
import RecoverThirst from "./Objectives/RecoverThirst";
import ReduceWeight from "./Objectives/ReduceWeight";
import RepairItem from "./Objectives/RepairItem";
import ReturnToBase from "./Objectives/ReturnToBase";
import { log, setLogger } from "./Utilities/Logger";

const tickSpeed = 333;

const baseDoodadDistance = 150;

export default class Tars extends Mod {

	private keyBind: number;

	private base: IBase;
	private inventory: IInventoryItems;

	private objective: IObjective | undefined;

	private interruptObjective: IObjective | undefined;
	private interruptsId: string;

	private tickTimeoutId: number | undefined;

	private navigation: Navigation;
	private navigationInitialized: boolean;

	public onInitialize(saveDataGlobal: any): any {
		this.keyBind = this.addBindable(this.getName(), { key: "KeyT" });

		this.addCommand("tars", () => {
			this.toggle();
		});

		Helpers.setPath(this.getPath());

		setLogger(this.getLog());
	}

	public onUninitialize(): any {
		this.onGameEnd();
	}

	////////////////////////////////////////////////
	// Hooks
	////////////////////////////////////////////////

	@HookMethod
	public onGameStart(): void {
		this.reset();
		this.navigation = getNavigation();
	}

	@HookMethod
	public onGameEnd(): void {
		this.disable();
		this.reset();
	}

	@HookMethod
	public onPlayerDeath(player: IPlayer): boolean | undefined {
		if (player.isLocalPlayer()) {
			this.objective = undefined;
			this.interruptObjective = undefined;
		}

		return undefined;
	}

	@HookMethod
	public onBindLoop(bindPressed: Bindable, api: BindCatcherApi): Bindable {
		if (api.wasPressed(this.keyBind) && !bindPressed) {
			this.toggle();
			bindPressed = this.keyBind;
		}

		return bindPressed;
	}

	@HookMethod
	public onTileUpdate(tile: ITile, x: number, y: number, z: number): void {
		if (this.navigationInitialized) {
			this.navigation.onTileUpdate(tile, TileHelpers.getType(tile), x, y, z);
		}
	}

	@HookMethod
	public postExecuteAction(player: IPlayer, actionType: ActionType, actionArgument: IActionArgument, actionResult: IActionResult): void {
		if (player !== localPlayer) {
			return;
		}

		Helpers.postExecuteAction(actionType);
	}

	@HookMethod
	public onMoveComplete(player: IPlayer) {
		if (player !== localPlayer) {
			return;
		}

		if (this.isEnabled() && Helpers.shouldUseMovementIntent()) {
			this.onTick(true);
		}
	}

	@HookMethod
	public getPlayerMovementIntent(player: IPlayer) {
		return (this.isEnabled() && Helpers.shouldUseMovementIntent()) ? Helpers.getMovementIntent() : undefined;
	}

	@HookMethod
	public processInput(player: IPlayer) {
		if (this.isEnabled() && Helpers.shouldUseMovementIntent() && !player.hasDelay()) {
			return Helpers.shouldProcessNextInput();
		}

		return undefined;
	}

	////////////////////////////////////////////////

	private reset() {
		this.base = {};
		this.inventory = {};
		this.objective = undefined;
		this.interruptObjective = undefined;
		this.navigationInitialized = false;
		deleteNavigation();
	}

	private async toggle() {
		log("Toggle");

		if (!this.navigationInitialized) {
			this.navigationInitialized = true;
			await this.navigation.updateAll();
		}

		this.objective = undefined;
		this.interruptObjective = undefined;

		Helpers.resetMovementIntent();

		if (this.tickTimeoutId === undefined) {
			await this.tick();

		} else {
			this.disable();
		}

		const str = `${this.tickTimeoutId !== undefined ? "Enabled" : "Disabled"}`;

		log(str);

		localPlayer.messages.type(MessageType.Good)
			.send(`[TARS] ${str}`);
	}

	private disable() {
		if (this.tickTimeoutId !== undefined) {
			clearTimeout(this.tickTimeoutId);
			this.tickTimeoutId = undefined;
		}
	}

	private isEnabled() {
		return this.tickTimeoutId !== undefined;
	}

	private async tick() {
		await this.onTick();

		this.tickTimeoutId = setTimeout(this.tick.bind(this), tickSpeed);
	}

	private async onTick(finishedMovement?: boolean) {
		if (localPlayer.isResting() || localPlayer.isMovingClientside || localPlayer.isGhost() || game.paused) {
			return;
		}

		/*if (multiplayer.isConnected()) {
			// assume the delay is off by 300ms
			if (game.absoluteTime < (localPlayer as any).nextProcessInput - 300) {
				return;
			}

		} else*/
		if (!finishedMovement && localPlayer.hasDelay()) {
			return;
		}

		Helpers.resetMovementIntent();
		Helpers.resetCachedObjects();
		Helpers.resetCachedPaths();

		this.analyzeInventory();
		this.analyzeBase();

		let result: IObjective[] | boolean;

		const interrupts = this.getInterrupts();
		const interruptsId = interrupts.map(i => i.getHashCode()).join(",");
		if (this.interruptsId !== interruptsId) {
			this.interruptsId = interruptsId;
			this.interruptObjective = undefined;
		}

		// console.log("interruptsId", this.interruptsId);
		// console.log("interruptObjective", this.interruptObjective ? this.interruptObjective.getHashCode() : undefined);

		if (this.interruptObjective) {
			log(`Working on interrupt ${this.interruptObjective.getHashCode()}`);

			result = await this.executeObjectives([this.interruptObjective]);
			if (result !== true) {
				// still working on it
				return;
			}

			this.interruptObjective = undefined;
		}

		if (interrupts.length > 0) {
			result = await this.executeObjectives(interrupts);
			if (result === true) {
				this.interruptObjective = undefined;

			} else if (result === false) {
				return;

			} else {
				// the first one is the active one
				// this is different from normal!

				// save the active objective
				this.interruptObjective = result.find(objective => !objective.shouldSaveChildObjectives()) || result[result.length - 1];

				// reset main objective
				this.objective = undefined;

				return;
			}
		}

		// console.log("this.objective", this.objective ? this.objective.getHashCode() : undefined);

		if (this.objective !== undefined) {
			// we have an objective we are working on
			log(`Working on ${this.objective.getHashCode()}`);

			result = await this.executeObjectives([this.objective]);
			if (result !== true) {
				// still working on it
				return;
			}
		}

		result = await this.executeObjectives(this.determineObjectives());
		if (result === true || result === false) {
			this.objective = undefined;

		} else {
			// save the active objective
			this.objective = result.find(objective => !objective.shouldSaveChildObjectives()) || result[result.length - 1];
		}
	}

	/**
	 * Execute objectives
	 * @param objectives Array of objectives
	 * @returns An objective (if it's still being worked on), True if all the objectives are completed, False if we cannot execute anymore objectives
	 */
	private async executeObjectives(objectives: IObjective[]): Promise<IObjective[] | boolean> {
		for (const objective of objectives) {
			if (this.hasDelay()) {
				return false;
			}

			const result = await this.executeObjective(objective);
			if (typeof (result) !== "boolean") {
				return result;
			}
		}

		return true;
	}

	/**
	 * Execute an objective
	 * @param objective Objective
	 * @returns An objective (if it's still being worked on), True if completed
	 */
	private async executeObjective(objective: IObjective | undefined): Promise<IObjective[] | boolean> {
		const chain: IObjective[] = [];

		while (objective !== undefined) {
			chain.push(objective);

			// log(`Execute objective: ${objective.getHashCode()}`);

			const newObjective = await objective.execute(this.base, this.inventory);
			if (newObjective === undefined) {
				// objective is still running
				return chain;
			}

			if (typeof (newObjective) === "number") {
				switch (newObjective) {
					case ObjectiveStatus.Complete:
						objective = undefined;
						break;

					default:
						log(`Invalid return for objective ${objective}. ${newObjective}`);
						objective = undefined;
						break;
				}

			} else {
				objective = newObjective;
			}
		}

		return true;
	}

	private hasDelay(): boolean {
		return localPlayer.hasDelay() || localPlayer.isResting() || localPlayer.isMovingClientside;
	}

	private determineObjectives(): IObjective[] {
		const chest = localPlayer.getEquippedItem(EquipType.Chest);
		const legs = localPlayer.getEquippedItem(EquipType.Legs);
		const belt = localPlayer.getEquippedItem(EquipType.Belt);
		const neck = localPlayer.getEquippedItem(EquipType.Neck);
		const back = localPlayer.getEquippedItem(EquipType.Back);
		const head = localPlayer.getEquippedItem(EquipType.Head);
		const feet = localPlayer.getEquippedItem(EquipType.Feet);
		const gloves = localPlayer.getEquippedItem(EquipType.Hands);

		const objectives: IObjective[] = [];

		if (this.base.campfire === undefined) {
			const inventoryItem = itemManager.getItemInInventoryByGroup(localPlayer, ItemTypeGroup.Campfire);
			if (inventoryItem !== undefined) {
				objectives.push(new BuildItem(inventoryItem));

			} else {
				objectives.push(new AcquireItemByGroup(ItemTypeGroup.Campfire));

			}
		}

		if (this.inventory.fireStarter === undefined) {
			objectives.push(new AcquireItemForAction(ActionType.StartFire));
		}

		if (this.inventory.fireKindling === undefined) {
			objectives.push(new AcquireItemByGroup(ItemTypeGroup.Kindling));
		}

		if (this.inventory.fireTinder === undefined) {
			objectives.push(new AcquireItemByGroup(ItemTypeGroup.Tinder));
		}

		if (this.inventory.sharpened === undefined) {
			objectives.push(new AcquireItemByGroup(ItemTypeGroup.Sharpened));
		}

		if (this.inventory.axe === undefined) {
			objectives.push(new AcquireItem(ItemType.StoneAxe));
		}

		if (chest === undefined || chest.type === ItemType.TatteredShirt) {
			objectives.push(new AcquireItem(ItemType.BarkTunic));
		}

		if (legs === undefined || legs.type === ItemType.TatteredPants) {
			objectives.push(new AcquireItem(ItemType.BarkLeggings));
		}

		if (this.base.waterStill === undefined) {
			const inventoryItem = itemManager.getItemInInventoryByGroup(localPlayer, ItemTypeGroup.WaterStill);
			if (inventoryItem !== undefined) {
				objectives.push(new BuildItem(inventoryItem));

			} else {
				objectives.push(new AcquireItemByGroup(ItemTypeGroup.WaterStill));
			}
		}

		let buildChest = true;
		if (this.base.chests !== undefined) {
			for (const c of this.base.chests) {
				if ((itemManager.computeContainerWeight(c as IContainer) / c.weightCapacity!) < 0.9) {
					buildChest = false;
					break;
				}
			}
		}

		if (buildChest) {
			const inventoryItem = itemManager.getItemInContainer(localPlayer.inventory, ItemType.WoodenChest);
			if (inventoryItem !== undefined) {
				objectives.push(new BuildItem(inventoryItem));

			} else {
				objectives.push(new AcquireItemForDoodad(DoodadType.WoodenChest));
			}
		}

		if (this.inventory.pickAxe === undefined) {
			objectives.push(new AcquireItem(ItemType.StonePickaxe));
		}

		if (this.inventory.hammer === undefined) {
			objectives.push(new AcquireItem(ItemType.StoneHammer));
		}

		const seeds = Helpers.getSeeds();
		if (seeds.length > 0) {
			objectives.push(new PlantSeed(seeds[0]));
		}

		if (this.inventory.shovel === undefined) {
			objectives.push(new AcquireItem(ItemType.StoneShovel));
		}

		if (this.base.kiln === undefined) {
			if (this.inventory.kiln !== undefined) {
				objectives.push(new BuildItem(this.inventory.kiln));

			} else {
				objectives.push(new AcquireItemForDoodad(DoodadTypeGroup.LitKiln));
			}
		}

		if (this.inventory.sword === undefined) {
			objectives.push(new AcquireItem(ItemType.WoodenSword));
		}

		const waitingForWater = localPlayer.getStat<IStat>(Stat.Thirst).value <= 10 && this.base.waterStill && this.base.waterStill.description()!.providesFire;

		const shouldUpgradeToLeather = !waitingForWater;
		if (shouldUpgradeToLeather) {
			/*
				Upgrade to leather
				Order is based on recipe level
			*/

			if (belt === undefined) {
				objectives.push(new AcquireItem(ItemType.LeatherBelt));
			}

			if (neck === undefined) {
				objectives.push(new AcquireItem(ItemType.LeatherGorget));
			}

			if (head === undefined) {
				objectives.push(new AcquireItem(ItemType.LeatherCap));
			}

			if (back === undefined) {
				objectives.push(new AcquireItem(ItemType.LeatherQuiver));
			}

			if (feet === undefined) {
				objectives.push(new AcquireItem(ItemType.LeatherBoots));
			}

			if (gloves === undefined) {
				objectives.push(new AcquireItem(ItemType.LeatherGloves));
			}

			if (legs && legs.type === ItemType.BarkLeggings) {
				objectives.push(new AcquireItem(ItemType.LeatherPants));
			}

			if (chest && chest.type === ItemType.BarkTunic) {
				objectives.push(new AcquireItem(ItemType.LeatherTunic));
			}

			if (legs && legs.type === ItemType.BarkLeggings) {
				objectives.push(new AcquireItem(ItemType.LeatherPants));
			}
		}

		/*
			Idle objectives
		*/

		if (this.inventory.waterContainer === undefined) {
			objectives.push(new AcquireWaterContainer());
		}

		if (localPlayer.getStat<IStat>(Stat.Health).value / localPlayer.getMaxHealth() < 0.9) {
			objectives.push(new RecoverHealth());
		}

		const hunger = localPlayer.getStat<IStatMax>(Stat.Hunger)!;
		if (hunger.value / hunger.max < 0.75) {
			objectives.push(new RecoverHunger());
		}

		objectives.push(new ReturnToBase());

		objectives.push(new OrganizeInventory(false));

		if (!game.isRealTimeMode()) {
			objectives.push(new Idle());
		}

		return objectives;
	}

	private getInterrupts(): IObjective[] {
		const interrupts: Array<IObjective | undefined> = [
			this.optionsInterrupt(),
			this.equipsInterrupt(),
			this.nearbyCreatureInterrupt(),
			this.staminaInterrupt(),
			this.healthInterrupt(),
			this.weightInterrupt(),
			this.leaveDesertInterrupt(),
			this.repairInterrupt(this.inventory.waterContainer),
			this.thirstInterrupt(),
			this.gatherFromCorpsesInterrupt(),
			this.hungerInterrupt(),
			this.repairsInterrupt()
		];

		return interrupts.filter(interrupt => interrupt !== undefined) as IObjective[];
	}

	private optionsInterrupt(): IObjective | undefined {
		return new OptionsInterrupt();
	}

	private equipsInterrupt(): IObjective | undefined {
		return this.handsEquipInterrupt(ActionType.Gather) || this.equipInterrupt(EquipType.Chest) || this.equipInterrupt(EquipType.Legs) || this.equipInterrupt(EquipType.Head) || this.equipInterrupt(EquipType.Belt) || this.equipInterrupt(EquipType.Feet) || this.equipInterrupt(EquipType.Hands) || this.equipInterrupt(EquipType.Neck) || this.equipInterrupt(EquipType.Back);
	}

	private equipInterrupt(equip: EquipType): IObjective | undefined {
		const item = localPlayer.getEquippedItem(equip);
		const bestEquipment = Helpers.getBestEquipment(equip);
		if (bestEquipment.length > 0) {
			const itemToEquip = bestEquipment[0];
			if (itemToEquip === item) {
				return;
			}

			if (item !== undefined) {
				return new Equip(item);
			}

			return new Equip(itemToEquip, equip);
		}
	}

	private handsEquipInterrupt(use: ActionType, preferredDamageType?: DamageType): IObjective | undefined {
		const objective = this.handEquipInterrupt(EquipType.LeftHand, use, preferredDamageType) || this.handEquipInterrupt(EquipType.RightHand, use, preferredDamageType);
		if (objective) {
			return objective;
		}

		const leftHandItem = localPlayer.getEquippedItem(EquipType.LeftHand);
		const rightHandItem = localPlayer.getEquippedItem(EquipType.RightHand);

		const leftHandEquipped = leftHandItem !== undefined;
		const rightHandEquipped = rightHandItem !== undefined;

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
				if (leftHandDamageTypeMatches !== localPlayer.options.leftHand) {
					ui.changeEquipmentOption(EquipType[EquipType.LeftHand]);
				}

				if (rightHandDamageTypeMatches !== localPlayer.options.rightHand) {
					ui.changeEquipmentOption(EquipType[EquipType.RightHand]);
				}

			} else if (leftHandEquipped || rightHandEquipped) {
				if (leftHandEquipped && !localPlayer.options.leftHand) {
					ui.changeEquipmentOption(EquipType[EquipType.LeftHand]);
				}

				if (rightHandEquipped && !localPlayer.options.rightHand) {
					ui.changeEquipmentOption(EquipType[EquipType.RightHand]);
				}

			} else {
				if (!localPlayer.options.leftHand) {
					ui.changeEquipmentOption(EquipType[EquipType.LeftHand]);
				}

				if (!localPlayer.options.rightHand) {
					ui.changeEquipmentOption(EquipType[EquipType.RightHand]);
				}
			}

		} else {
			if (leftHandEquipped && !localPlayer.options.leftHand) {
				ui.changeEquipmentOption(EquipType[EquipType.LeftHand]);
			}

			if (rightHandEquipped && !localPlayer.options.rightHand) {
				ui.changeEquipmentOption(EquipType[EquipType.RightHand]);
			}

			if (!localPlayer.options.leftHand && !localPlayer.options.rightHand) {
				ui.changeEquipmentOption(EquipType[EquipType.LeftHand]);
			}
		}
	}

	private handEquipInterrupt(equipType: EquipType, use: ActionType, preferredDamageType?: DamageType): IObjective | undefined {
		const equippedItem = localPlayer.getEquippedItem(equipType);
		if (equippedItem === undefined) {
			let possibleEquips = Helpers.getPossibleHandEquips(use, preferredDamageType, true);
			if (possibleEquips.length === 0) {
				// fall back to not caring about the damage type
				possibleEquips = Helpers.getPossibleHandEquips(use, undefined, true);
			}

			if (possibleEquips.length > 0) {
				return new Equip(possibleEquips[0], equipType);
			}

		} else {
			const description = equippedItem.description();
			if (!description || !description.use || description.use.indexOf(use) === -1) {
				return new Equip(equippedItem);
			}

			if ((preferredDamageType !== undefined && description.damageType !== undefined && (description.damageType & preferredDamageType) === 0)) {
				// the equipped item has the wrong damage type
				// can we replace it with something better
				const possibleEquips = Helpers.getPossibleHandEquips(use, preferredDamageType, true);
				if (possibleEquips.length > 0) {
					return new Equip(equippedItem);
				}
			}
		}
	}

	private thirstInterrupt(): IObjective | undefined {
		if (localPlayer.getStat<IStat>(Stat.Thirst).value > 10) {
			return;
		}

		return new RecoverThirst();
	}

	private staminaInterrupt(): IObjective | undefined {
		if (localPlayer.getStat<IStat>(Stat.Stamina).value > 15) {
			return;
		}

		log("Stamina");
		return new RecoverStamina();
	}

	private hungerInterrupt(): IObjective | undefined {
		if (localPlayer.getStat<IStat>(Stat.Hunger).value > 10) {
			return;
		}

		return new RecoverHunger();
	}

	private repairsInterrupt(): IObjective | undefined {
		if (this.inventory.hammer === undefined) {
			return;
		}

		return this.repairInterrupt(localPlayer.getEquippedItem(EquipType.LeftHand)) ||
			this.repairInterrupt(localPlayer.getEquippedItem(EquipType.Chest)) ||
			this.repairInterrupt(localPlayer.getEquippedItem(EquipType.Legs)) ||
			this.repairInterrupt(localPlayer.getEquippedItem(EquipType.Head)) ||
			this.repairInterrupt(localPlayer.getEquippedItem(EquipType.Belt)) ||
			this.repairInterrupt(localPlayer.getEquippedItem(EquipType.Feet)) ||
			this.repairInterrupt(localPlayer.getEquippedItem(EquipType.Neck)) ||
			this.repairInterrupt(localPlayer.getEquippedItem(EquipType.Hands)) ||
			this.repairInterrupt(localPlayer.getEquippedItem(EquipType.Back)) ||
			this.repairInterrupt(this.inventory.sharpened) ||
			this.repairInterrupt(this.inventory.fireStarter) ||
			this.repairInterrupt(this.inventory.fireStoker) ||
			this.repairInterrupt(this.inventory.fireKindling) ||
			this.repairInterrupt(this.inventory.hoe) ||
			this.repairInterrupt(this.inventory.axe) ||
			this.repairInterrupt(this.inventory.pickAxe) ||
			this.repairInterrupt(this.inventory.shovel) ||
			this.repairInterrupt(this.inventory.sword);
	}

	private repairInterrupt(item: IItem | undefined): IObjective | undefined {
		if (localPlayer.swimming || item === undefined || item.minDur === undefined || item.maxDur === undefined || item.minDur > 5 || item === this.inventory.hammer) {
			return;
		}

		if (item.minDur / item.maxDur >= 0.5) {
			return;
		}

		const description = item.description();
		if (!description || description.durability === undefined || description.repairable === false) {
			return;
		}

		log(`Repair ${game.getName(item)}`);
		return new RepairItem(item);
	}

	private nearbyCreatureInterrupt(): IObjective | undefined {
		for (const facingDirecton of Enums.values(Direction)) {
			const creature = this.checkNearbyCreature(facingDirecton);
			if (creature !== undefined) {
				log(`Defend against ${game.getName(creature)}`);
				return new DefendAgainstCreature(creature);
			}
		}
	}

	private checkNearbyCreature(direction: Direction): ICreature | undefined {
		if (direction !== Direction.None) {
			const point = game.directionToMovement(direction);
			const tile = game.getTile(localPlayer.x + point.x, localPlayer.y + point.y, localPlayer.z);
			if (tile && tile.creature && !tile.creature.isTamed()) {
				//  && (tile.creature.ai & AiType.Hostile) !== 0
				return tile.creature;
			}
		}
	}

	private gatherFromCorpsesInterrupt(): IObjective | undefined {
		const target = Helpers.findCorpse("gatherFromCorpsesInterrupt", corpse =>
			Vector2.squaredDistance(localPlayer, corpse) < 16 &&
			Helpers.getNearbyCreature(corpse) === undefined &&
			corpse.type !== CreatureType.Blood &&
			corpse.type !== CreatureType.WaterBlood);
		if (target) {
			return new CarveCorpse(game.getTileFromPoint(target).corpses![0]);
		}
	}

	private healthInterrupt(): IObjective | undefined {
		if (localPlayer.getStat<IStat>(Stat.Health).value >= 30 && !localPlayer.status.Bleeding) {
			return;
		}

		log("Heal");
		return new RecoverHealth();
	}

	private weightInterrupt(): IObjective | undefined {
		return new ReduceWeight();
	}

	private leaveDesertInterrupt(): IObjective | undefined {
		if (localPlayer.y < desertCutoff) {
			return;
		}

		return new LeaveDesert();
	}

	private analyzeInventory() {
		if (this.inventory.bed !== undefined && (!this.inventory.bed.isValid() || !itemManager.isContainableInContainer(this.inventory.bed, localPlayer.inventory))) {
			this.inventory.bed = undefined;
		}

		if (this.inventory.bed === undefined) {
			this.inventory.bed = itemManager.getItemInContainerByGroup(localPlayer.inventory, ItemTypeGroup.Bedding);

			if (this.inventory.bed !== undefined) {
				log(`Inventory bed - ${game.getName(this.inventory.bed)}`);
			}
		}

		if (this.inventory.waterContainer !== undefined && (!this.inventory.waterContainer.isValid() || !itemManager.isContainableInContainer(this.inventory.waterContainer, localPlayer.inventory))) {
			this.inventory.waterContainer = undefined;
		}

		if (this.inventory.waterContainer === undefined) {
			let waterContainers = Helpers.getInventoryItemsWithUse(ActionType.GatherWater);
			if (waterContainers.length === 0) {
				waterContainers = Helpers.getInventoryItemsWithUse(ActionType.DrinkItem).filter(item => item.type !== ItemType.PileOfSnow);
			}

			if (waterContainers.length > 0) {
				this.inventory.waterContainer = waterContainers[0];
			}

			if (this.inventory.waterContainer !== undefined) {
				log(`Inventory water container - ${game.getName(this.inventory.waterContainer)}`);
			}
		}

		if (this.inventory.sharpened !== undefined && (!this.inventory.sharpened.isValid() || !itemManager.isContainableInContainer(this.inventory.sharpened, localPlayer.inventory))) {
			this.inventory.sharpened = undefined;
		}

		if (this.inventory.sharpened === undefined) {
			this.inventory.sharpened = itemManager.getItemInContainerByGroup(localPlayer.inventory, ItemTypeGroup.Sharpened);

			if (this.inventory.sharpened !== undefined) {
				log(`Inventory sharpened - ${game.getName(this.inventory.sharpened)}`);
			}
		}

		if (this.inventory.fireStarter !== undefined && (!this.inventory.fireStarter.isValid() || !itemManager.isContainableInContainer(this.inventory.fireStarter, localPlayer.inventory))) {
			this.inventory.fireStarter = undefined;
		}

		if (this.inventory.fireStarter === undefined) {
			this.inventory.fireStarter = itemManager.getItemInContainer(localPlayer.inventory, ItemType.HandDrill) || itemManager.getItemInContainer(localPlayer.inventory, ItemType.BowDrill) || itemManager.getItemInContainer(localPlayer.inventory, ItemType.FirePlough);

			if (this.inventory.fireStarter !== undefined) {
				log(`Inventory fire starter - ${game.getName(this.inventory.fireStarter)}`);
			}
		}

		if (this.inventory.fireStoker !== undefined && (!this.inventory.fireStoker.isValid() || !itemManager.isContainableInContainer(this.inventory.fireStoker, localPlayer.inventory))) {
			this.inventory.fireStoker = undefined;
		}

		if (this.inventory.fireStoker === undefined) {
			const fireStokers = Helpers.getInventoryItemsWithUse(ActionType.StokeFire);
			if (fireStokers.length > 0) {
				this.inventory.fireStoker = fireStokers[0];
			}

			if (this.inventory.fireStoker !== undefined) {
				log(`Inventory fire stoker - ${game.getName(this.inventory.fireStoker)}`);
			}
		}

		if (this.inventory.fireKindling !== undefined && (!this.inventory.fireKindling.isValid() || !itemManager.isContainableInContainer(this.inventory.fireKindling, localPlayer.inventory))) {
			this.inventory.fireKindling = undefined;
		}

		if (this.inventory.fireKindling === undefined) {
			this.inventory.fireKindling = itemManager.getItemInContainerByGroup(localPlayer.inventory, ItemTypeGroup.Kindling);

			if (this.inventory.fireKindling !== undefined) {
				log(`Inventory fire kindling - ${game.getName(this.inventory.fireKindling)}`);
			}
		}

		if (this.inventory.fireTinder !== undefined && (!this.inventory.fireTinder.isValid() || !itemManager.isContainableInContainer(this.inventory.fireTinder, localPlayer.inventory))) {
			this.inventory.fireTinder = undefined;
		}

		if (this.inventory.fireTinder === undefined) {
			this.inventory.fireTinder = itemManager.getItemInContainerByGroup(localPlayer.inventory, ItemTypeGroup.Tinder);

			if (this.inventory.fireTinder !== undefined) {
				log(`Inventory fire tinder - ${game.getName(this.inventory.fireTinder)}`);
			}
		}

		if (this.inventory.hoe !== undefined && (!this.inventory.hoe.isValid() || !itemManager.isContainableInContainer(this.inventory.hoe, localPlayer.inventory))) {
			this.inventory.hoe = undefined;
		}

		if (this.inventory.hoe === undefined) {
			const hoes = Helpers.getInventoryItemsWithUse(ActionType.Till);
			if (hoes.length > 0) {
				this.inventory.hoe = hoes[0];
			}

			if (this.inventory.hoe !== undefined) {
				log(`Inventory hoe - ${game.getName(this.inventory.hoe)}`);
			}
		}

		if (this.inventory.hammer !== undefined && (!this.inventory.hammer.isValid() || !itemManager.isContainableInContainer(this.inventory.hammer, localPlayer.inventory))) {
			this.inventory.hammer = undefined;
		}

		if (this.inventory.hammer === undefined) {
			this.inventory.hammer = itemManager.getItemInContainerByGroup(localPlayer.inventory, ItemTypeGroup.Hammer);

			if (this.inventory.hammer !== undefined) {
				log(`Inventory hammer - ${game.getName(this.inventory.hammer)}`);
			}
		}

		if (this.inventory.axe !== undefined && (!this.inventory.axe.isValid() || !itemManager.isContainableInContainer(this.inventory.axe, localPlayer.inventory))) {
			this.inventory.axe = undefined;
		}

		if (this.inventory.axe === undefined) {
			this.inventory.axe = itemManager.getItemInContainer(localPlayer.inventory, ItemType.WroughtIronDoubleAxe) ||
				itemManager.getItemInContainer(localPlayer.inventory, ItemType.WroughtIronAxe) ||
				itemManager.getItemInContainer(localPlayer.inventory, ItemType.IronDoubleAxe) ||
				itemManager.getItemInContainer(localPlayer.inventory, ItemType.IronAxe) ||
				itemManager.getItemInContainer(localPlayer.inventory, ItemType.CopperDoubleAxe) ||
				itemManager.getItemInContainer(localPlayer.inventory, ItemType.CopperAxe) ||
				itemManager.getItemInContainer(localPlayer.inventory, ItemType.StoneAxe);

			if (this.inventory.axe !== undefined) {
				log(`Inventory axe - ${game.getName(this.inventory.axe)}`);
			}
		}

		if (this.inventory.pickAxe !== undefined && (!this.inventory.pickAxe.isValid() || !itemManager.isContainableInContainer(this.inventory.pickAxe, localPlayer.inventory))) {
			this.inventory.pickAxe = undefined;
		}

		if (this.inventory.pickAxe === undefined) {
			this.inventory.pickAxe = itemManager.getItemInContainer(localPlayer.inventory, ItemType.WroughtIronPickaxe) ||
				itemManager.getItemInContainer(localPlayer.inventory, ItemType.IronPickaxe) ||
				itemManager.getItemInContainer(localPlayer.inventory, ItemType.CopperPickaxe) ||
				itemManager.getItemInContainer(localPlayer.inventory, ItemType.StonePickaxe);

			if (this.inventory.pickAxe !== undefined) {
				log(`Inventory pickaxe - ${game.getName(this.inventory.pickAxe)}`);
			}
		}

		if (this.inventory.shovel !== undefined && (!this.inventory.shovel.isValid() || !itemManager.isContainableInContainer(this.inventory.shovel, localPlayer.inventory))) {
			this.inventory.shovel = undefined;
		}

		if (this.inventory.shovel === undefined) {
			const shovels = Helpers.getInventoryItemsWithUse(ActionType.Dig);
			if (shovels.length > 0) {
				this.inventory.shovel = shovels[0];
			}

			if (this.inventory.shovel !== undefined) {
				log(`Inventory shovel - ${game.getName(this.inventory.shovel)}`);
			}
		}

		// base items
		if (this.inventory.waterStill !== undefined && (!this.inventory.waterStill.isValid() || !itemManager.isContainableInContainer(this.inventory.waterStill, localPlayer.inventory))) {
			this.inventory.waterStill = undefined;
		}

		if (this.inventory.waterStill === undefined) {
			this.inventory.waterStill = itemManager.getItemInContainerByGroup(localPlayer.inventory, ItemTypeGroup.WaterStill);

			if (this.inventory.waterStill !== undefined) {
				log(`Inventory waterstill - ${game.getName(this.inventory.waterStill)}`);
			}
		}

		if (this.inventory.campfire !== undefined && (!this.inventory.campfire.isValid() || !itemManager.isContainableInContainer(this.inventory.campfire, localPlayer.inventory))) {
			this.inventory.campfire = undefined;
		}

		if (this.inventory.campfire === undefined) {
			this.inventory.campfire = itemManager.getItemInContainerByGroup(localPlayer.inventory, ItemTypeGroup.Campfire);

			if (this.inventory.campfire !== undefined) {
				log(`Inventory campfire - ${game.getName(this.inventory.campfire)}`);
			}
		}

		if (this.inventory.kiln !== undefined && (!this.inventory.kiln.isValid() || !itemManager.isContainableInContainer(this.inventory.kiln, localPlayer.inventory))) {
			this.inventory.kiln = undefined;
		}

		if (this.inventory.kiln === undefined) {
			this.inventory.kiln = itemManager.getItemInContainerByGroup(localPlayer.inventory, ItemTypeGroup.Kiln);

			if (this.inventory.kiln !== undefined) {
				log(`Inventory kiln - ${game.getName(this.inventory.kiln)}`);
			}
		}

		if (this.inventory.chests !== undefined) {
			this.inventory.chests = this.inventory.chests.filter(c => c.isValid() && itemManager.isContainableInContainer(c, localPlayer.inventory));
		}

		const chests = itemManager.getItemsInContainerByType(localPlayer.inventory, ItemType.WoodenChest, true, false);
		if (this.inventory.chests === undefined || this.inventory.chests.length !== chests.length) {
			this.inventory.chests = chests;

			if (this.inventory.chests.length > 0) {
				log(`Inventory chests - ${this.inventory.chests.map(c => game.getName(c)).join(", ")}`);
			}
		}

		if (this.inventory.sword !== undefined && (!this.inventory.sword.isValid() || !itemManager.isContainableInContainer(this.inventory.sword, localPlayer.inventory))) {
			this.inventory.sword = undefined;
		}

		if (this.inventory.sword === undefined) {
			this.inventory.sword = itemManager.getItemInContainer(localPlayer.inventory, ItemType.WroughtIronSword) ||
				itemManager.getItemInContainer(localPlayer.inventory, ItemType.IronSword) ||
				itemManager.getItemInContainer(localPlayer.inventory, ItemType.GoldenSword) ||
				itemManager.getItemInContainer(localPlayer.inventory, ItemType.CopperSword) ||
				itemManager.getItemInContainer(localPlayer.inventory, ItemType.WoodenSword);

			if (this.inventory.sword !== undefined) {
				log(`Inventory sword - ${game.getName(this.inventory.sword)}`);
			}
		}
	}

	private analyzeBase() {
		if (this.base.campfire !== undefined && !this.base.campfire.isValid()) {
			this.base.campfire = undefined;
		}

		if (this.base.campfire === undefined) {
			const targets = Helpers.findDoodads("Campfire", doodad => {
				const description = doodad.description();
				if (description) {
					if (description.group === DoodadTypeGroup.LitCampfire) {
						return true;
					}

					if (description.lit !== undefined) {
						const litDescription = Doodads[description.lit];
						if (litDescription && litDescription.group === DoodadTypeGroup.LitCampfire) {
							return true;
						}
					}
				}

				return false;
			});

			if (targets.length > 0) {
				const target = targets[0];
				if (Vector2.squaredDistance(localPlayer, target) < baseDoodadDistance) {
					this.base.campfire = target;

					if (this.base.campfire !== undefined) {
						log(`Base campfire - ${game.getName(this.base.campfire)} (distance: ${Vector2.squaredDistance(localPlayer, target)})`);
					}
				}
			}
		}

		if (this.base.waterStill !== undefined && !this.base.waterStill.isValid()) {
			this.base.waterStill = undefined;
		}

		if (this.base.waterStill === undefined) {
			const targets = Helpers.findDoodads("WaterStill", doodad => {
				const description = doodad.description();
				if (description) {
					if (description.group === DoodadTypeGroup.LitWaterStill) {
						return true;
					}

					if (description.lit !== undefined) {
						const litDescription = Doodads[description.lit];
						if (litDescription && litDescription.group === DoodadTypeGroup.LitWaterStill) {
							return true;
						}
					}
				}

				return false;
			});

			if (targets.length > 0) {
				const target = targets[0];
				if (Vector2.squaredDistance(localPlayer, target) < baseDoodadDistance) {
					this.base.waterStill = target;

					if (this.base.waterStill !== undefined) {
						log(`Base waterstill - ${game.getName(this.base.waterStill)} (distance: ${Vector2.squaredDistance(localPlayer, target)})`);
					}
				}
			}
		}

		if (this.base.kiln !== undefined && !this.base.kiln.isValid()) {
			this.base.kiln = undefined;
		}

		if (this.base.kiln === undefined) {
			const targets = Helpers.findDoodads("Kiln", doodad => {
				const description = doodad.description();
				if (description) {
					if (description.group === DoodadTypeGroup.LitKiln) {
						return true;
					}

					if (description.lit !== undefined) {
						const litDescription = Doodads[description.lit];
						if (litDescription && litDescription.group === DoodadTypeGroup.LitKiln) {
							return true;
						}
					}
				}

				return false;
			});

			if (targets.length > 0) {
				const target = targets[0];
				if (Vector2.squaredDistance(localPlayer, target) < baseDoodadDistance) {
					this.base.kiln = target;

					if (this.base.kiln !== undefined) {
						log(`Base kiln - ${game.getName(this.base.kiln)} (distance: ${Vector2.squaredDistance(localPlayer, target)})`);
					}
				}
			}
		}

		if (this.base.chests === undefined) {
			this.base.chests = [];
		}

		let i = 0;
		while (true) {
			const targetChest = Helpers.findDoodad(`Chest${i}`, doodad => {
				const container = doodad as IContainer;
				if (container.weightCapacity && container.containedItems) {
					return this.base.chests!.indexOf(doodad) === -1;
				}

				return false;
			});

			i++;

			if (targetChest && Vector2.squaredDistance(localPlayer, targetChest) < baseDoodadDistance) {
				if (!this.base.chests) {
					this.base.chests = [];
				}

				this.base.chests.push(targetChest);

				log(`Base chest - ${game.getName(targetChest)} (distance: ${Vector2.squaredDistance(localPlayer, targetChest)})`);

			} else {
				break;
			}
		}
	}
}
