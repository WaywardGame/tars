import { ActionType } from "game/entity/action/IAction";
import { Stat } from "game/entity/IStats";
import { getDirectionFromMovement } from "game/entity/player/IPlayer";
import terrainDescriptions from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
import { Direction } from "utilities/math/Direction";
import Vector2 from "utilities/math/Vector2";

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

	public getStatus(): string {
		return "Running away";
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
				const delta = navigation.getPenaltyFromPoint(pointA) - navigation.getPenaltyFromPoint(pointB);
				if (delta !== 0) {
					return delta;
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

			objectives.push(new ExecuteAction(ActionType.Move, (context, action) => {
				action.execute(context.player, direction);
			}).setStatus(this));

		} else {
			this.log.info("Unable to run away from target");
		}

		return objectives;
	}
}
