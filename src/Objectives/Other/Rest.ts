import { ActionType } from "game/entity/action/IAction";
import { WeightStatus } from "game/entity/player/IPlayer";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { creatureUtilities } from "../../utilities/Creature";
import { itemUtilities } from "../../utilities/Item";
import { playerUtilities } from "../../utilities/Player";
import { tileUtilities } from "../../utilities/Tile";
import ExecuteAction from "../core/ExecuteAction";
import ReduceWeight from "../interrupt/ReduceWeight";
import MoveToLand from "../utility/MoveToLand";

import Idle from "./Idle";
import RunAwayFromTarget from "./RunAwayFromTarget";

export default class Rest extends Objective {

	constructor(private readonly force: boolean = false) {
		super();
	}

	public getIdentifier(): string {
		return "Rest";
	}

	public getStatus(): string {
		return "Resting";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (tileUtilities.isSwimmingOrOverWater(context) && !playerUtilities.isUsingVehicle(context)) {
			return new MoveToLand();
		}

		const nearbyCreatures = creatureUtilities.getNearbyCreatures(context.player);
		if (nearbyCreatures.length > 0) {
			const nearbyCreature = nearbyCreatures[0];

			this.log.info(`Nearby creature ${nearbyCreature.getName(false).getString()} will prevent resting`);

			const objectivePipelines: IObjective[][] = [
				[new Idle(false)],
			];

			if (context.player.getWeightStatus() === WeightStatus.Overburdened) {
				if (this.force) {
					objectivePipelines.push([new ReduceWeight({ allowReservedItems: true }), new RunAwayFromTarget(nearbyCreature)]);
				}

			} else {
				objectivePipelines.push([new RunAwayFromTarget(nearbyCreature, 8)]);
			}

			// either run away or idle
			return objectivePipelines;
		}

		const item = itemUtilities.getInventoryItemsWithUse(context, ActionType.Rest)[0];
		if (item) {
			return new ExecuteAction(ActionType.Sleep, (context, action) => {
				action.execute(context.player, item);
				return ObjectiveResult.Complete;
			}).setStatus(this);
		}

		return new ExecuteAction(ActionType.Rest, (context, action) => {
			action.execute(context.player);
			return ObjectiveResult.Complete;
		}).setStatus(this);
	}

}
