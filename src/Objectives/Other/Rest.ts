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
		if (tileUtilities.isSwimmingOrOverWater(context) && !playerUtilities.isUsingVehicle(context)) {
			return new MoveToLand();
		}

		const nearbyCreatures = creatureUtilities.getNearbyCreatures(context);
		if (nearbyCreatures.length > 0) {
			const nearbyCreature = nearbyCreatures[0];

			this.log.info(`Nearby creature ${nearbyCreature.getName().getString()} will prevent resting`);

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

		const objectivePipeline: IObjective[] = [];

		const extinguishableItem = itemUtilities.getInventoryItemsWithUse(context, ActionType.Extinguish)[0];
		if (extinguishableItem) {
			// don't set yourself on fire while sleeping
			objectivePipeline.push(new ExecuteAction(ActionType.Extinguish, (context, action) => {
				action.execute(context.player, extinguishableItem);
				return ObjectiveResult.Complete;
			}));
		}

		const bed = context.inventory.bed;
		if (bed) {
			objectivePipeline.push(new ExecuteAction(ActionType.Sleep, (context, action) => {
				action.execute(context.player, bed);
				return ObjectiveResult.Complete;
			}).setStatus(this));

		} else {
			objectivePipeline.push(new ExecuteAction(ActionType.Rest, (context, action) => {
				action.execute(context.player);
				return ObjectiveResult.Complete;
			}).setStatus(this));
		}

		return objectivePipeline;
	}

}
