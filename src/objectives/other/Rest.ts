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
import { WeightStatus } from "game/entity/player/IPlayer";
import Extinguish from "game/entity/action/actions/Extinguish";
import Sleep from "game/entity/action/actions/Sleep";
import RestAction from "game/entity/action/actions/Rest";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import ExecuteAction from "../core/ExecuteAction";
import ReduceWeight from "../interrupt/ReduceWeight";
import MoveToLand from "../utility/moveTo/MoveToLand";
import Idle from "./Idle";
import RunAwayFromTarget from "./RunAwayFromTarget";
import Restart from "../core/Restart";

export default class Rest extends Objective {

	constructor(private readonly force: boolean = false) {
		super();
	}

	public getIdentifier(): string {
		return "Rest";
	}

	public getStatus(): string | undefined {
		return "Resting";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.utilities.tile.isSwimmingOrOverWater(context) && !context.utilities.player.isUsingVehicle(context)) {
			return new MoveToLand();
		}

		const nearbyCreatures = context.utilities.creature.getNearbyCreatures(context, 10);
		if (nearbyCreatures.length > 0) {
			const nearbyCreature = nearbyCreatures[0];

			this.log.info(`Nearby creature ${nearbyCreature.getName().getString()} will prevent resting`);

			const objectivePipelines: IObjective[][] = [
				[new Idle({ canMoveToIdle: false })],
			];

			if (context.human.getWeightStatus() === WeightStatus.Overburdened) {
				if (this.force) {
					objectivePipelines.push([new ReduceWeight({ allowReservedItems: true }), new RunAwayFromTarget(nearbyCreature), new Restart()]);
				}

			} else {
				objectivePipelines.push([new RunAwayFromTarget(nearbyCreature, 8), new Restart()]);
			}

			// either run away or idle
			return objectivePipelines;
		}

		const objectivePipeline: IObjective[] = [];

		const extinguishableItem = context.utilities.item.getInventoryItemsWithUse(context, ActionType.Extinguish)[0];
		if (extinguishableItem) {
			// don't set yourself on fire while sleeping
			objectivePipeline.push(new ExecuteAction(Extinguish, [extinguishableItem]));
		}

		const bed = context.inventory.bed;
		if (bed) {
			objectivePipeline.push(new ExecuteAction(Sleep, [bed]).setStatus(this));

		} else {
			objectivePipeline.push(new ExecuteAction(RestAction, []).setStatus(this));
		}

		return objectivePipeline;
	}

}
