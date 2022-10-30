import { ActionType } from "game/entity/action/IAction";
import type { IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import { ItemType, ItemTypeGroup } from "game/item/IItem";
import DrinkInFront from "game/entity/action/actions/DrinkInFront";
import DrinkItem from "game/entity/action/actions/DrinkItem";
import Heal from "game/entity/action/actions/Heal";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AcquireItemForAction from "../acquire/item/AcquireItemForAction";
import AcquireWaterContainer from "../acquire/item/specific/AcquireWaterContainer";
import ExecuteAction from "../core/ExecuteAction";
import MoveToTarget from "../core/MoveToTarget";
import BuildItem from "../other/item/BuildItem";
import Idle from "../other/Idle";
import StartWaterStillDesalination from "../other/doodad/StartWaterStillDesalination";
import UseItem from "../other/item/UseItem";
import AcquireItemByGroup from "../acquire/item/AcquireItemByGroup";
import RecoverStamina from "./RecoverStamina";
import AcquireItem from "../acquire/item/AcquireItem";
import StartSolarStill from "../other/doodad/StartSolarStill";
import { DoodadType } from "game/doodad/IDoodad";
import AcquireWater from "../acquire/item/specific/AcquireWater";
import AddDifficulty from "../core/AddDifficulty";
import Restart from "../core/Restart";
import AcquireInventoryItem from "../acquire/item/AcquireInventoryItem";
import { freshWaterTileLocation } from "../../core/navigation/INavigation";

export interface IRecoverThirstOptions {
	onlyUseAvailableItems: boolean;
	exceededThreshold: boolean;
	onlyEmergencies: boolean;
}

export default class RecoverThirst extends Objective {

	public static isEmergency(context: Context) {
		const thirstStat = context.human.stat.get<IStatMax>(Stat.Thirst);
		return thirstStat.value <= 3 && context.base.waterStill.concat(context.base.solarStill).every(waterStill => !context.utilities.doodad.isWaterStillDrinkable(waterStill));
	}

	constructor(private readonly options: IRecoverThirstOptions) {
		super();
	}

	public getIdentifier(): string {
		return `RecoverThirst:${this.options.onlyUseAvailableItems}`;
	}

	public getStatus(): string | undefined {
		return "Recovering thirst";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.options.onlyEmergencies) {
			if (!RecoverThirst.isEmergency(context)) {
				return ObjectiveResult.Ignore;
			}

			return this.getEmergencyObjectives(context);
		}

		return this.options.exceededThreshold ? this.getExceededThresholdObjectives(context) : this.getAboveThresholdObjectives(context);
	}

	private async getEmergencyObjectives(context: Context) {
		const objectivePipelines: IObjective[][] = [];

		const { availableWaterContainers } = context.utilities.item.getWaterContainers(context);
		if (availableWaterContainers.length > 0) {
			// we are looking for something drinkable
			objectivePipelines.push([new AcquireWater({ onlySafeToDrink: true, disallowTerrain: true })]);
		}

		const health = context.human.stat.get<IStatMax>(Stat.Health);
		if (health.value > 4 || ((health.value / health.max) >= 0.7 && context.base.waterStill.length === 0)) {
			// only risk drinking unpurified water if we have a lot of health or in an emergency
			const nearestFreshWater = context.utilities.tile.getNearestTileLocation(context, freshWaterTileLocation);

			for (const { point } of nearestFreshWater) {
				const objectives: IObjective[] = [];

				objectives.push(new MoveToTarget(point, true));

				objectives.push(new ExecuteAction(DrinkInFront, []));

				objectivePipelines.push(objectives);
			}
		}

		if (context.base.waterStill.length > 0) {
			const isWaitingForAll = context.base.waterStill.every(doodad => context.utilities.doodad.isWaterStillDesalinating(doodad));
			if (isWaitingForAll) {
				if ((health.value / health.max) <= 0.3) {
					this.log.info("Making health items");

					for (const waterStill of context.base.waterStill) {
						objectivePipelines.push([
							new StartWaterStillDesalination(waterStill), // ensure the water still has enough fire to desalinate
							new AcquireItemForAction(ActionType.Heal).keepInInventory(),
							new UseItem(Heal),
						]);
					}

				} else {
					this.log.info("Running back to wait for water still");

					if (context.base.waterStill.length < 3 && context.human.stat.get<IStatMax>(Stat.Stamina).value > 2) {
						this.log.info("Building another water still while waiting");

						// build a water still while waiting
						objectivePipelines.push([
							new AcquireItemByGroup(ItemTypeGroup.WaterStill),
							new BuildItem(),
						]);

					} else {
						// run back to the waterstill and wait
						for (const waterStill of context.base.waterStill) {
							objectivePipelines.push([
								// new MoveToTarget(waterStill, true, { range: 5 }),
								new StartWaterStillDesalination(waterStill), // ensure the water still has enough fire to desalinate
								new Idle().setStatus("Waiting for water still due to emergency"),
							]);
						}
					}
				}

			} else {
				for (const waterStill of context.base.waterStill) {
					if (context.utilities.doodad.isWaterStillDesalinating(waterStill) || context.utilities.doodad.isWaterStillDrinkable(waterStill)) {
						continue;
					}

					if (!context.utilities.doodad.isWaterStillDrinkable(waterStill)) {
						const stamina = context.human.stat.get<IStatMax>(Stat.Stamina);
						if ((stamina.value / stamina.max) < 0.9) {
							objectivePipelines.push([new RecoverStamina()]);

						} else {
							// wait for water still to finish
							objectivePipelines.push([
								// new MoveToTarget(waterStill, true, { range: 5 }),
								new StartWaterStillDesalination(waterStill), // ensure the water still has enough fire to desalinate
								new Idle().setStatus("Waiting for water still due to emergency"),
							]);
						}
					}
				}
			}
		}

		return objectivePipelines;
	}

	private getAboveThresholdObjectives(context: Context) {
		const objectivePipelines: IObjective[][] = [];

		if (!this.options.onlyUseAvailableItems) {
			// todo: maybe remove this near base check?
			if (context.utilities.base.isNearBase(context)) {
				const thirstStat = context.human.stat.get<IStatMax>(Stat.Thirst);

				for (const waterStill of context.base.waterStill) {
					// if we're near our base, the water still is ready, and we're thirsty, go drink
					if (context.utilities.doodad.isWaterStillDrinkable(waterStill) && (thirstStat.max - thirstStat.value) >= 10) {
						this.log.info("Near base, going to drink from water still");

						objectivePipelines.push([
							new MoveToTarget(waterStill, true),
							new ExecuteAction(DrinkInFront, []),
						]);
					}
				}

				for (const solarStill of context.base.solarStill) {
					// if we're near our base, the solar still is ready, and we're thirsty, go drink
					if (context.utilities.doodad.isWaterStillDrinkable(solarStill) && (thirstStat.max - thirstStat.value) >= 10) {
						this.log.info("Near base, going to drink from solar still");

						objectivePipelines.push([
							new AddDifficulty(-100), // make this preferable over water still
							new MoveToTarget(solarStill, true),
							new ExecuteAction(DrinkInFront, []),
						]);
					}
				}

				// if (context.inventory.waterContainer) {
				// 	const safeToDrinkWaterContainers = context.inventory.waterContainer.filter(waterContainer => context.utilities.item.isSafeToDrinkItem(context, waterContainer));
				// 	if (context.inventory.waterContainer.length !== safeToDrinkWaterContainers.length) {
				// 		objectivePipelines.push([new AcquireSafeWater()]);
				// 	}
				// }

				// if (context.inventory.waterContainer !== undefined) {
				// 	for (const waterContainer of context.inventory.waterContainer) {
				// 		if (context.utilities.item.isDrinkableItem(waterContainer) && !context.utilities.item.isSafeToDrinkItem(context, waterContainer)) {
				// 			// we have an unpurified container. try purifying it
				// 			objectivePipelines.push([new GatherWaterWithRecipe(waterContainer)]);
				// 		}
				// 	}
				// }
			}
		}

		return objectivePipelines.length > 0 ? objectivePipelines : ObjectiveResult.Ignore;
	}

	private async getExceededThresholdObjectives(context: Context) {
		const waterAndSolarStills = context.base.waterStill.concat(context.base.solarStill);

		if (!RecoverThirst.isEmergency(context) && !context.utilities.base.isNearBase(context)) {
			const isDrinkableWaterAvailable = waterAndSolarStills.some(solarOrWaterStill => !context.utilities.doodad.isWaterStillDesalinating(solarOrWaterStill) && context.utilities.doodad.isWaterStillDrinkable(solarOrWaterStill));
			if (isDrinkableWaterAvailable) {
				// drinkable water is available at the base
				// don't go back to the base until we have too
				const thirst = context.human.stat.get(Stat.Thirst)!;
				const changeTimer = thirst.changeTimer;
				const nextChangeTimer = thirst.nextChangeTimer;
				if (changeTimer !== undefined && nextChangeTimer !== undefined) {
					const pathResult = context.utilities.navigation.findPath(context.utilities.base.getBasePosition(context));
					if (pathResult) {
						// note: assuming walk path is taking us away from the base
						const pathLength = pathResult.path.length + (context.human.walkPath?.path?.length ?? 0);

						const turnsUntilThirstHitsZero = ((thirst.value - 1) * nextChangeTimer) + changeTimer - 50; // reduce count by 50 turns as a buffer
						if (turnsUntilThirstHitsZero >= pathLength) {
							// we can make it back to the base and drink water before thirst goes below 0
							// no need to go back to base now
							return ObjectiveResult.Ignore;
						}
					}
				}
			}
		}

		const { safeToDrinkWaterContainers, availableWaterContainers } = context.utilities.item.getWaterContainers(context);

		const objectivePipelines: IObjective[][] = [];

		for (const waterContainer of safeToDrinkWaterContainers) {
			this.log.info(`Can safely drink water from ${waterContainer}`);
			objectivePipelines.push([new UseItem(DrinkItem, waterContainer)]);
		}

		if (!this.options.onlyUseAvailableItems) {
			// note: this could cause us to run across the map to grab unpurified fresh water for boiling
			if (availableWaterContainers.length !== safeToDrinkWaterContainers.length) {
				objectivePipelines.push([new AcquireWater({ onlySafeToDrink: true })]);
			}

			if (context.base.waterStill.length === 0) {
				const waterStillObjectives: IObjective[] = [
					new AcquireInventoryItem("waterStill"),
					new BuildItem(),
				];

				if (context.inventory.waterContainer === undefined) {
					waterStillObjectives.push(new AcquireWaterContainer().keepInInventory());
				}

				// restart now in order to trigger StartWaterStillDesalination next time 
				waterStillObjectives.push(new Restart());

				objectivePipelines.push(waterStillObjectives);

			} else {
				const isWaitingForAll = waterAndSolarStills.every(doodad => context.utilities.doodad.isWaterStillDesalinating(doodad));
				if (isWaitingForAll) {
					if (context.utilities.player.isHealthy(context)) {
						if (context.base.waterStill.length < 3) {
							this.log.info("Building another water still while waiting");

							// build a water still while waiting
							objectivePipelines.push([
								new AcquireItemByGroup(ItemTypeGroup.WaterStill),
								new BuildItem(),
							]);

						} else if (context.base.solarStill.length < 2) {
							this.log.info("Building a solar still while waiting");

							// build a solar still while waiting
							objectivePipelines.push([
								new AcquireItem(ItemType.SolarStill),
								new BuildItem(),
							]);
						}
					}

				} else {
					for (const solarOrWaterStill of waterAndSolarStills) {
						if (context.utilities.doodad.isWaterStillDesalinating(solarOrWaterStill)) {
							continue;
						}

						const stillObjectives: IObjective[] = [];

						if (context.utilities.doodad.isWaterStillDrinkable(solarOrWaterStill)) {
							stillObjectives.push(new MoveToTarget(solarOrWaterStill, true));
							stillObjectives.push(new ExecuteAction(DrinkInFront, []));

						} else {
							stillObjectives.push(solarOrWaterStill.type === DoodadType.SolarStill ? new StartSolarStill(solarOrWaterStill) : new StartWaterStillDesalination(solarOrWaterStill));
						}

						objectivePipelines.push(stillObjectives);
					}
				}
			}
		}

		return objectivePipelines.length > 0 ? objectivePipelines : ObjectiveResult.Ignore;
	}
}
