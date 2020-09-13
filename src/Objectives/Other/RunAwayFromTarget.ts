import { ActionType } from "entity/action/IAction";
import { Stat } from "entity/IStats";
import { getDirectionFromMovement } from "entity/player/IPlayer";
import terrainDescriptions from "tile/Terrains";
import { Direction } from "utilities/math/Direction";
import Vector2 from "utilities/math/Vector2";
import TileHelpers from "utilities/TileHelpers";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import Navigation from "../../Navigation/Navigation";
import Objective from "../../Objective";
import ExecuteAction from "../Core/ExecuteAction";

export default class RunAwayFromTarget extends Objective {

	constructor(private readonly target: IVector3) {
		super();
	}

	public getIdentifier(): string {
		return `RunAwayFromTarget:(${this.target.x},${this.target.y},${this.target.z})`;
	}

	public isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const navigation = Navigation.get();
		const validPoints = navigation.getValidPoints(context.player, false)
			.filter(point => {
				const tile = game.getTileFromPoint(point);

				if (tile.creature !== undefined || (tile.doodad !== undefined && tile.doodad.blocksMove())) {
					return false;
				}

				const terrainType = TileHelpers.getType(tile);
				const terrainDescription = terrainDescriptions[terrainType];
				if (terrainDescription &&
					((!terrainDescription.passable && !terrainDescription.water) || (terrainDescription.water && context.player.stat.get(Stat.Stamina)!.value <= 1))) {
					return false;
				}

				return true;
			})
			.sort((pointA, pointB) => {
				const scoreA = navigation.getPenaltyFromPoint(pointA);
				const scoreB = navigation.getPenaltyFromPoint(pointB);

				if (scoreA > scoreB) {
					return 1;
				}

				if (scoreA < scoreB) {
					return -1;
				}

				return Vector2.squaredDistance(pointA, this.target) < Vector2.squaredDistance(pointB, this.target) ? 1 : -1;
			});

		this.log.info("Valid points", validPoints);

		const objectives: IObjective[] = [];

		const bestPoint = validPoints.length > 0 ? validPoints[0] : undefined;
		if (bestPoint) {
			if (context.calculatingDifficulty) {
				// we have a valid run away position - return 0 difficulty so we'll definitely run this action
				return 0;
			}

			const direction = getDirectionFromMovement(bestPoint.x - context.player.x, bestPoint.y - context.player.y);

			this.log.info(`Running away ${Direction[direction]}`);

			if (direction !== context.player.facingDirection) {
				objectives.push(new ExecuteAction(ActionType.UpdateDirection, (context, action) => {
					action.execute(context.player, direction, undefined);
				}));
			}

			objectives.push(new ExecuteAction(ActionType.Move, (context, action) => {
				action.execute(context.player, direction);
			}));

		} else {
			this.log.info("Unable to run away from target");
		}

		return objectives;
	}
}