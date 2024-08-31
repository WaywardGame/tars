import { TurnMode } from "@wayward/game/game/IGame";
import { BiomeType } from "@wayward/game/game/biome/IBiome";
import { EquipType } from "@wayward/game/game/entity/IHuman";
import type { IStat, IStatMax } from "@wayward/game/game/entity/IStats";
import { Stat } from "@wayward/game/game/entity/IStats";
import { CreatureType } from "@wayward/game/game/entity/creature/ICreature";
import { ItemType } from "@wayward/game/game/item/IItem";

import { AiType } from "@wayward/game/game/entity/ai/AI";
import { IInventoryItems } from "../core/ITars";
import type Context from "../core/context/Context";
import { ContextDataType, MovingToNewIslandState } from "../core/context/IContext";
import type { ITarsMode } from "../core/mode/IMode";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import AcquireFood from "../objectives/acquire/item/AcquireFood";
import AcquireInventoryItem from "../objectives/acquire/item/AcquireInventoryItem";
import AcquireItem from "../objectives/acquire/item/AcquireItem";
import AcquireWater from "../objectives/acquire/item/specific/AcquireWater";
import AcquireWaterContainer from "../objectives/acquire/item/specific/AcquireWaterContainer";
import AnalyzeInventory from "../objectives/analyze/AnalyzeInventory";
import Lambda from "../objectives/core/Lambda";
import MoveToTarget from "../objectives/core/MoveToTarget";
import Restart from "../objectives/core/Restart";
import Idle from "../objectives/other/Idle";
import UpgradeInventoryItem from "../objectives/other/UpgradeInventoryItem";
import HuntCreatures from "../objectives/other/creature/HuntCreatures";
import StartWaterSourceDoodad from "../objectives/other/doodad/StartWaterSourceDoodad";
import BuildItem from "../objectives/other/item/BuildItem";
import CheckDecayingItems from "../objectives/other/item/CheckDecayingItems";
import CheckSpecialItems from "../objectives/other/item/CheckSpecialItems";
import EquipItem from "../objectives/other/item/EquipItem";
import ReinforceItem from "../objectives/other/item/ReinforceItem";
import RecoverHealth from "../objectives/recover/RecoverHealth";
import RecoverHunger from "../objectives/recover/RecoverHunger";
import DrainSwamp from "../objectives/utility/DrainSwamp";
import OrganizeBase from "../objectives/utility/OrganizeBase";
import OrganizeInventory from "../objectives/utility/OrganizeInventory";
import PlantSeeds from "../objectives/utility/PlantSeeds";
import MoveToBase from "../objectives/utility/moveTo/MoveToBase";
import MoveToLand from "../objectives/utility/moveTo/MoveToLand";
import MoveToNewIsland from "../objectives/utility/moveTo/MoveToNewIsland";
import { BaseMode } from "./BaseMode";

/**
 * Survival mode
 */
export class SurvivalMode extends BaseMode implements ITarsMode {

	private finished: (success: boolean) => void;

	public async initialize(_: Context, finished: (success: boolean) => void): Promise<void> {
		this.finished = finished;
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		const chest = context.human.getEquippedItem(EquipType.Chest);
		const legs = context.human.getEquippedItem(EquipType.Legs);
		const waist = context.human.getEquippedItem(EquipType.Waist);
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

		if (context.inventory.sailboat && context.human.island.items.isContainableInContainer(context.inventory.sailboat, context.human.inventory)) {
			//  we likely just moved to a new island
			const movedToNewIslandObjectives: IObjective[] = [];

			if (context.utilities.base.hasBase(context)) {
				movedToNewIslandObjectives.push(new MoveToBase());

			} else {
				const target = await context.utilities.base.findInitialBuildTile(context);
				if (target) {
					movedToNewIslandObjectives.push(new MoveToTarget(target, true));
				} else {
					movedToNewIslandObjectives.push(new MoveToLand());
				}
			}

			movedToNewIslandObjectives.push(new AnalyzeInventory());

			objectives.push(movedToNewIslandObjectives);
		}

		objectives.push(new CheckSpecialItems());

		objectives.push(...await this.getCommonInitialObjectives(context));

		if (context.utilities.base.canBuildWaterDesalinators(context)) {
			if (context.base.dripStone.length === 0) {
				objectives.push([new AcquireInventoryItem("dripStone"), new BuildItem()]);
			}

			// if (context.base.waterStill.length === 0) {
			// 	objectives.push([new AcquireInventoryItem("waterStill"), new BuildItem()]);
			// }
		}

		objectives.push(...await this.getBuildAnotherChestObjectives(context));

		if (context.base.altar.length === 0) {
			objectives.push([new AcquireInventoryItem("altar"), new BuildItem()]);
		}

		objectives.push(new AcquireInventoryItem("hammer"));
		objectives.push(new AcquireInventoryItem("tongs"));

		await this.runWhileNearBase(context, objectives, ContextDataType.NearBase1, async (context, objectives) => {
			if (context.options.survivalStartWaterSources) {
				for (const doodad of context.utilities.base.getWaterSourceDoodads(context)) {
					objectives.push(new StartWaterSourceDoodad(doodad));
				}
			}

			const seeds = context.utilities.item.getSeeds(context, true);
			if (seeds.length > 0) {
				objectives.push(new PlantSeeds(seeds));
			}

			// carry food with you if it's available from the base
			const foodItemsNeeded = Math.max(2 - (context.inventory.food?.length ?? 0), 0);
			if (foodItemsNeeded > 0) {
				for (let i = 0; i < foodItemsNeeded; i++) {
					objectives.push([new AcquireFood({ onlyAllowBaseItems: true }), new AnalyzeInventory()]);
				}
			}
		});

		objectives.push(new AcquireInventoryItem("heal"));

		// const deity = context.options.deity;
		// if (deity !== undefined && deity !== null) {
		// 	objectives.push(new DeitySacrifice(deity));
		// }

		const waitingForWater = context.human.stat.get<IStat>(Stat.Thirst).value <= context.utilities.player.getRecoverThreshold(context, Stat.Thirst) &&
			(
				(context.base.dripStone.length > 0 && context.base.dripStone.some(dripStone => context.utilities.doodad.isWaterSourceDoodadBusy(dripStone))) ||
				(context.base.waterStill.length > 0 && context.base.waterStill.some(waterStill => context.utilities.doodad.isWaterSourceDoodadBusy(waterStill)))
			);

		if (!waitingForWater && context.options.allowBackpacks) {
			// get a backpack before continuing. it will make things easier
			objectives.push(new AcquireInventoryItem("backpack"));
		}

		const shouldUpgradeToLeather = !waitingForWater && !context.options.lockEquipment;
		if (shouldUpgradeToLeather) {
			/*
				Upgrade to leather
				Order is based on recipe level
			*/

			if (waist === undefined) {
				objectives.push([new AcquireItem(ItemType.LeatherBelt), new AnalyzeInventory(), new EquipItem(EquipType.Waist)]);
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

		// todo: replace with rune stuff
		// if (context.options.survivalUseOrbsOfInfluence) {
		// 	objectives.push(new AcquireUseOrbOfInfluence());
		// }

		if (context.base.well.length === 0 && context.base.availableUnlimitedWellLocation !== undefined) {
			// todo: only build a well if we find a good tile?
			objectives.push([new AcquireInventoryItem("well"), new BuildItem()]);
		}

		if (context.base.kiln.length === 0) {
			objectives.push([new AcquireInventoryItem("kiln"), new BuildItem()]);
		}

		if (context.base.furnace.length === 0) {
			objectives.push([new AcquireInventoryItem("furnace"), new BuildItem()]);
		}

		if (context.base.anvil.length === 0) {
			objectives.push([new AcquireInventoryItem("anvil"), new BuildItem()]);
		}

		if (context.inventory.waterContainer === undefined) {
			objectives.push([new AcquireWaterContainer(), new AnalyzeInventory()]);
		}

		const { safeToDrinkWaterContainers, availableWaterContainers } = context.utilities.item.getWaterContainers(context);

		// run a few extra things before running upgrade objectives if we're near a base
		await this.runWhileNearBase(context, objectives, ContextDataType.NearBase2, async (context, objectives) => {
			// build a second drip stone
			if (context.utilities.base.canBuildWaterDesalinators(context) && context.base.dripStone.length < 2) {
				objectives.push([new AcquireInventoryItem("dripStone"), new BuildItem()]);
			}

			// build a second water still
			// if (context.utilities.base.canBuildWaterDesalinators(context) && context.base.waterStill.length < 2) {
			// 	objectives.push([new AcquireInventoryItem("waterStill"), new BuildItem()]);
			// }

			// carry food with you
			if (context.inventory.food === undefined) {
				objectives.push([new AcquireFood(), new AnalyzeInventory()]);
			}

			// carry a bandage with you
			objectives.push(new AcquireInventoryItem("bandage"));

			// if (availableWaterContainers.length > 0) {
			// 	// we are looking for something drinkable
			// 	// if there is a well, starting the water still will use it
			// 	objectives.push([
			// 		// ...availableWaterContainers.map(waterContainer => new ProvideItems(waterContainer.type)),
			// 		new AcquireWater({ disallowTerrain: true, disallowWell: true, allowStartingWaterStill: true }),
			// 		new AnalyzeInventory(),
			// 	]);
			// }

			if (moveToNewIslandState === MovingToNewIslandState.None) {
				// it will take too long to clean up wetlands
				if (context.options.survivalClearSwamps && context.island.biomeType !== BiomeType.Wetlands) {
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
					// and rember we are organizing until we're done!
					await this.runWhile(context, objectives,
						"OrganizeBase",
						async (context) => context.utilities.base.getTilesWithItemsNearBase(context).totalCount > 20,
						async () => {
							const tiles = context.utilities.base.getTilesWithItemsNearBase(context);
							objectives.push(new OrganizeBase(tiles.tiles));
						});
				}
			}

			if (safeToDrinkWaterContainers.length < 2 && availableWaterContainers.length > 0) {
				// we are trying to gather water. wait before moving on to upgrade objectives
				objectives.push([
					new AcquireWater({ disallowTerrain: true, disallowWell: true, allowStartingWaterSourceDoodads: true, allowWaitingForWater: true })
						.setStatus("Gathering water before upgrade objectives"),
					new AnalyzeInventory()]);
			}
		});

		// keep existing equipment in good shape
		if (context.inventory.equipSword) {
			objectives.push(new ReinforceItem(context.inventory.equipSword, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		if (context.inventory.equipShield) {
			objectives.push(new ReinforceItem(context.inventory.equipShield, { minWorth: 200, targetDurabilityMultipler: 2 }));
		}

		// go on a killing spree once you have a good sword and shield
		await this.runWhileNearBase(context, objectives, ContextDataType.NearBase3, async (context, objectives) => {
			const creatures = context.utilities.base.getNonTamedCreaturesNearBase(context)
				.filter(creature => creature.ai.has(AiType.Hostile) || creature.ai.has(AiType.Hidden));
			if (creatures.length > 0) {
				objectives.push(new HuntCreatures(creatures));
			}
		});

		if (context.inventory.equipWaist) {
			objectives.push(new ReinforceItem(context.inventory.equipWaist, { minWorth: 200, targetDurabilityMultipler: 2 }));
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

		if (context.inventory.equipBack) {
			objectives.push(new ReinforceItem(context.inventory.equipBack, { targetDurabilityMultipler: 1 }));
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

		// go for another backpack first
		if (context.options.allowBackpacks) {
			objectives.push(new AcquireInventoryItem("backpack", { desiredCount: 2 }));
		}

		this.addUpgradeItemObjectives(context, objectives, "equipSword", new Set([ItemType.WoodenShortSword, ItemType.TinShortSword]));
		this.addUpgradeItemObjectives(context, objectives, "equipShield", new Set([ItemType.WoodenShield, ItemType.BarkShield, ItemType.TinShield]));
		this.addUpgradeItemObjectives(context, objectives, "equipWaist", new Set([ItemType.LeatherBelt]));
		this.addUpgradeItemObjectives(context, objectives, "equipNeck", new Set([ItemType.LeatherGorget, ItemType.TinBevor]));
		this.addUpgradeItemObjectives(context, objectives, "equipHead", new Set([ItemType.LeatherCap, ItemType.TinHelmet, ItemType.PirateHat, ItemType.StrawHat]));
		this.addUpgradeItemObjectives(context, objectives, "equipFeet", new Set([ItemType.LeatherBoots, ItemType.TinFootgear]));
		this.addUpgradeItemObjectives(context, objectives, "equipHands", new Set([ItemType.LeatherGloves, ItemType.TinGloves]));
		this.addUpgradeItemObjectives(context, objectives, "equipLegs", new Set([ItemType.LeatherPants, ItemType.TinChausses]));
		this.addUpgradeItemObjectives(context, objectives, "equipChest", new Set([ItemType.LeatherTunic, ItemType.TinChest]));
		this.addUpgradeItemObjectives(context, objectives, "knife", new Set([ItemType.GraniteKnife, ItemType.BasaltKnife, ItemType.SandstoneKnife, ItemType.TinKnife]));
		this.addUpgradeItemObjectives(context, objectives, "axe", new Set([ItemType.GraniteAxe, ItemType.BasaltAxe, ItemType.SandstoneAxe, ItemType.TinAxe]));
		this.addUpgradeItemObjectives(context, objectives, "pickAxe", new Set([ItemType.GranitePickaxe, ItemType.BasaltPickaxe, ItemType.SandstonePickaxe, ItemType.TinPickaxe]));
		this.addUpgradeItemObjectives(context, objectives, "shovel", new Set([ItemType.GraniteShovel, ItemType.BasaltShovel, ItemType.SandstoneShovel, ItemType.TinShovel]));
		this.addUpgradeItemObjectives(context, objectives, "hammer", new Set([ItemType.GraniteHammer, ItemType.BasaltHammer, ItemType.SandstoneHammer, ItemType.TinHammer]));
		this.addUpgradeItemObjectives(context, objectives, "hoe", new Set([ItemType.GraniteHoe, ItemType.BasaltHoe, ItemType.SandstoneHoe, ItemType.TinHoe]));

		// extra upgrades
		// this.addUpgradeItemObjectives(context, objectives, "equipHead", ItemType.PirateHat);

		// this.addUpgradeItemObjectives(context, objectives, "equipWaist", ItemType.ScaleBelt);
		// this.addUpgradeItemObjectives(context, objectives, "equipNeck", ItemType.ScaleBevor);
		// this.addUpgradeItemObjectives(context, objectives, "equipFeet", ItemType.ScaleBoots);
		// this.addUpgradeItemObjectives(context, objectives, "equipHands", ItemType.ScaleGloves);

		/*
			End game objectives
		*/

		if (moveToNewIslandState === MovingToNewIslandState.None) {
			await this.runWhileNearBase(context, objectives, ContextDataType.NearBase4, async (context, objectives) => {
				objectives.push(new CheckDecayingItems());
			});
		}

		objectives.push([new AcquireInventoryItem("curePoison")]);

		if (context.base.solarStill.length === 0) {
			objectives.push([new AcquireInventoryItem("solarStill"), new BuildItem()]);
		}

		if (context.options.survivalExploreIslands && (!multiplayer.isConnected || multiplayer.options.allowTraveling)) {
			// move to a new island
			const { safeToDrinkWaterContainers } = context.utilities.item.getWaterContainers(context);
			const waterItemsNeeded = Math.max(4 - safeToDrinkWaterContainers.length, 0);
			const foodItemsNeeded = Math.max(4 - (context.inventory.food?.length ?? 0), 0);

			const health = context.human.stat.get<IStatMax>(Stat.Health);
			const hunger = context.human.stat.get<IStatMax>(Stat.Hunger);
			const needHealthRecovery = health.value / health.max < 0.9;
			const needHungerRecovery = hunger.value / hunger.max < 0.7;

			// const isPreparing = waterItemsNeeded !== 0 || foodItemsNeeded !== 0 || needHealthRecovery || needHungerRecovery;

			switch (moveToNewIslandState) {
				case MovingToNewIslandState.None:
					objectives.push(new Lambda(async () => {
						context.setInitialStateData(ContextDataType.MovingToNewIsland, MovingToNewIslandState.Preparing);
						return ObjectiveResult.Complete;
					}));

				case MovingToNewIslandState.Preparing:
					// make a sail boat

					// it's possible theres a sailboat at the time this is checked, but it's actually dropped after
					if (context.base.sailboat.length === 0) {
						objectives.push([new AcquireInventoryItem("sailboat"), new BuildItem()]);
					}

					if (needHealthRecovery) {
						objectives.push(new RecoverHealth(false));
					}

					if (needHungerRecovery) {
						objectives.push(new RecoverHunger(false, true));
					}

					// carry two bandages before sailing
					objectives.push(new AcquireInventoryItem("bandage", { desiredCount: 2 }));

					// stock up on water
					if (waterItemsNeeded > 0) {
						for (let i = 0; i < waterItemsNeeded; i++) {
							// we are looking for something drinkable
							// if there is a well, starting the water still will use it
							objectives.push([new AcquireWater({ disallowTerrain: true, disallowWell: true, allowStartingWaterSourceDoodads: true, allowWaitingForWater: true }), new AnalyzeInventory()]);
						}
					}

					// stock up on food
					if (foodItemsNeeded > 0) {
						for (let i = 0; i < foodItemsNeeded; i++) {
							objectives.push([new AcquireFood({ onlyAllowBaseItems: true }), new AnalyzeInventory()]);
						}
					}

					objectives.push(new Lambda(async () => {
						context.setInitialStateData(ContextDataType.MovingToNewIsland, MovingToNewIslandState.Ready);
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

			objectives.push(new MoveToBase());

			if (context.options.survivalOrganizeBase) {
				objectives.push(new OrganizeBase(context.utilities.base.getTilesWithItemsNearBase(context).tiles));
			}

			objectives.push(new OrganizeInventory());
		}

		if (!multiplayer.isConnected) {
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
	private addUpgradeItemObjectives(context: Context, objectives: Array<IObjective | IObjective[]>, inventoryItemKey: keyof IInventoryItems, fromItemTypes: Set<ItemType>): void {
		const item = context.inventory[inventoryItemKey];
		if (!item) {
			// no existing item
			return;
		}

		// try to always upgrade the item once per island visited
		// if (!fromItemTypes.has((item as Item).type)) {
		// 	// already upgraded
		// 	return;
		// }

		let islandSaveData = context.tars.saveData.island[context.human.island.id];
		if (!islandSaveData) {
			islandSaveData = context.tars.saveData.island[context.human.island.id] = {};
		}

		const upgradeItemKey = `UpgradeItem:${inventoryItemKey}`;

		if (islandSaveData[upgradeItemKey]) {
			// already upgraded this item once
			return;
		}

		objectives.push([
			new UpgradeInventoryItem(inventoryItemKey, fromItemTypes),
			new Lambda(async () => {
				islandSaveData[upgradeItemKey] = true;
				return ObjectiveResult.Complete;
			}).setStatus(`Marking ${inventoryItemKey} upgrade as done`),
			new AnalyzeInventory(),
			new Restart(), // restart because we'll likely want to reinforce them right after
		]);

		// marked as upgraded in the next pipeline
		// this makes it so if the above UpgradeInventoryItem is impossible, it won't waste calculating it again every time
		objectives.push([
			new Lambda(async () => {
				islandSaveData[upgradeItemKey] = true;
				return ObjectiveResult.Complete;
			}).setStatus(`Marking ${inventoryItemKey} upgrade as done`),
		]);
	}

	/**
	 * Runs objectives when near the base.
	 * And remembers to keep running them even if running the objectives ends up moving you away from the base
	 */
	private async runWhileNearBase(
		context: Context,
		objectives: Array<IObjective | IObjective[]>,
		id: ContextDataType,
		determineObjectives: (ontext: Context, objectives: Array<IObjective | IObjective[]>) => Promise<void>): Promise<void> {
		return this.runWhile(context, objectives,
			id,
			async (context) => context.utilities.base.isNearBase(context),
			determineObjectives);
	}

	private async runWhile(
		context: Context,
		objectives: Array<IObjective | IObjective[]>,
		id: string,
		initialCondition: (context: Context) => Promise<boolean>,
		determineObjectives: (ontext: Context, objectives: Array<IObjective | IObjective[]>) => Promise<void>): Promise<void> {
		const isContinuing = context.getDataOrDefault<boolean>(id, false);
		if (!isContinuing && !await initialCondition(context)) {
			return;
		}

		if (isContinuing) {
			context.log.debug(`${id} - Continuing`);

		} else {
			// mark that we're near the base, so we'll keep trying these objectives until we're done
			objectives.push(new Lambda(async () => {
				context.setInitialStateData(id, true);
				return ObjectiveResult.Complete;
			}).setStatus(`${id} - Marked`));
		}

		await determineObjectives(context, objectives);

		// mark that we're done with the near base objectives
		objectives.push(new Lambda(async () => {
			context.setInitialStateData(id, undefined);
			return ObjectiveResult.Complete;
		}).setStatus(`${id} - Finished`));
	}
}
