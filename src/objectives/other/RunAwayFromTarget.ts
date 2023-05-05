import Entity from "game/entity/Entity";
import { Stat } from "game/entity/IStats";
import type { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import type Context from "../../core/context/Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import MoveToTarget from "../core/MoveToTarget";
import Tile from "game/tile/Tile";
const safetyCheckDistance = 5;
const safetyCheckDistanceSq = Math.pow(safetyCheckDistance, 2);

export default class RunAwayFromTarget extends Objective {

	constructor(private readonly target: Entity | IVector3, private readonly maxRunAwayDistance = 30) {
		super();
	}

	public getIdentifier(): string {
		return `RunAwayFromTarget:(${this.target.x},${this.target.y},${this.target.z}):${this.maxRunAwayDistance}`;
	}

	public getStatus(): string | undefined {
		return `Running away from ${this.target instanceof Entity ? this.target.getName() : `(${this.target.x},${this.target.y},${this.target.z})`}`;
	}

	public override isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const nearbyTilesDistance = this.maxRunAwayDistance;
		const nearbyTilesDistanceSq = Math.pow(nearbyTilesDistance, 2);

		const navigation = context.utilities.navigation;

		// get a list of all nearby tiles that are open
		const nearbyOpenTiles = context.human.tile.findMatchingTiles(
			(tile) => {
				const terrainDescription = tile.description;
				if (terrainDescription &&
					((!terrainDescription.passable && !terrainDescription.water) || (terrainDescription.water && context.human.stat.get(Stat.Stamina)!.value <= 1))) {
					return false;
				}

				if (navigation.isDisabled(tile)) {
					return false;
				}

				return true;
			},
			{
				canVisitTile: (nextTile) => Vector2.squaredDistance(context.human, nextTile) <= nearbyTilesDistanceSq,
			},
		);

		// tile positions with a safety score. lower number is better
		const tilesWithSafety: Array<[Tile, number]> = [];

		const scoreCache = new Map<string, number>();

		for (const nearbyOpenTile of nearbyOpenTiles) {
			const movementPath = await context.utilities.movement.getMovementPath(context, nearbyOpenTile, false);
			if (movementPath === ObjectiveResult.Complete || movementPath === ObjectiveResult.Impossible) {
				continue;
			}

			let score = 0;

			// farther end point is generally better
			const distance = Vector2.squaredDistance(context.human, nearbyOpenTile);
			score -= distance * 200;

			for (const point of movementPath.path) {
				const index = `${point.x},${point.y}`;

				let pointScore = scoreCache.get(index);
				if (pointScore === undefined) {
					pointScore = 0;

					const tile = context.island.getTileFromPoint({ ...point, z: context.human.z });

					pointScore += navigation.getPenalty(tile) * 10;

					// try to avoid paths that has blocking things
					if (tile.doodad?.blocksMove()) {
						pointScore += 2000;
					}

					const terrainDescription = tile.description;
					if (terrainDescription) {
						if (!terrainDescription.passable && !terrainDescription.water) {
							pointScore += 2000;
						}
					}

					// use this method to walk all tiles along the path to calculate a "safety" score
					tile.findMatchingTiles(
						(tile) => {
							pointScore! += navigation.getPenalty(tile);

							// creatures are scary
							// if (tile.creature !== undefined) {
							// 	pointScore! += 10000;
							// }

							// // add score for doodads and terrains because we would rather end up in an open area
							// if (tile.doodad?.blocksMove()) {
							// 	pointScore! += 100;
							// }

							// const terrainType = tile.type;
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
							canVisitTile: (nextTile) => Vector2.squaredDistance(point, nextTile) <= safetyCheckDistanceSq,
						},
					);

					scoreCache.set(index, pointScore);
				}

				score += pointScore;
			}

			tilesWithSafety.push([nearbyOpenTile, score]);
		}

		tilesWithSafety.sort((a, b) => a[1] - b[1]);

		// this.log.info("Points", pointsWithSafety);

		const objectives: IObjective[] = [];

		const bestTile = tilesWithSafety.length > 0 ? tilesWithSafety[0] : undefined;
		// console.log("move to", bestPoint);
		if (bestTile) {
			if (context.calculatingDifficulty) {
				// we have a valid run away position - return 0 difficulty so we'll definitely run this action
				return 0;
			}

			objectives.push(new MoveToTarget(bestTile[0], false, { disableStaminaCheck: true }).setStatus(this));

		} else {
			this.log.info("Unable to run away from target");
		}

		return objectives;
	}
}
