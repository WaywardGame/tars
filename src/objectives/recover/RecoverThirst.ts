/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import { ActionType } from "game/entity/action/IAction";
import type { IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import DrinkInFront from "game/entity/action/actions/DrinkInFront";
import DrinkItem from "game/entity/action/actions/DrinkItem";
import Heal from "game/entity/action/actions/Heal";
import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AcquireItemForAction from "../acquire/item/AcquireItemForAction";
import ExecuteAction from "../core/ExecuteAction";
import MoveToTarget from "../core/MoveToTarget";
import BuildItem from "../other/item/BuildItem";
import Idle from "../other/Idle";
import UseItem from "../other/item/UseItem";
import RecoverStamina from "./RecoverStamina";
import AcquireWater from "../acquire/item/specific/AcquireWater";
import AddDifficulty from "../core/AddDifficulty";
import Restart from "../core/Restart";
import AcquireInventoryItem from "../acquire/item/AcquireInventoryItem";
import { freshWaterTileLocation } from "../../core/navigation/INavigation";
import MoveToBase from "../utility/moveTo/MoveToBase";
import StartWaterSourceDoodad from "../other/doodad/StartWaterSourceDoodad";

export interface IRecoverThirstOptions {
	onlyUseAvailableItems: boolean;
	exceededThreshold: boolean;
	onlyEmergencies: boolean;
}

export default class RecoverThirst extends Objective {

	public static isEmergency(context: Context) {
		const thirstStat = context.human.stat.get<IStatMax>(Stat.Thirst);
		return thirstStat.value <= 3 && context.utilities.base.getWaterSourceDoodads(context).every(doodad => !context.utilities.doodad.isWaterSourceDoodadDrinkable(doodad));
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

		const waterSourceDoodads = context.utilities.base.getWaterSourceDoodads(context);

		const health = context.human.stat.get<IStatMax>(Stat.Health);
		if (health.value > 4 || ((health.value / health.max) >= 0.7 && waterSourceDoodads.length === 0)) {
			// only risk drinking unpurified water if we have a lot of health or in an emergency
			const nearestFreshWater = context.utilities.tile.getNearestTileLocation(context, freshWaterTileLocation);

			for (const { tile } of nearestFreshWater) {
				const objectives: IObjective[] = [];

				objectives.push(new MoveToTarget(tile, true));

				objectives.push(new ExecuteAction(DrinkInFront, []));

				objectivePipelines.push(objectives);
			}
		}

		if (waterSourceDoodads.length > 0) {
			const isWaitingForAll = waterSourceDoodads.every(doodad => context.utilities.doodad.isWaterSourceDoodadBusy(doodad));
			if (isWaitingForAll) {
				if ((health.value / health.max) <= 0.3) {
					this.log.info("Making health items");

					for (const doodad of waterSourceDoodads) {
						objectivePipelines.push([
							new StartWaterSourceDoodad(doodad),
							new AcquireItemForAction(ActionType.Heal).keepInInventory(),
							new UseItem(Heal),
						]);
					}

				} else {
					this.log.info("Running back to wait for water");

					// todo: add max water still option? context.base.waterStill.length < 3 && 
					if (context.human.stat.get<IStatMax>(Stat.Stamina).value > 2) {
						this.log.info("Building another water source while waiting");

						if (!context.utilities.base.isNearBase(context)) {
							objectivePipelines.push([new MoveToBase()]);
						}

						// build a dripstone while waiting
						objectivePipelines.push([new AcquireInventoryItem("dripStone"), new BuildItem()]);


					} else {
						// run back to the water source and wait
						for (const doodad of waterSourceDoodads) {
							objectivePipelines.push([
								// new MoveToTarget(doodad, true, { range: 5 }),
								new StartWaterSourceDoodad(doodad),
								new Idle().setStatus(`Waiting for ${doodad.getName()} due to emergency`),
							]);
						}
					}
				}

			} else {
				for (const doodad of waterSourceDoodads) {
					if (context.utilities.doodad.isWaterSourceDoodadBusy(doodad) || context.utilities.doodad.isWaterSourceDoodadDrinkable(doodad)) {
						continue;
					}

					if (!context.utilities.doodad.isWaterSourceDoodadDrinkable(doodad)) {
						const stamina = context.human.stat.get<IStatMax>(Stat.Stamina);
						if ((stamina.value / stamina.max) < 0.9) {
							objectivePipelines.push([new RecoverStamina()]);

						} else {
							// wait for water source to finish
							objectivePipelines.push([
								// new MoveToTarget(doodad, true, { range: 5 }),
								new StartWaterSourceDoodad(doodad),
								new Idle().setStatus(`Waiting for ${doodad.getName()} due to emergency`),
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

				const waterSourceDoodads = context.utilities.base.getWaterSourceDoodads(context);
				for (const doodad of waterSourceDoodads) {
					// if we're near our base, the solar still is ready, and we're thirsty, go drink
					if (context.utilities.doodad.isWaterSourceDoodadDrinkable(doodad) && (thirstStat.max - thirstStat.value) >= 10) {
						this.log.info(`Near base, going to drink from a ${doodad}`);

						const difficulty = (doodad.type === DoodadType.SolarStill && doodad.isInGroup(DoodadTypeGroup.Dripstone)) ? -100 : 0;

						objectivePipelines.push([
							new AddDifficulty(difficulty),
							new MoveToTarget(doodad, true),
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
		const waterSourceDoodads = context.utilities.base.getWaterSourceDoodads(context);

		if (!RecoverThirst.isEmergency(context) && !context.utilities.base.isNearBase(context)) {
			const isDrinkableWaterAvailable = waterSourceDoodads.some(waterSourceDoodad => !context.utilities.doodad.isWaterSourceDoodadBusy(waterSourceDoodad) && context.utilities.doodad.isWaterSourceDoodadDrinkable(waterSourceDoodad));
			if (isDrinkableWaterAvailable) {
				// drinkable water is available at the base
				// don't go back to the base until we have too
				const thirst = context.human.stat.get(Stat.Thirst)!;
				const changeTimer = thirst.changeTimer;
				const nextChangeTimer = thirst.nextChangeTimer;
				if (changeTimer !== undefined && nextChangeTimer !== undefined) {
					const pathResult = context.utilities.navigation.findPath(context.utilities.base.getBaseTile(context));
					if (pathResult) {
						// note: assuming walk path is taking us away from the base
						let pathLength = pathResult.path.length + (context.human.walkPath?.path?.length ?? 0);

						// assume it takes twice as long to come back to the base
						pathLength *= 2;

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

			if (context.base.dripStone.length === 0) {
				const waterSourceObjectives: IObjective[] = [new AcquireInventoryItem("dripStone"), new BuildItem()];

				// restart now in order to trigger StartWaterSourceDoodad next time 
				waterSourceObjectives.push(new Restart());

				objectivePipelines.push(waterSourceObjectives);

			} else {
				const isWaitingForAll = waterSourceDoodads.every(doodad => context.utilities.doodad.isWaterSourceDoodadBusy(doodad));
				if (isWaitingForAll) {
					if (context.utilities.player.isHealthy(context) && context.utilities.base.isNearBase(context)) {
						if (context.base.dripStone.length < 3) {
							this.log.info("Building another drip stone while waiting");

							objectivePipelines.push([new AcquireInventoryItem("dripStone"), new BuildItem()]);

						} else if (context.base.waterStill.length < 3) {
							this.log.info("Building another water still while waiting");

							objectivePipelines.push([new AcquireInventoryItem("waterStill"), new BuildItem()]);

						} else if (context.base.solarStill.length < 2) {
							this.log.info("Building a solar still while waiting");

							objectivePipelines.push([new AcquireInventoryItem("solarStill"), new BuildItem()]);

						} else {
							// todo: option for this?
							// build another of whichever is easier
							objectivePipelines.push([new AcquireInventoryItem("dripStone"), new BuildItem()]);
							objectivePipelines.push([new AcquireInventoryItem("solarStill"), new BuildItem()]);
							objectivePipelines.push([new AcquireInventoryItem("waterStill"), new BuildItem()]);
						}
					}

				} else {
					for (const doodad of waterSourceDoodads) {
						if (context.utilities.doodad.isWaterSourceDoodadBusy(doodad)) {
							continue;
						}

						const waterSourceObjectives: IObjective[] = [];

						if (context.utilities.doodad.isWaterSourceDoodadDrinkable(doodad)) {
							waterSourceObjectives.push(new MoveToTarget(doodad, true));
							waterSourceObjectives.push(new ExecuteAction(DrinkInFront, []));

						} else {
							waterSourceObjectives.push(new StartWaterSourceDoodad(doodad));
						}

						objectivePipelines.push(waterSourceObjectives);
					}
				}
			}
		}

		return objectivePipelines.length > 0 ? objectivePipelines : ObjectiveResult.Ignore;
	}
}
