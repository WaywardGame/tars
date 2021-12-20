import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import { AiType, DamageType } from "game/entity/IEntity";
import { EquipType } from "game/entity/IHuman";
import { IStat, IStatMax, Stat } from "game/entity/IStats";
import { TurnMode } from "game/IGame";
import { IContainer, ItemType, ItemTypeGroup } from "game/item/IItem";
import Item from "game/item/Item";

import Context from "../../Context";
import ContextState from "../../ContextState";
import { ContextDataType, MovingToNewIslandState } from "../../IContext";
import { IObjective, ObjectiveResult } from "../../IObjective";
import { getTarsSaveData, IInventoryItems, inventoryItemInfo } from "../../ITars";
import AcquireFood from "../../objectives/acquire/item/AcquireFood";
import AcquireItem from "../../objectives/acquire/item/AcquireItem";
import AcquireItemByGroup from "../../objectives/acquire/item/AcquireItemByGroup";
import AcquireItemByTypes from "../../objectives/acquire/item/AcquireItemByTypes";
import AcquireItemForAction from "../../objectives/acquire/item/AcquireItemForAction";
import AcquireItemForDoodad from "../../objectives/acquire/item/AcquireItemForDoodad";
import AcquireWaterContainer from "../../objectives/acquire/item/specific/AcquireWaterContainer";
import AnalyzeBase from "../../objectives/analyze/AnalyzeBase";
import AnalyzeInventory from "../../objectives/analyze/AnalyzeInventory";
import ExecuteAction from "../../objectives/core/ExecuteAction";
import Lambda from "../../objectives/core/Lambda";
import Restart from "../../objectives/core/Restart";
import GatherWater from "../../objectives/gather/GatherWater";
import BuildItem from "../../objectives/other/item/BuildItem";
import EquipItem from "../../objectives/other/item/EquipItem";
import Idle from "../../objectives/other/Idle";
import ReinforceItem from "../../objectives/other/item/ReinforceItem";
import ReturnToBase from "../../objectives/other/ReturnToBase";
import StartWaterStillDesalination from "../../objectives/other/doodad/StartWaterStillDesalination";
import UpgradeInventoryItem from "../../objectives/other/UpgradeInventoryItem";
import RecoverHealth from "../../objectives/recover/RecoverHealth";
import RecoverHunger from "../../objectives/recover/RecoverHunger";
import DrainSwamp from "../../objectives/utility/DrainSwamp";
import MoveToLand from "../../objectives/utility/moveTo/MoveToLand";
import MoveToNewIsland from "../../objectives/utility/moveTo/MoveToNewIsland";
import OrganizeBase from "../../objectives/utility/OrganizeBase";
import OrganizeInventory from "../../objectives/utility/OrganizeInventory";
import { log } from "../../utilities/Logger";
import { ITarsMode } from "../IMode";
import { baseUtilities } from "../../utilities/Base";
import { playerUtilities } from "../../utilities/Player";
import { itemUtilities } from "../../utilities/Item";
import AcquireUseOrbOfInfluence from "../../objectives/acquire/item/specific/AcquireUseOrbOfInfluence";
import CheckDecayingItems from "../../objectives/other/item/CheckDecayingItems";
import HuntCreatures from "../../objectives/other/creature/HuntCreatures";
import PlantSeeds from "../../objectives/utility/PlantSeeds";
import GatherWaters from "../../objectives/gather/GatherWaters";
import CheckSpecialItems from "../../objectives/other/item/CheckSpecialItems";

/**
 * Survival mode
 */
export class SurvivalMode implements ITarsMode {

	private finished: (success: boolean) => void;

	public async initialize(_: Context, finished: (success: boolean) => void) {
		this.finished = finished;
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		const chest = context.player.getEquippedItem(EquipType.Chest);
		const legs = context.player.getEquippedItem(EquipType.Legs);
		const belt = context.player.getEquippedItem(EquipType.Belt);
		const neck = context.player.getEquippedItem(EquipType.Neck);
		const back = context.player.getEquippedItem(EquipType.Back);
		const head = context.player.getEquippedItem(EquipType.Head);
		const feet = context.player.getEquippedItem(EquipType.Feet);
		const hands = context.player.getEquippedItem(EquipType.Hands);

		const objectives: Array<IObjective | IObjective[]> = [];

		const moveToNewIslandState = context.getDataOrDefault<MovingToNewIslandState>(ContextDataType.MovingToNewIsland, MovingToNewIslandState.None);

		if (moveToNewIslandState === MovingToNewIslandState.Ready) {
			objectives.push(new MoveToNewIsland());
			return objectives;
		}

		if (context.inventory.sailBoat && context.player.island.items.isContainableInContainer(context.inventory.sailBoat, context.player.inventory)) {
			// don't carry the sail boat around if we don't have a base - we likely just moved to a new island
			objectives.push([
				new MoveToLand(),
				new ExecuteAction(ActionType.Drop, (context, action) => {
					action.execute(context.player, context.inventory.sailBoat!);
					return ObjectiveResult.Complete;
				}).setStatus("Dropping sailboat"),
				new AnalyzeInventory(),
			]);
		}

		objectives.push(new CheckSpecialItems());

		const gatherItem = itemUtilities.getBestTool(context, ActionType.Gather, DamageType.Slashing);
		if (gatherItem === undefined) {
			objectives.push([new AcquireItemForAction(ActionType.Gather)]);
		}

		if (context.inventory.axe === undefined) {
			objectives.push([new AcquireItem(ItemType.StoneAxe), new AnalyzeInventory()]);
		}

		if (context.inventory.pickAxe === undefined) {
			objectives.push([new AcquireItem(ItemType.StonePickaxe), new AnalyzeInventory()]);
		}

		if (context.base.campfire.length === 0 && context.inventory.campfire === undefined) {
			log.info("Need campfire");
			objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.LitCampfire), new BuildItem(), new AnalyzeBase()]);
		}

		if (context.inventory.fireStarter === undefined) {
			log.info("Need fire starter");
			objectives.push([new AcquireItemForAction(ActionType.StartFire), new AnalyzeInventory()]);
		}

		if (context.inventory.fireKindling === undefined || context.inventory.fireKindling.length === 0) {
			log.info("Need fire kindling");
			objectives.push([new AcquireItemByGroup(ItemTypeGroup.Kindling), new AnalyzeInventory()]);
		}

		if (context.inventory.fireTinder === undefined) {
			log.info("Need fire tinder");
			objectives.push([new AcquireItemByGroup(ItemTypeGroup.Tinder), new AnalyzeInventory()]);
		}

		// if (context.inventory.fireStoker === undefined || context.inventory.fireStoker.length < 4) {
		// 	objectives.push([new AcquireItemForAction(ActionType.StokeFire), new AnalyzeInventory()]);
		// }

		if (context.inventory.shovel === undefined) {
			objectives.push([new AcquireItemForAction(ActionType.Dig), new AnalyzeInventory()]);
		}

		if (context.inventory.knife === undefined) {
			objectives.push([new AcquireItem(ItemType.StoneKnife), new AnalyzeInventory()]);
		}

		if (context.inventory.bed === undefined) {
			objectives.push([new AcquireItemByGroup(ItemTypeGroup.Bedding), new AnalyzeInventory()]);
		}

		if (context.inventory.equipSword === undefined) {
			objectives.push([new AcquireItem(ItemType.WoodenSword), new AnalyzeInventory(), new EquipItem(EquipType.LeftHand)]);
		}

		if (chest === undefined || chest.type === ItemType.TatteredClothShirt) {
			objectives.push([new AcquireItem(ItemType.BarkTunic), new AnalyzeInventory(), new EquipItem(EquipType.Chest)]);
		}

		if (legs === undefined || legs.type === ItemType.TatteredClothTrousers) {
			objectives.push([new AcquireItem(ItemType.BarkLeggings), new AnalyzeInventory(), new EquipItem(EquipType.Legs)]);
		}

		if (context.inventory.equipShield === undefined) {
			objectives.push([new AcquireItem(ItemType.WoodenShield), new AnalyzeInventory(), new EquipItem(EquipType.RightHand)]);
		}

		if (baseUtilities.shouldBuildWaterStills(context) && context.base.waterStill.length === 0 && context.inventory.waterStill === undefined) {
			objectives.push([new AcquireItemForDoodad(DoodadTypeGroup.LitWaterStill), new BuildItem(), new AnalyzeBase()]);
		}

		let acquireChest = true;

		if (context.base.buildAnotherChest) {
			// build another chest if we're near the base
			acquireChest = baseUtilities.isNearBase(context);

		} else if (context.base.chest.length > 0) {
			for (const c of context.base.chest) {
				if ((context.player.island.items.computeContainerWeight(c as IContainer) / context.player.island.items.getWeightCapacity(c)!) < 0.9) {
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

		if (baseUtilities.isNearBase(context)) {
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

		const waitingForWater = context.player.stat.get<IStat>(Stat.Thirst).value <= playerUtilities.getRecoverThreshold(context, Stat.Thirst) &&
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

		if (context.options.useOrbsOfInfluence) {
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
		if (baseUtilities.isNearBase(context)) {
			// build a second water still
			if (baseUtilities.shouldBuildWaterStills(context) && context.base.waterStill.length < 2) {
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
					if (itemUtilities.isSafeToDrinkItem(waterContainer)) {
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
				// remove swamp tiles near the base
				const swampTiles = baseUtilities.getSwampTilesNearBase(context);
				if (swampTiles.length > 0) {
					objectives.push(new DrainSwamp(swampTiles));
				}

				// cleanup base if theres items laying around everywhere
				const tiles = baseUtilities.getTilesWithItemsNearBase(context);
				if (tiles.totalCount > 20) {
					objectives.push(new OrganizeBase(tiles.tiles));
				}
			}

			if (drinkableWaterContainers.length < 2 && availableWaterContainers.length > 0) {
				// we are trying to gather water. wait before moving on to upgrade objectives
				objectives.push(new GatherWaters(availableWaterContainers, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWaterStill: true }));
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
		if (baseUtilities.isNearBase(context)) {
			const creatures = baseUtilities.getNonTamedCreaturesNearBase(context)
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

		this.addUpgradeItemObjectives(context, objectives, "equipSword", ItemType.WoodenSword);
		this.addUpgradeItemObjectives(context, objectives, "equipShield", ItemType.WoodenShield);
		this.addUpgradeItemObjectives(context, objectives, "equipBelt", ItemType.LeatherBelt);
		this.addUpgradeItemObjectives(context, objectives, "equipNeck", ItemType.LeatherGorget);
		this.addUpgradeItemObjectives(context, objectives, "equipHead", ItemType.LeatherCap);
		this.addUpgradeItemObjectives(context, objectives, "equipFeet", ItemType.LeatherBoots);
		this.addUpgradeItemObjectives(context, objectives, "equipHands", ItemType.LeatherGloves);
		this.addUpgradeItemObjectives(context, objectives, "equipLegs", ItemType.LeatherPants);
		this.addUpgradeItemObjectives(context, objectives, "equipChest", ItemType.LeatherTunic);
		this.addUpgradeItemObjectives(context, objectives, "axe", ItemType.StoneAxe);
		this.addUpgradeItemObjectives(context, objectives, "pickAxe", ItemType.StonePickaxe);
		this.addUpgradeItemObjectives(context, objectives, "shovel", ItemType.StoneShovel);
		this.addUpgradeItemObjectives(context, objectives, "hammer", ItemType.StoneHammer);
		this.addUpgradeItemObjectives(context, objectives, "hoe", ItemType.StoneHoe);

		/*
			End game objectives
		*/

		if (context.options.exploreIslands && !multiplayer.isConnected()) {
			// move to a new island
			const needWaterItems = context.inventory.waterContainer === undefined || context.inventory.waterContainer.filter(item => itemUtilities.isSafeToDrinkItem(item)).length < 2;
			const needFoodItems = context.inventory.food === undefined || context.inventory.food.length < 2;

			const health = context.player.stat.get<IStatMax>(Stat.Health);
			const hunger = context.player.stat.get<IStatMax>(Stat.Hunger);
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
						const availableWaterContainers = context.inventory.waterContainer?.filter(item => !itemUtilities.isSafeToDrinkItem(item));
						if (availableWaterContainers && availableWaterContainers.length > 0) {
							// we are looking for something drinkable
							// if there is a well, starting the water still will use it
							objectives.push(new GatherWaters(availableWaterContainers, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWaterStill: true }));

						} else {
							// get a new water container
							objectives.push(new AcquireWaterContainer());
							objectives.push(new GatherWater(undefined, { disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true, allowWaitingForWaterStill: true }));
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
			const health = context.player.stat.get<IStatMax>(Stat.Health);
			if (health.value / health.max < 0.9) {
				objectives.push(new RecoverHealth(false));
			}

			const hunger = context.player.stat.get<IStatMax>(Stat.Hunger);
			if (hunger.value / hunger.max < 0.7) {
				objectives.push(new RecoverHunger(false, true));
			}

			objectives.push(new ReturnToBase());

			objectives.push(new OrganizeBase(baseUtilities.getTilesWithItemsNearBase(context).tiles));

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
	private addUpgradeItemObjectives(context: Context, objectives: Array<IObjective | IObjective[]>, inventoryItemKey: keyof IInventoryItems, fromItemType: ItemType) {
		const item = context.inventory[inventoryItemKey];
		if (!item) {
			// no existing item
			return;
		}

		const upgradeItemKey = `UpgradeItem:${inventoryItemKey}`;

		const islandSaveData = getTarsSaveData("island")[context.player.island.id];

		if ((item as Item).type !== fromItemType) {
			return;
		}

		// if (islandSaveData[upgradeItemKey]) {
		// 	// already upgraded
		// 	return;
		// }

		objectives.push([
			new UpgradeInventoryItem(inventoryItemKey),
			new Lambda(async () => {
				islandSaveData[upgradeItemKey] = true;
				return ObjectiveResult.Complete;
			}),
			new AnalyzeInventory(),
			new Restart(), // restart because we'll likely want to reinforce them right after
		]);
	}
}
