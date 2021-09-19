import { Stat } from "game/entity/IStats";
import terrainDescriptions from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import Entity from "game/entity/Entity";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import Navigation from "../../navigation/Navigation";
import Objective from "../../Objective";
import { movementUtilities } from "../../utilities/Movement";
import MoveToTarget from "../core/MoveToTarget";

const safetyCheckDistance = 5;
const safetyCheckDistanceSq = Math.pow(safetyCheckDistance, 2);

export default class RunAwayFromTarget extends Objective {

	constructor(private readonly target: Entity | IVector3, private readonly maxRunAwayDistance = 20) {
		super();
	}

	public getIdentifier(): string {
		return `RunAwayFromTarget:(${this.target.x},${this.target.y},${this.target.z})`;
	}

	public getStatus(): string | undefined {
		return `Running away from ${this.target instanceof Entity ? this.target.getName() : `(${this.target.x},${this.target.y},${this.target.z})`}`;
	}

	public isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const nearbyTilesDistance = this.maxRunAwayDistance;
		const nearbyTilesDistanceSq = Math.pow(nearbyTilesDistance, 2);

		const navigation = Navigation.get();

		// get a list of all nearby tiles that are open
		const nearbyOpenTiles = TileHelpers.findMatchingTiles(
			context.player,
			(point, tile) => {
				const terrainType = TileHelpers.getType(tile);
				const terrainDescription = terrainDescriptions[terrainType];
				if (terrainDescription &&
					((!terrainDescription.passable && !terrainDescription.water) || (terrainDescription.water && context.player.stat.get(Stat.Stamina)!.value <= 1))) {
					return false;
				}

				if (navigation.isDisabledFromPoint(point)) {
					return false;
				}

				return true;
			},
			{
				canVisitTile: (nextPoint) => Vector2.squaredDistance(context.player, nextPoint) <= nearbyTilesDistanceSq,
			},
		);

		// tile positions with a safety score. lower number is better
		const pointsWithSafety: Array<[IVector3, number]> = [];

		const scoreCache = new Map<string, number>();

		for (const nearbyOpenTile of nearbyOpenTiles) {
			const movementPath = await movementUtilities.getMovementPath(context, nearbyOpenTile.point, false);
			if (!movementPath.path) {
				continue;
			}

			let score = 0;

			// farther end point is generally better
			const distance = Vector2.squaredDistance(context.player, nearbyOpenTile.point);
			score -= distance * 200;

			for (const point of movementPath.path) {
				const index = `${point.x},${point.y}`;

				let pointScore = scoreCache.get(index);
				if (pointScore === undefined) {
					pointScore = 0;

					const pointZ = { ...point, z: context.player.z };

					pointScore += navigation.getPenaltyFromPoint(pointZ) * 10;

					// try to avoid paths that has blocking things
					const tile = game.getTileFromPoint(pointZ);
					if (tile.doodad?.blocksMove()) {
						pointScore! += 2000;
					}

					const terrainType = TileHelpers.getType(tile);
					const terrainDescription = terrainDescriptions[terrainType];
					if (terrainDescription) {
						if (!terrainDescription.passable && !terrainDescription.water) {
							pointScore! += 2000;
						}
					}

					// use this method to walk all tiles along the path to calculate a "safety" score
					TileHelpers.findMatchingTiles(
						pointZ,
						(point, tile) => {
							pointScore! += navigation.getPenaltyFromPoint(point, tile);

							// creatures are scary
							// if (tile.creature !== undefined) {
							// 	pointScore! += 10000;
							// }

							// // add score for doodads and terrains because we would rather end up in an open area
							// if (tile.doodad?.blocksMove()) {
							// 	pointScore! += 100;
							// }

							// const terrainType = TileHelpers.getType(tile);
							// const terrainDescription = terrainDescriptions[terrainType];
							// if (terrainDescription) {
							// 	if (!terrainDescription.passable && !terrainDescription.water) {
							// 		pointScore! += 100;
							// 	}

							// 	// don't run into the water
							// 	if (terrainDescription.water) {
							// 		pointScore! += 1000;
							// 	}
							// }

							return true;
						},
						{
							canVisitTile: (nextPoint) => Vector2.squaredDistance(point, nextPoint) <= safetyCheckDistanceSq,
						},
					);

					scoreCache.set(index, pointScore);
				}

				score += pointScore;
			}

			pointsWithSafety.push([nearbyOpenTile.point, score]);
		}

		pointsWithSafety.sort((a, b) => a[1] - b[1]);

		// this.log.info("Points", pointsWithSafety);

		const objectives: IObjective[] = [];

		const bestPoint = pointsWithSafety.length > 0 ? pointsWithSafety[0] : undefined;
		// console.log("move to", bestPoint);
		if (bestPoint) {
			if (context.calculatingDifficulty) {
				// we have a valid run away position - return 0 difficulty so we'll definitely run this action
				return 0;
			}

			objectives.push(new MoveToTarget(bestPoint[0], false, { disableStaminaCheck: true }).setStatus(this));

		} else {
			this.log.info("Unable to run away from target");
		}

		return objectives;
	}
}
