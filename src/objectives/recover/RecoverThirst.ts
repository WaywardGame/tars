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
import { freshWaterTileLocation } from "../../core/navigation/INavigation";
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

		if (!this.options.exceededThreshold) {
			return this.getBelowThresholdObjectives(context);
		}

		const objectivePipelines: IObjective[][] = [];

		if (context.inventory.waterContainer !== undefined) {
			const safeToDrinkWaterContainers = context.inventory.waterContainer.filter(waterContainer => context.utilities.item.isSafeToDrinkItem(waterContainer));
			for (const waterContainer of safeToDrinkWaterContainers) {
				this.log.info(`Can safely drink water from ${waterContainer}`);
				objectivePipelines.push([new UseItem(DrinkItem, waterContainer)]);
			}

			if (context.inventory.waterContainer.length !== safeToDrinkWaterContainers.length) {
				objectivePipelines.push([new AcquireWater({ onlySafeToDrink: true })]);
			}
		}

		if (this.options.onlyUseAvailableItems) {
			return objectivePipelines.length > 0 ? objectivePipelines : ObjectiveResult.Ignore;
		}

		if (context.base.waterStill.length === 0) {
			const waterStillObjectives: IObjective[] = [];

			if (context.inventory.waterStill !== undefined) {
				waterStillObjectives.push(new BuildItem(context.inventory.waterStill));
			}

			if (context.inventory.waterContainer === undefined) {
				waterStillObjectives.push(new AcquireWaterContainer().keepInInventory());
			}

			objectivePipelines.push(waterStillObjectives);

		} else {
			const waterAndSolarStills = context.base.waterStill.concat(context.base.solarStill);

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

		return objectivePipelines.length > 0 ? objectivePipelines : ObjectiveResult.Ignore;
	}

	private async getEmergencyObjectives(context: Context) {
		const objectivePipelines: IObjective[][] = [];

		const health = context.human.stat.get<IStatMax>(Stat.Health);
		if (health.value > 4 || ((health.value / health.max) >= 0.7 && context.base.waterStill.length === 0)) {
			// only risk drinking unpurified water if we have a lot of health or in an emergency
			const nearestFreshWater = await context.utilities.tile.getNearestTileLocation(context, freshWaterTileLocation);

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

					// run back to the waterstill and wait
					for (const waterStill of context.base.waterStill) {
						objectivePipelines.push([
							// new MoveToTarget(waterStill, true, { range: 5 }),
							new StartWaterStillDesalination(waterStill), // ensure the water still has enough fire to desalinate
							new Idle().setStatus("Waiting for water still due to emergency"),
						]);
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

	private getBelowThresholdObjectives(context: Context) {
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
				// 	const safeToDrinkWaterContainers = context.inventory.waterContainer.filter(waterContainer => context.utilities.item.isSafeToDrinkItem(waterContainer));
				// 	if (context.inventory.waterContainer.length !== safeToDrinkWaterContainers.length) {
				// 		objectivePipelines.push([new AcquireSafeWater()]);
				// 	}
				// }

				// if (context.inventory.waterContainer !== undefined) {
				// 	for (const waterContainer of context.inventory.waterContainer) {
				// 		if (context.utilities.item.isDrinkableItem(waterContainer) && !context.utilities.item.isSafeToDrinkItem(waterContainer)) {
				// 			// we have an unpurified container. try purifying it
				// 			objectivePipelines.push([new GatherWaterWithRecipe(waterContainer)]);
				// 		}
				// 	}
				// }
			}
		}

		return objectivePipelines.length > 0 ? objectivePipelines : ObjectiveResult.Ignore;
	}

}
