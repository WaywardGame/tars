import { ActionType } from "entity/action/IAction";
import { IStat, IStatMax, Stat } from "entity/IStats";
import { TurnMode } from "game/IGame";
import { ItemTypeGroup } from "item/IItem";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { freshWaterTileLocation } from "../../Navigation/INavigation";
import Objective from "../../Objective";
import { isNearBase } from "../../Utilities/Base";
import { canDrinkItem } from "../../Utilities/Item";
import { getNearestTileLocation } from "../../Utilities/Tile";
import AcquireWaterContainer from "../Acquire/Item/Specific/AcquireWaterContainer";
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

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const thirst = context.player.stat.get<IStatMax>(Stat.Thirst);

		const waterStill = context.base.waterStill[0];

		if (!this.exceededThreshold) {
			// if we're near our base, the water still is ready, and we're thirsty, go drink
			if (isNearBase(context) && waterStill !== undefined && waterStill.gatherReady !== undefined && waterStill.gatherReady <= 0 && (thirst.max - thirst.value) >= 10) {
				this.log.info("Near base, going to drink from water still");

				return [
					new MoveToTarget(waterStill, true),
					new ExecuteAction(ActionType.DrinkInFront, (context, action) => {
						action.execute(context.player);
					}),
				];
			}

			return ObjectiveResult.Ignore;
		}

		const isEmergency = thirst.value <= 3 && (!waterStill || waterStill.gatherReady === undefined || (waterStill.gatherReady !== undefined && waterStill.gatherReady > 0));

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

		// look for nearby freshwater

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

		const waterStillObjectives: IObjective[] = [];

		if (waterStill !== undefined) {
			const isEmergency = context.player.stat.get<IStat>(Stat.Thirst).value <= 3 && (!waterStill || waterStill.gatherReady === undefined || (waterStill.gatherReady !== undefined && waterStill.gatherReady > 0));

			if (waterStill.gatherReady !== undefined && waterStill.gatherReady <= 0) {
				waterStillObjectives.push(new MoveToTarget(waterStill, true));

				waterStillObjectives.push(new ExecuteAction(ActionType.DrinkInFront, (context, action) => {
					action.execute(context.player);
				}));

			} else {
				waterStillObjectives.push(new StartWaterStillDesalination(waterStill));

				if (isEmergency) {
					// run back to the waterstill and wait
					waterStillObjectives.push(new MoveToTarget(waterStill, true));

					const stamina = context.player.stat.get<IStatMax>(Stat.Stamina);
					if ((stamina.value / stamina.max) < 0.9) {
						waterStillObjectives.push(new RecoverStamina());

					} else if (game.getTurnMode() !== TurnMode.RealTime) {
						waterStillObjectives.push(new Idle());
					}
				}
			}

		} else {
			if (context.inventory.waterStill !== undefined) {
				waterStillObjectives.push(new BuildItem(context.inventory.waterStill));
			}

			if (context.inventory.waterContainer === undefined) {
				waterStillObjectives.push(new AcquireWaterContainer());
			}
		}

		objectivePipelines.push(waterStillObjectives);

		return objectivePipelines;
	}

}
