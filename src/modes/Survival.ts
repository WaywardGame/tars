import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import { AiType } from "game/entity/IEntity";
import { EquipType } from "game/entity/IHuman";
import type { IStat, IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import { TurnMode } from "game/IGame";
import type { IContainer } from "game/item/IItem";
import { ItemType, ItemTypeGroup } from "game/item/IItem";
import type Item from "game/item/Item";
import { CreatureType } from "game/entity/creature/ICreature";

import type Context from "../core/context/Context";
import ContextState from "../core/context/ContextState";
import { ContextDataType, MovingToNewIslandState } from "../core/context/IContext";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import AcquireFood from "../objectives/acquire/item/AcquireFood";
import AcquireItem from "../objectives/acquire/item/AcquireItem";
import AcquireItemByGroup from "../objectives/acquire/item/AcquireItemByGroup";
import AcquireItemByTypes from "../objectives/acquire/item/AcquireItemByTypes";
import AcquireItemForAction from "../objectives/acquire/item/AcquireItemForAction";
import AcquireItemForDoodad from "../objectives/acquire/item/AcquireItemForDoodad";
import AcquireWaterContainer from "../objectives/acquire/item/specific/AcquireWaterContainer";
import AnalyzeBase from "../objectives/analyze/AnalyzeBase";
import AnalyzeInventory from "../objectives/analyze/AnalyzeInventory";
import ExecuteAction from "../objectives/core/ExecuteAction";
import Lambda from "../objectives/core/Lambda";
import Restart from "../objectives/core/Restart";
import GatherWater from "../objectives/gather/GatherWater";
import BuildItem from "../objectives/other/item/BuildItem";
import EquipItem from "../objectives/other/item/EquipItem";
import Idle from "../objectives/other/Idle";
import ReinforceItem from "../objectives/other/item/ReinforceItem";
import ReturnToBase from "../objectives/other/ReturnToBase";
import StartWaterStillDesalination from "../objectives/other/doodad/StartWaterStillDesalination";
import UpgradeInventoryItem from "../objectives/other/UpgradeInventoryItem";
import RecoverHealth from "../objectives/recover/RecoverHealth";
import RecoverHunger from "../objectives/recover/RecoverHunger";
import DrainSwamp from "../objectives/utility/DrainSwamp";
import MoveToLand from "../objectives/utility/moveTo/MoveToLand";
import MoveToNewIsland from "../objectives/utility/moveTo/MoveToNewIsland";
import OrganizeBase from "../objectives/utility/OrganizeBase";
import OrganizeInventory from "../objectives/utility/OrganizeInventory";
import AcquireUseOrbOfInfluence from "../objectives/acquire/item/specific/AcquireUseOrbOfInfluence";
import CheckDecayingItems from "../objectives/other/item/CheckDecayingItems";
import HuntCreatures from "../objectives/other/creature/HuntCreatures";
import PlantSeeds from "../objectives/utility/PlantSeeds";
import GatherWaters from "../objectives/gather/GatherWaters";
import CheckSpecialItems from "../objectives/other/item/CheckSpecialItems";
import type { ITarsMode } from "../core/mode/IMode";
import type { IInventoryItems } from "../core/ITars";
import { inventoryItemInfo } from "../core/ITars";
import { getTarsSaveData } from "../ITarsMod";
import { getCommonInitialObjectives } from "./CommonInitialObjectives";
import StartSolarStill from "../objectives/other/doodad/StartSolarStill";

/**
 * Survival mode
 */
export class SurvivalMode implements ITarsMode {

	private finished: (success: boolean) => void;

	public async initialize(_: Context, finished: (success: boolean) => void) {
		this.finished = finished;
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		const chest = context.human.getEquippedItem(EquipType.Chest);
		const legs = context.human.getEquippedItem(EquipType.Legs);
		const belt = context.human.getEquippedItem(EquipType.Belt);
		const neck = context.human.getEquippedItem(EquipType.Neck);
		const back = context.human.getEquippedItem(EquipType.Back);
		const head = context.human.getEquippedItem(EquipType.Head);
		const feet = context.human.getEquippedItem(EquipType.Feet);
		const hands = context.human.getEquippedItem(EquipType.Hands);

		const objectives: Array<IObjective | IObjective[]> = [];

		const moveToNewIslandState = context.getDataOrDefault<MovingToNewIslandState>(ContextDataType.MovingToNewIsland, MovingToNewIslandState.None);

		if (moveToNewIslandState === MovingToNewIslandState.Ready) {
			objectives.push(new MoveToNewIsland());
			return objectives;
		}

		if (context.inventory.sailBoat && context.human.island.items.isContainableInContainer(context.inventory.sailBoat, context.human.inventory)) {
			// don't carry the sail boat around if we don't have a base - we likely just moved to a new island
			objectives.push([
				new MoveToLand(),
				new ExecuteAction(ActionType.Drop, (context, action) => {
					action.execute(context.actionExecutor, context.inventory.sailBoat!);
					return ObjectiveResult.Complete;
				}).setStatus("Dropping sailboat"),
				new AnalyzeInventory(),
			]);
		}

		objectives.push(new CheckSpecialItems());

		objectives.push(...await getCommonInitialObjectives(context));

		if (context.utilities.base.shouldBuildWaterStills(context) && context.base.waterStill.length === 0 && context.inventory.waterStill === undefined) {
			objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.LitWaterStill), new BuildItem(), new AnalyzeBase()]);
		}

		let acquireChest = true;

		if (context.base.buildAnotherChest) {
			// build another chest if we're near the base
			acquireChest = context.utilities.base.isNearBase(context);

		} else if (context.base.chest.length > 0) {
			for (const c of context.base.chest) {
				if ((context.human.island.items.computeContainerWeight(c as IContainer) / context.human.island.items.getWeightCapacity(c)!) < 0.9) {
					acquireChest = false;
					break;
				}
			}
		}

		if (acquireChest && context.inventory.chest === undefined) {
			// mark that we should build a chest (memory)
			// we need to do this to prevent a loop
			// if we take items out of a chest to build another chest,
			// the weight capacity could go back under the threshold. and then it wouldn't want to build another chest
			// this is reset to false in baseInfo.onAdd
			context.base.buildAnotherChest = true;

			objectives.push([new AcquireItemForDoodad(DoodadType.WoodenChest), new BuildItem(), new AnalyzeBase()]);
		}

		if (context.inventory.hammer === undefined) {
			objectives.push([new AcquireItem(ItemType.StoneHammer), new AnalyzeInventory()]);
		}

		if (context.inventory.tongs === undefined) {
			objectives.push([new AcquireItemByGroup(ItemTypeGroup.Tongs), new AnalyzeInventory()]);
		}

		if (context.utilities.base.isNearBase(context)) {
			// ensure solar stills are solar stilling
			for (const solarStill of context.base.solarStill) {
				objectives.push(new StartSolarStill(solarStill));
			}

			// ensure water stills are water stilling
			for (const waterStill of context.base.waterStill) {
				objectives.push(new StartWaterStillDesalination(waterStill));
			}

			objectives.push(new PlantSeeds());

			objectives.push(new CheckDecayingItems());
		}

		if (context.base.kiln.length === 0 && context.inventory.kiln === undefined) {
			objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.LitKiln), new BuildItem(), new AnalyzeBase()]);
		}

		if (context.inventory.heal === undefined) {
			objectives.push([new AcquireItemForAction(ActionType.Heal), new AnalyzeInventory()]);
		}

		const waitingForWater = context.human.stat.get<IStat>(Stat.Thirst).value <= context.utilities.player.getRecoverThreshold(context, Stat.Thirst) &&
			context.base.waterStill.length > 0 && context.base.waterStill[0].description()!.providesFire;

		const shouldUpgradeToLeather = !waitingForWater;
		if (shouldUpgradeToLeather) {
			/*
				Upgrade to leather
				Order is based on recipe level
			*/

			if (belt === undefined) {
				objectives.push([new AcquireItem(ItemType.LeatherBelt), new AnalyzeInventory(), new EquipItem(EquipType.Belt)]);
			}

			if (neck === undefined) {
				objectives.push([new AcquireItem(ItemType.LeatherGorget), new AnalyzeInventory(), new EquipItem(EquipType.Neck)]);
			}

			if (head === undefined) {
				objectives.push([new AcquireItem(ItemType.LeatherCap), new AnalyzeInventory(), new EquipItem(EquipType.Head)]);
			}

			if (back === undefined) {
				objectives.push([new AcquireItem(ItemType.LeatherQuiver), new AnalyzeInventory(), new EquipItem(EquipType.Back)]);
			}

			if (feet === undefined) {
				objectives.push([new AcquireItem(ItemType.LeatherBoots), new AnalyzeInventory(), new EquipItem(EquipType.Feet)]);
			}

			if (hands === undefined) {
				objectives.push([new AcquireItem(ItemType.LeatherGloves), new AnalyzeInventory(), new EquipItem(EquipType.Hands)]);
			}

			if (legs && legs.type === ItemType.BarkLeggings) {
				objectives.push([new AcquireItem(ItemType.LeatherPants), new AnalyzeInventory(), new EquipItem(EquipType.Legs)]);
			}

			if (chest && chest.type === ItemType.BarkTunic) {
				objectives.push([new AcquireItem(ItemType.LeatherTunic), new AnalyzeInventory(), new EquipItem(EquipType.Chest)]);
			}
		}

		/*
			Extra objectives
		*/

		if (context.options.survivalUseOrbsOfInfluence) {
			objectives.push(new AcquireUseOrbOfInfluence());
		}

		if (context.base.well.length === 0 && context.inventory.well === undefined && context.base.availableUnlimitedWellLocation !== undefined) {
			// todo: only build a well if we find a good tile?
			objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.Well), new BuildItem(), new AnalyzeBase()]);
		}

		if (context.base.furnace.length === 0 && context.inventory.furnace === undefined) {
			objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.LitFurnace), new BuildItem(), new AnalyzeBase()]);
		}

		if (context.base.anvil.length === 0 && context.inventory.anvil === undefined) {
			objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.Anvil), new BuildItem(), new AnalyzeBase()]);
		}

		if (context.inventory.waterContainer === undefined) {
			objectives.push([new AcquireWaterContainer(), new AnalyzeInventory()]);
		}

		// run a few extra things before running upgrade objectives if we're near a base 
		if (context.utilities.base.isNearBase(context)) {
			// build a second water still
			if (context.utilities.base.shouldBuildWaterStills(context) && context.base.waterStill.length < 2) {
				objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.LitWaterStill), new BuildItem(), new AnalyzeBase()]);
			}

			// carry food with you
			if (context.inventory.food === undefined) {
				objectives.push([new AcquireFood(), new AnalyzeInventory()]);
			}

			// carry a bandage with you
			if (context.inventory.bandage === undefined) {
				objectives.push([new AcquireItemByTypes(inventoryItemInfo.bandage.itemTypes as ItemType[]), new AnalyzeInventory()]);
			}

			// carry drinkable water with you
			const drinkableWaterContainers: Item[] = [];
			const availableWaterContainers: Item[] = [];

			if (context.inventory.waterContainer !== undefined) {
				for (const waterContainer of context.inventory.waterContainer) {
					if (context.utilities.item.isSafeToDrinkItem(waterContainer)) {
						drinkableWaterContainers.push(waterContainer);
					} else {
						availableWaterContainers.push(waterContainer);
					}
				}

				if (availableWaterContainers.length > 0) {
					// we are looking for something drinkable
					// if there is a well, starting the water still will use it
					objectives.push(new GatherWaters(availableWaterContainers, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true }));
				}
			}

			if (moveToNewIslandState === MovingToNewIslandState.None) {
				if (context.options.survivalClearSwamps) {
					// remove swamp tiles near the base
					const swampTiles = context.utilities.base.getSwampTilesNearBase(context);
					if (swampTiles.length > 0) {
						const boglings = context.utilities.base.getNonTamedCreaturesNearBase(context)
							.filter(creature => creature.type === CreatureType.Bogling);
						if (boglings.length > 0) {
							objectives.push(new HuntCreatures(boglings));
						}

						objectives.push(new DrainSwamp(swampTiles));
					}
				}

				if (context.options.survivalOrganizeBase) {
					// cleanup base if theres items laying around everywhere
					const tiles = context.utilities.base.getTilesWithItemsNearBase(context);
					if (tiles.totalCount > 20) {
						objectives.push(new OrganizeBase(tiles.tiles));
					}
				}
			}

			if (drinkableWaterContainers.length < 2 && availableWaterContainers.length > 0) {
				// we are trying to gather water. wait before moving on to upgrade objectives
				objectives.push(new GatherWaters(availableWaterContainers, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWater: true }));
			}
		}

		// keep existing equipment in good shape
		if (context.inventory.equipSword) {
			objectives.push(new ReinforceItem(context.inventory.equipSword, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		if (context.inventory.equipShield) {
			objectives.push(new ReinforceItem(context.inventory.equipShield, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		// go on a killing spree once you have a good sword and shield
		if (context.utilities.base.isNearBase(context)) {
			const creatures = context.utilities.base.getNonTamedCreaturesNearBase(context)
				.filter(creature => creature.hasAi(AiType.Hostile) || creature.hasAi(AiType.Hidden));
			if (creatures.length > 0) {
				objectives.push(new HuntCreatures(creatures));
			}
		}

		if (context.inventory.equipBelt) {
			objectives.push(new ReinforceItem(context.inventory.equipBelt, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		if (context.inventory.equipNeck) {
			objectives.push(new ReinforceItem(context.inventory.equipNeck, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		if (context.inventory.equipFeet) {
			objectives.push(new ReinforceItem(context.inventory.equipFeet, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		if (context.inventory.equipHands) {
			objectives.push(new ReinforceItem(context.inventory.equipHands, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		if (context.inventory.equipLegs) {
			objectives.push(new ReinforceItem(context.inventory.equipLegs, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		if (context.inventory.equipChest) {
			objectives.push(new ReinforceItem(context.inventory.equipChest, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		if (context.inventory.axe) {
			objectives.push(new ReinforceItem(context.inventory.axe, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		if (context.inventory.pickAxe) {
			objectives.push(new ReinforceItem(context.inventory.pickAxe, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		if (context.inventory.hammer) {
			objectives.push(new ReinforceItem(context.inventory.hammer, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		if (context.inventory.shovel) {
			objectives.push(new ReinforceItem(context.inventory.shovel, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		if (context.inventory.hoe) {
			objectives.push(new ReinforceItem(context.inventory.hoe, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		if (context.inventory.tongs) {
			objectives.push(new ReinforceItem(context.inventory.tongs, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		/*
			Upgrade objectives
		*/

		this.addUpgradeItemObjectives(context, objectives, "equipSword", new Set([ItemType.WoodenSword, ItemType.TinSword]));
		this.addUpgradeItemObjectives(context, objectives, "equipShield", new Set([ItemType.WoodenShield, ItemType.TinShield]));
		this.addUpgradeItemObjectives(context, objectives, "equipBelt", new Set([ItemType.LeatherBelt]));
		this.addUpgradeItemObjectives(context, objectives, "equipNeck", new Set([ItemType.LeatherGorget, ItemType.TinBevor]));
		this.addUpgradeItemObjectives(context, objectives, "equipHead", new Set([ItemType.LeatherCap, ItemType.TinHelmet, ItemType.PirateHat]));
		this.addUpgradeItemObjectives(context, objectives, "equipFeet", new Set([ItemType.LeatherBoots, ItemType.TinFootgear]));
		this.addUpgradeItemObjectives(context, objectives, "equipHands", new Set([ItemType.LeatherGloves, ItemType.TinGloves]));
		this.addUpgradeItemObjectives(context, objectives, "equipLegs", new Set([ItemType.LeatherPants, ItemType.TinChausses]));
		this.addUpgradeItemObjectives(context, objectives, "equipChest", new Set([ItemType.LeatherTunic, ItemType.TinChest]));
		this.addUpgradeItemObjectives(context, objectives, "axe", new Set([ItemType.StoneAxe, ItemType.TinAxe]));
		this.addUpgradeItemObjectives(context, objectives, "pickAxe", new Set([ItemType.StonePickaxe, ItemType.TinPickaxe]));
		this.addUpgradeItemObjectives(context, objectives, "shovel", new Set([ItemType.StoneShovel, ItemType.TinShovel]));
		this.addUpgradeItemObjectives(context, objectives, "hammer", new Set([ItemType.StoneHammer, ItemType.TinHammer]));
		this.addUpgradeItemObjectives(context, objectives, "hoe", new Set([ItemType.StoneHoe, ItemType.TinHoe]));

		// extra upgrades
		// this.addUpgradeItemObjectives(context, objectives, "equipHead", ItemType.PirateHat);

		// this.addUpgradeItemObjectives(context, objectives, "equipBelt", ItemType.ScaleBelt);
		// this.addUpgradeItemObjectives(context, objectives, "equipNeck", ItemType.ScaleBevor);
		// this.addUpgradeItemObjectives(context, objectives, "equipFeet", ItemType.ScaleBoots);
		// this.addUpgradeItemObjectives(context, objectives, "equipHands", ItemType.ScaleGloves);

		/*
			End game objectives
		*/

		if (context.options.survivalExploreIslands && !multiplayer.isConnected()) {
			// move to a new island
			const needWaterItems = context.inventory.waterContainer === undefined || context.inventory.waterContainer.filter(item => context.utilities.item.isSafeToDrinkItem(item)).length < 2;
			const needFoodItems = context.inventory.food === undefined || context.inventory.food.length < 2;

			const health = context.human.stat.get<IStatMax>(Stat.Health);
			const hunger = context.human.stat.get<IStatMax>(Stat.Hunger);
			const needHealthRecovery = health.value / health.max < 0.9;
			const needHungerRecovery = hunger.value / hunger.max < 0.7;

			const isPreparing = needWaterItems || needFoodItems || needHealthRecovery || needHungerRecovery;

			switch (moveToNewIslandState) {
				case MovingToNewIslandState.None:
					objectives.push(new Lambda(async () => {
						const initialState = new ContextState();
						initialState.set(ContextDataType.MovingToNewIsland, MovingToNewIslandState.Preparing);
						context.setInitialState(initialState);
						return ObjectiveResult.Complete;
					}));

				case MovingToNewIslandState.Preparing:
					// make a sail boat

					// it's possible theres a sailboat at the time this is checked, but it's actually dropped after
					if (!context.inventory.sailBoat) {
						objectives.push([new AcquireItem(ItemType.Sailboat), new AnalyzeInventory()]);

						if (isPreparing) {
							// this lets TARS drop the sailboat until we're ready
							objectives.push(new Restart());
						}
					}

					if (needHealthRecovery) {
						objectives.push(new RecoverHealth(false));
					}

					if (needHungerRecovery) {
						objectives.push(new RecoverHunger(false, true));
					}

					// stock up on water
					if (needWaterItems) {
						const availableWaterContainers = context.inventory.waterContainer?.filter(item => !context.utilities.item.isSafeToDrinkItem(item));
						if (availableWaterContainers && availableWaterContainers.length > 0) {
							// we are looking for something drinkable
							// if there is a well, starting the water still will use it
							objectives.push(new GatherWaters(availableWaterContainers, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWater: true }));

						} else {
							// get a new water container
							objectives.push(new AcquireWaterContainer());
							objectives.push(new GatherWater(undefined, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWater: true }));
						}
					}

					// stock up on food
					if (needFoodItems) {
						objectives.push([new AcquireFood(), new AnalyzeInventory()]);
					}

					objectives.push(new Lambda(async () => {
						const initialState = new ContextState();
						initialState.set(ContextDataType.MovingToNewIsland, MovingToNewIslandState.Ready);
						context.setInitialState(initialState);
						return ObjectiveResult.Complete;
					}));
			}

			// restart now. MovingToNewIslandState.Ready will be handled at the top
			objectives.push(new Restart());

		} else {
			const health = context.human.stat.get<IStatMax>(Stat.Health);
			if (health.value / health.max < 0.9) {
				objectives.push(new RecoverHealth(false));
			}

			const hunger = context.human.stat.get<IStatMax>(Stat.Hunger);
			if (hunger.value / hunger.max < 0.7) {
				objectives.push(new RecoverHunger(false, true));
			}

			objectives.push(new ReturnToBase());

			if (context.options.survivalOrganizeBase) {
				objectives.push(new OrganizeBase(context.utilities.base.getTilesWithItemsNearBase(context).tiles));
			}

			objectives.push(new OrganizeInventory());
		}

		if (!multiplayer.isConnected()) {
			if (shouldUpgradeToLeather && game.getTurnMode() !== TurnMode.RealTime) {
				objectives.push(new Lambda(async () => {
					this.finished(true);
					return ObjectiveResult.Complete;
				}).setStatus("Finish"));

			} else {
				objectives.push(new Idle());
			}
		}

		return objectives;
	}

	/**
	 * Upgrades items if we haven't already upgraded them while on this island
	 */
	private addUpgradeItemObjectives(context: Context, objectives: Array<IObjective | IObjective[]>, inventoryItemKey: keyof IInventoryItems, fromItemTypes: Set<ItemType>) {
		const item = context.inventory[inventoryItemKey];
		if (!item) {
			// no existing item
			return;
		}

		const upgradeItemKey = `UpgradeItem:${inventoryItemKey}`;

		if (!fromItemTypes.has((item as Item).type)) {
			// already upgraded
			return;
		}

		const islandSaveData = getTarsSaveData("island")[context.human.island.id];
		// if (islandSaveData[upgradeItemKey]) {
		// 	// already upgraded
		// 	return;
		// }

		objectives.push([
			new UpgradeInventoryItem(inventoryItemKey, fromItemTypes),
			new Lambda(async () => {
				islandSaveData[upgradeItemKey] = true;
				return ObjectiveResult.Complete;
			}),
			new AnalyzeInventory(),
			new Restart(), // restart because we'll likely want to reinforce them right after
		]);
	}
}
