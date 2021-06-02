import { ActionType } from "game/entity/action/IAction";
import { IStatMax, Stat } from "game/entity/IStats";
import { ItemTypeGroup } from "game/item/IItem";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { freshWaterTileLocation } from "../../navigation//INavigation";
import Objective from "../../Objective";
import AcquireItemByGroup from "../acquire/item/AcquireItemByGroup";
import AcquireItemForAction from "../acquire/item/AcquireItemForAction";
import AcquireWaterContainer from "../acquire/item/specific/AcquireWaterContainer";
import AnalyzeBase from "../analyze/AnalyzeBase";
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
import { playerUtilities } from "../../utilities/Player";
import { itemUtilities } from "../../utilities/Item";

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
			if (baseUtilities.isNearBase(context)) {
				for (const waterStill of context.base.waterStill) {
					// if we're near our base, the water still is ready, and we're thirsty, go drink
					if (doodadUtilities.isWaterStillDrinkable(waterStill) && (thirstStat.max - thirstStat.value) >= 10) {
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

		const isEmergency = thirstStat.value <= 3 && context.base.waterStill.every(waterStill => !doodadUtilities.isWaterStillDrinkable(waterStill));

		const objectivePipelines: IObjective[][] = [];

		if (context.inventory.waterContainer !== undefined) {
			for (const waterContainer of context.inventory.waterContainer) {
				if (itemUtilities.isDrinkableItem(waterContainer)) {
					if (itemUtilities.isSafeToDrinkItem(waterContainer)) {
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
			const nearestFreshWater = await tileUtilities.getNearestTileLocation(context, freshWaterTileLocation);

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
			const isWaitingForAll = context.base.waterStill.every(doodad => doodadUtilities.isWaterStillDesalinating(doodad));
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

				} else if (context.base.waterStill.length < 3 && playerUtilities.isHealthy(context)) {
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

					const isWaterDrinkable = doodadUtilities.isWaterStillDrinkable(waterStill);

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
