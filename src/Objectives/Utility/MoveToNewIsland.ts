import { ActionType } from "game/entity/action/IAction";
import Island from "game/Island";
import { Direction } from "utilities/math/Direction";
import { IVector3 } from "utilities/math/IVector";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import ExecuteAction from "../Core/ExecuteAction";
import MoveToTarget from "../Core/MoveToTarget";

export default class MoveToNewIsland extends Objective {

	public getIdentifier(): string {
		return "MoveToNewIsland";
	}

	public getStatus(): string {
		return "Moving to a new island";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const unvisitedIslands: Array<{ islandId: string; edgePosition: IVector3; direction: Direction.Cardinal }> = [];

		for (const direction of Direction.CARDINALS) {
			const movement = game.directionToMovement(direction);

			const position = {
				x: island.position.x + movement.x,
				y: island.position.y + movement.y,
			};

			const islandId = Island.positionToId(position);
			if (!game.islands.has(islandId)) {
				const edgePosition: IVector3 = {
					x: Math.min(Math.max(context.player.x + (movement.x * game.mapSize), 0), game.mapSize - 1),
					y: Math.min(Math.max(context.player.y + (movement.y * game.mapSize), 0), game.mapSize - 1),
					z: context.player.z,
				};

				unvisitedIslands.push({
					islandId,
					edgePosition,
					direction,
				});
			}
		}

		if (unvisitedIslands.length === 0) {
			this.log.info("No unvisited islands");
			return ObjectiveResult.Impossible;
		}

		return unvisitedIslands.map(island => [
			new MoveToTarget(island.edgePosition, true, { allowBoat: true, disableStaminaCheck: true }),
			new ExecuteAction(ActionType.Move, (context, action) => {
				action.execute(context.player, island.direction);
			}),
		]);
	}

}
