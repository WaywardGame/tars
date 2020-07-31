import { ActionType } from "entity/action/IAction";
import { IStatMax, Stat } from "entity/IStats";
import { ItemTypeGroup } from "item/IItem";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { freshWaterTileLocation } from "../../Navigation/INavigation";
import Objective from "../../Objective";
import { isNearBase } from "../../Utilities/Base";
import { isWaterStillDesalinating, isWaterStillDrinkable } from "../../Utilities/Doodad";
import { canDrinkItem } from "../../Utilities/Item";
import { getNearestTileLocation } from "../../Utilities/Tile";
import AcquireItemByGroup from "../Acquire/Item/AcquireItemByGroup";
import AcquireWaterContainer from "../Acquire/Item/Specific/AcquireWaterContainer";
import AnalyzeBase from "../Analyze/AnalyzeBase";
import ExecuteAction from "../Core/ExecuteAction";
import Lambda from "../Core/Lambda";
import MoveToTarget from "../Core/MoveToTarget";
import BuildItem from "../Other/BuildItem";
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

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const thirstStat = context.player.stat.get<IStatMax>(Stat.Thirst);

		if (!this.exceededThreshold) {
			// todo: maybe remove this near base check?
			if (isNearBase(context)) {
				for (const waterStill of context.base.waterStill) {
					// if we're near our base, the water still is ready, and we're thirsty, go drink
					if (waterStill !== undefined && waterStill.gatherReady !== undefined && waterStill.gatherReady <= 0 && (thirstStat.max - thirstStat.value) >= 10) {
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
			if (canDrinkItem(context.inventory.waterContainer)) {
				if (itemManager.isInGroup(context.inventory.waterContainer.type, ItemTypeGroup.ContainerOfMedicinalWater) ||
					itemManager.isInGroup(context.inventory.waterContainer.type, ItemTypeGroup.ContainerOfDesalinatedWater) ||
					itemManager.isInGroup(context.inventory.waterContainer.type, ItemTypeGroup.ContainerOfPurifiedFreshWater)) {
					this.log.info("Drink water from container");
					objectivePipelines.push([new UseItem(ActionType.DrinkItem, context.inventory.waterContainer)]);
				}

				if (isEmergency && itemManager.isInGroup(context.inventory.waterContainer.type, ItemTypeGroup.ContainerOfUnpurifiedFreshWater)) {
					// emergency!
					this.log.info("Drink unpurified water from container");
					objectivePipelines.push([new UseItem(ActionType.DrinkItem, context.inventory.waterContainer)]);
				}
			}
		}

		const health = context.player.stat.get<IStatMax>(Stat.Health);
		if (isEmergency || (health.value / health.max) >= 0.7) {
			// only risk drinking unpurified water if we have a lot of health or in an emergency
			const nearestFreshWater = await getNearestTileLocation(freshWaterTileLocation, context.player);

			for (const { point } of nearestFreshWater) {
				const objectives: IObjective[] = [];

				objectives.push(new MoveToTarget(point, true).addDifficulty(!isEmergency ? 100 : 0));

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
				if (context.base.waterStill.length < 3 && thirstStat.value > 5) {
					// build another water still wait waiting
					objectivePipelines.push([
						new AcquireWaterContainer(),
						new AcquireItemByGroup(ItemTypeGroup.WaterStill),
						new BuildItem(),
						new AnalyzeBase(),
					]);

				} else {
					// run back to the waterstill and wait
					for (const waterStill of context.base.waterStill) {
						objectivePipelines.push([new MoveToTarget(waterStill, true)]);
					}
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
								// build another water still wait waiting

								// waterStillObjectives.push(new AcquireItemByGroup(ItemTypeGroup.WaterStill));
								// waterStillObjectives.push(new BuildItem());
								// waterStillObjectives.push(new AnalyzeBase());
								// run back to the waterstill and wait
								// waterStillObjectives.push(new MoveToTarget(waterStill, true));
								// waterStillObjectives.push(new SetContextData(ContextDataType.WaitingForWaterStill, true));

								waterStillObjectives.push(new Lambda(async (context, lambda) => {
									lambda.log.info("Waiting for water still");
									return ObjectiveResult.Restart;
								}));

								// if (
								// 	game.getTurnMode() === TurnMode.RealTime ||
								// 	game.nextTickTime === 0 ||
								// 	(game.lastTickTime !== undefined && (game.lastTickTime + (game.getTickSpeed() * game.interval) + 200) > game.absoluteTime)) {
								// 	// don't idle in realtime mode or in simulated mode if the turns are ticking still. +200ms buffer for ping
								// 	waterStillObjectives.push(new Lambda(async (context, lambda) => {
								// 		lambda.log.info("Waiting for water still");
								// 		return ObjectiveResult.Restart;
								// 	}));
								// } else {
								// 	waterStillObjectives.push(new Idle());
								// }
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
