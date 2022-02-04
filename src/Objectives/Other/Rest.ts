import { ActionType } from "game/entity/action/IAction";
import { WeightStatus } from "game/entity/player/IPlayer";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { creatureUtilities } from "../../utilities/Creature";
import ExecuteAction from "../core/ExecuteAction";
import ReduceWeight from "../interrupt/ReduceWeight";
import MoveToLand from "../utility/moveTo/MoveToLand";

import Idle from "./Idle";
import RunAwayFromTarget from "./RunAwayFromTarget";

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
		const player = context.human.asPlayer;
		if (!player) {
			return ObjectiveResult.Impossible;
		}

		if (context.utilities.tile.isSwimmingOrOverWater(context) && !context.utilities.player.isUsingVehicle(context)) {
			return new MoveToLand();
		}

		const nearbyCreatures = creatureUtilities.getNearbyCreatures(context);
		if (nearbyCreatures.length > 0) {
			const nearbyCreature = nearbyCreatures[0];

			this.log.info(`Nearby creature ${nearbyCreature.getName().getString()} will prevent resting`);

			const objectivePipelines: IObjective[][] = [
				[new Idle(false)],
			];

			if (context.human.getWeightStatus() === WeightStatus.Overburdened) {
				if (this.force) {
					objectivePipelines.push([new ReduceWeight({ allowReservedItems: true }), new RunAwayFromTarget(nearbyCreature)]);
				}

			} else {
				objectivePipelines.push([new RunAwayFromTarget(nearbyCreature, 8)]);
			}

			// either run away or idle
			return objectivePipelines;
		}

		const objectivePipeline: IObjective[] = [];

		const extinguishableItem = context.utilities.item.getInventoryItemsWithUse(context, ActionType.Extinguish)[0];
		if (extinguishableItem) {
			// don't set yourself on fire while sleeping
			objectivePipeline.push(new ExecuteAction(ActionType.Extinguish, (context, action) => {
				action.execute(context.actionExecutor, extinguishableItem);
				return ObjectiveResult.Complete;
			}));
		}

		const bed = context.inventory.bed;
		if (bed) {
			objectivePipeline.push(new ExecuteAction(ActionType.Sleep, (context, action) => {
				action.execute(player, bed);
				return ObjectiveResult.Complete;
			}).setStatus(this));

		} else {
			objectivePipeline.push(new ExecuteAction(ActionType.Rest, (context, action) => {
				action.execute(player);
				return ObjectiveResult.Complete;
			}).setStatus(this));
		}

		return objectivePipeline;
	}

}
