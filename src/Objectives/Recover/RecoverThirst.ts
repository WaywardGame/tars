import { ActionType } from "entity/action/IAction";
import { IStatMax, Stat } from "entity/IStats";
import { ItemTypeGroup } from "item/IItem";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { freshWaterTileLocation } from "../../Navigation/INavigation";
import Objective from "../../Objective";
import { isNearBase } from "../../Utilities/Base";
import { isWaterStillDesalinating, isWaterStillDrinkable } from "../../Utilities/Doodad";
import { isDrinkableItem, isSafeToDrinkItem } from "../../Utilities/Item";
import { isHealthy } from "../../Utilities/Player";
import { getNearestTileLocation } from "../../Utilities/Tile";
import AcquireItemByGroup from "../Acquire/Item/AcquireItemByGroup";
import AcquireItemForAction from "../Acquire/Item/AcquireItemForAction";
import AcquireWaterContainer from "../Acquire/Item/Specific/AcquireWaterContainer";
import AnalyzeBase from "../Analyze/AnalyzeBase";
import ExecuteAction from "../Core/ExecuteAction";
import MoveToTarget from "../Core/MoveToTarget";
import BuildItem from "../Other/BuildItem";
import Idle from "../Other/Idle";
import StartWaterStillDesalination from "../Other/StartWaterStillDesalination";
import UseItem from "../Other/UseItem";

import RecoverStamina from "./RecoverStamina";

export default class RecoverThirst extends Objective {

	constructor(private readonly exceededThreshold: boolean) {
		super();
	}

	public getIdentifier(): string {
		return "RecoverThirst";
	}

	public getStatus(): string {
		return "Recovering thirst";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const thirstStat = context.player.stat.get<IStatMax>(Stat.Thirst);

		if (!this.exceededThreshold) {
			// todo: maybe remove this near base check?
			if (isNearBase(context)) {
				for (const waterStill of context.base.waterStill) {
					// if we're near our base, the water still is ready, and we're thirsty, go drink
					if (isWaterStillDrinkable(waterStill) && (thirstStat.max - thirstStat.value) >= 10) {
						this.log.info("Near base, going to drink from water still");

						return [
							new MoveToTarget(waterStill, true),
							new ExecuteAction(ActionType.DrinkInFront, (context, action) => {
								action.execute(context.player);
							}),
						];
					}
				}
			}

			return ObjectiveResult.Ignore;
		}

		const isEmergency = thirstStat.value <= 3 && context.base.waterStill.every(waterStill => !isWaterStillDrinkable(waterStill));

		const objectivePipelines: IObjective[][] = [];

		if (context.inventory.waterContainer !== undefined) {
			for (const waterContainer of context.inventory.waterContainer) {
				if (isDrinkableItem(waterContainer)) {
					if (isSafeToDrinkItem(waterContainer)) {
						this.log.info("Drink water from container");
						objectivePipelines.push([new UseItem(ActionType.DrinkItem, waterContainer)]);

					} else if (isEmergency && itemManager.isInGroup(waterContainer.type, ItemTypeGroup.ContainerOfUnpurifiedFreshWater)) {
						// emergency!
						this.log.info("Drink unpurified water from container");
						objectivePipelines.push([new UseItem(ActionType.DrinkItem, waterContainer)]);
					}
				}
			}
		}

		const health = context.player.stat.get<IStatMax>(Stat.Health);
		if ((isEmergency && health.value > 4) || ((health.value / health.max) >= 0.7 && context.base.waterStill.length === 0)) {
			// only risk drinking unpurified water if we have a lot of health or in an emergency
			const nearestFreshWater = await getNearestTileLocation(context, freshWaterTileLocation);

			for (const { point } of nearestFreshWater) {
				const objectives: IObjective[] = [];

				objectives.push(new MoveToTarget(point, true).addDifficulty(!isEmergency ? 500 : 0));

				objectives.push(new ExecuteAction(ActionType.DrinkInFront, (context, action) => {
					action.execute(context.player);
				}));

				objectivePipelines.push(objectives);
			}
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
			const isWaitingForAll = context.base.waterStill.every(isWaterStillDesalinating);
			if (isWaitingForAll) {
				if (isEmergency) {
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
								new Idle(),
							]);
						}
					}

				} else if (context.base.waterStill.length < 3 && isHealthy(context)) {
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
					if (isWaterStillDesalinating(waterStill)) {
						continue;
					}

					const waterStillObjectives: IObjective[] = [];

					const isWaterDrinkable = isWaterStillDrinkable(waterStill);

					const isEmergency = thirstStat.value <= 3 && !isWaterDrinkable;

					if (isWaterDrinkable) {
						waterStillObjectives.push(new MoveToTarget(waterStill, true));

						waterStillObjectives.push(new ExecuteAction(ActionType.DrinkInFront, (context, action) => {
							action.execute(context.player);
						}));

					} else {
						waterStillObjectives.push(new StartWaterStillDesalination(waterStill));

						if (isEmergency) {
							const stamina = context.player.stat.get<IStatMax>(Stat.Stamina);
							if ((stamina.value / stamina.max) < 0.9) {
								waterStillObjectives.push(new RecoverStamina());

							} else {
								// wait for water still to finish
								waterStillObjectives.push(new Idle());
							}
						}
					}

					objectivePipelines.push(waterStillObjectives);
				}
			}
		}

		return objectivePipelines;
	}

}
