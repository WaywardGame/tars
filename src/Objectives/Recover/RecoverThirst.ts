import { ActionType } from "game/entity/action/IAction";
import { IStatMax, Stat } from "game/entity/IStats";
import { ItemTypeGroup } from "game/item/IItem";

import Context from "../../core/context/Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../core/objective/IObjective";
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

import RecoverStamina from "./RecoverStamina";
import { tileUtilities } from "../../utilities/Tile";
import { baseUtilities } from "../../utilities/Base";
import { doodadUtilities } from "../../utilities/Doodad";
import { itemUtilities } from "../../utilities/Item";
import GatherWaterWithRecipe from "../gather/GatherWaterWithRecipe";
import { playerUtilities } from "../../utilities/Player";
import AcquireItemByGroup from "../acquire/item/AcquireItemByGroup";
import AnalyzeBase from "../analyze/AnalyzeBase";

export interface IRecoverThirstOptions {
	onlyUseAvailableItems: boolean;
	exceededThreshold: boolean;
	onlyEmergencies: boolean;
}

export default class RecoverThirst extends Objective {

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
			return this.getEmergencyObjectives(context);
		}

		if (!this.options.exceededThreshold) {
			return this.getBelowThresholdObjectives(context);
		}

		const objectivePipelines: IObjective[][] = [];

		if (context.inventory.waterContainer !== undefined) {
			for (const waterContainer of context.inventory.waterContainer) {
				if (itemUtilities.isDrinkableItem(waterContainer)) {
					if (itemUtilities.isSafeToDrinkItem(waterContainer)) {
						this.log.info("Drink water from container");
						objectivePipelines.push([new UseItem(ActionType.DrinkItem, waterContainer)]);

					} else {
						// try getting purified water
						objectivePipelines.push([new GatherWaterWithRecipe(waterContainer)]);
					}
				}
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
				waterStillObjectives.push(new AcquireWaterContainer());
			}

			objectivePipelines.push(waterStillObjectives);

		} else {
			const isWaitingForAll = context.base.waterStill.every(doodad => doodadUtilities.isWaterStillDesalinating(doodad));
			if (isWaitingForAll) {
				if (context.base.waterStill.length < 3 && playerUtilities.isHealthy(context)) {
					this.log.info("Building another water still while waiting");

					// build another water still wait waiting
					objectivePipelines.push([
						new AcquireItemByGroup(ItemTypeGroup.WaterStill),
						new BuildItem(),
						new AnalyzeBase(),
					]);
				}

			} else {
				for (const waterStill of context.base.waterStill) {
					if (doodadUtilities.isWaterStillDesalinating(waterStill)) {
						continue;
					}

					const waterStillObjectives: IObjective[] = [];

					if (doodadUtilities.isWaterStillDrinkable(waterStill)) {
						waterStillObjectives.push(new MoveToTarget(waterStill, true));

						waterStillObjectives.push(new ExecuteAction(ActionType.DrinkInFront, (context, action) => {
							action.execute(context.player);
							return ObjectiveResult.Complete;
						}));

					} else {
						waterStillObjectives.push(new StartWaterStillDesalination(waterStill));
					}

					objectivePipelines.push(waterStillObjectives);
				}
			}
		}

		return objectivePipelines;
	}

	private async getEmergencyObjectives(context: Context) {
		const thirstStat = context.player.stat.get<IStatMax>(Stat.Thirst);

		const isEmergency = thirstStat.value <= 3 && context.base.waterStill.every(waterStill => !doodadUtilities.isWaterStillDrinkable(waterStill));
		if (!isEmergency) {
			return ObjectiveResult.Ignore;
		}

		const objectivePipelines: IObjective[][] = [];

		const health = context.player.stat.get<IStatMax>(Stat.Health);
		if ((isEmergency && health.value > 4) || ((health.value / health.max) >= 0.7 && context.base.waterStill.length === 0)) {
			// only risk drinking unpurified water if we have a lot of health or in an emergency
			const nearestFreshWater = await tileUtilities.getNearestTileLocation(context, freshWaterTileLocation);

			for (const { point } of nearestFreshWater) {
				const objectives: IObjective[] = [];

				objectives.push(new MoveToTarget(point, true).addDifficulty(!isEmergency ? 500 : 0));

				objectives.push(new ExecuteAction(ActionType.DrinkInFront, (context, action) => {
					action.execute(context.player);
					return ObjectiveResult.Complete;
				}));

				objectivePipelines.push(objectives);
			}
		}

		if (context.base.waterStill.length > 0) {
			const isWaitingForAll = context.base.waterStill.every(doodad => doodadUtilities.isWaterStillDesalinating(doodad));
			if (isWaitingForAll) {
				if ((health.value / health.max) <= 0.3) {
					this.log.info("Making health items");

					for (const waterStill of context.base.waterStill) {
						objectivePipelines.push([
							new StartWaterStillDesalination(waterStill), // ensure the water still has enough fire to desalinate
							new AcquireItemForAction(ActionType.Heal),
							new UseItem(ActionType.Heal),
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
					if (doodadUtilities.isWaterStillDesalinating(waterStill) || doodadUtilities.isWaterStillDrinkable(waterStill)) {
						continue;
					}

					if (!doodadUtilities.isWaterStillDrinkable(waterStill)) {
						if (isEmergency) {
							const stamina = context.player.stat.get<IStatMax>(Stat.Stamina);
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
		}

		return objectivePipelines;
	}

	private getBelowThresholdObjectives(context: Context) {
		const objectivePipelines: IObjective[][] = [];

		if (!this.options.onlyUseAvailableItems) {
			// todo: maybe remove this near base check?
			if (baseUtilities.isNearBase(context)) {
				const thirstStat = context.player.stat.get<IStatMax>(Stat.Thirst);

				for (const waterStill of context.base.waterStill) {
					// if we're near our base, the water still is ready, and we're thirsty, go drink
					if (doodadUtilities.isWaterStillDrinkable(waterStill) && (thirstStat.max - thirstStat.value) >= 10) {
						this.log.info("Near base, going to drink from water still");

						objectivePipelines.push([
							new MoveToTarget(waterStill, true),
							new ExecuteAction(ActionType.DrinkInFront, (context, action) => {
								action.execute(context.player);
								return ObjectiveResult.Complete;
							}),
						]);
					}
				}

				if (context.inventory.waterContainer !== undefined) {
					for (const waterContainer of context.inventory.waterContainer) {
						if (itemUtilities.isDrinkableItem(waterContainer) && !itemUtilities.isSafeToDrinkItem(waterContainer)) {
							// we have an unpurified container. try purifying it
							objectivePipelines.push([new GatherWaterWithRecipe(waterContainer)]);
						}
					}
				}
			}
		}

		return objectivePipelines.length > 0 ? objectivePipelines : ObjectiveResult.Ignore;
	}

}
