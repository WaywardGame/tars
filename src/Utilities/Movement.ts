import { ActionType } from "entity/action/IAction";
import { DamageType } from "entity/IEntity";
import { getDirectionFromMovement } from "entity/player/IPlayer";
import { RenderSource } from "game/IGame";
import PathOverlayFootPrints from "newui/screen/screens/game/util/movement/PathOverlayFootPrints";
import { IOverlayInfo, ITile, TerrainType } from "tile/ITerrain";
import Terrains from "tile/Terrains";
import { Direction } from "utilities/math/Direction";
import { IVector2, IVector3 } from "utilities/math/IVector";
import TileHelpers from "utilities/TileHelpers";

import Context from "../Context";
import { ObjectiveResult } from "../IObjective";
import { NavigationPath } from "../Navigation/INavigation";
import Navigation from "../Navigation/Navigation";

import { executeAction } from "./Action";
import { getBestActionItem, getInventoryItemsWithUse } from "./Item";
import { log } from "./Logger";
import { hasCorpses } from "./Tile";

export interface IMovementPath {
	difficulty: number;
	path?: IVector2[];
}

export enum MoveResult {
	NoTarget,
	NoPath,
	Moving,
	Complete,
}

interface ITrackedOverlay {
	tile: ITile;
	overlay: IOverlayInfo;
}

const movementOverlays: ITrackedOverlay[] = [];

export function resetMovementOverlays() {
	for (const trackedOverlay of movementOverlays) {
		TileHelpers.Overlay.remove(trackedOverlay.tile, trackedOverlay.overlay);
	}

	movementOverlays.length = 0;

	if (game.playing) {
		game.updateView(RenderSource.Mod, false);
	}
}

export function clearOverlay(tile: ITile) {
	const trackedOverlay = movementOverlays.find(tracked => tracked.tile === tile);
	if (trackedOverlay !== undefined) {
		TileHelpers.Overlay.remove(tile, trackedOverlay.overlay);
	}
}

export function updateOverlay(path: IVector2[]) {
	resetMovementOverlays();

	for (let i = 1; i < path.length; i++) {
		const lastPos = path[i - 1];
		const pos = path[i];
		const nextPos: IVector2 | undefined = path[i + 1];

		const tile = game.getTile(pos.x, pos.y, localPlayer.z);

		const overlay = PathOverlayFootPrints(i, path.length, pos, lastPos, nextPos, false);
		if (overlay) {
			TileHelpers.Overlay.add(tile, overlay);
			movementOverlays.push({
				tile: tile,
				overlay: overlay,
			});
		}
	}
}

const cachedPaths: Map<string, NavigationPath | undefined> = new Map();

export function resetCachedPaths() {
	cachedPaths.clear();
}

export async function getMovementPath(context: Context, target: IVector3, moveAdjacentToTarget: boolean): Promise<IMovementPath> {
	if (context.player.x === target.x && context.player.y === target.y && context.player.z === target.z && !moveAdjacentToTarget) {
		return {
			difficulty: 0,
		};
	}

	const pathId = `${target.x},${target.y},${target.z}:${moveAdjacentToTarget ? "A" : "O"}`;

	let movementPath: NavigationPath | undefined;

	if (cachedPaths.has(pathId)) {
		movementPath = cachedPaths.get(pathId);

	} else {
		const navigation = Navigation.get();

		const ends = navigation.getValidPoints(target, !moveAdjacentToTarget);
		if (ends.length === 0) {
			return {
				difficulty: ObjectiveResult.Impossible,
			};
		}

		for (const end of ends) {
			if (context.player.x === end.x && context.player.y === end.y && context.player.z === end.z) {
				return {
					difficulty: 0,
				};
			}
		}

		const origin = navigation.getOrigin();
		if (origin.x !== context.player.x || origin.y !== context.player.y || origin.z !== context.player.z) {
			log.warn("Updating origin immediately due to mismatch", origin, context.player.getPoint());
			navigation.updateOrigin(context.player);
		}

		// pick the easiest path
		let results = (await Promise.all(ends.map(end => navigation.findPath(end))))
			.filter(result => result !== undefined) as NavigationPath[];

		for (const result of results) {
			const pathLength = result.path.length;

			// the score is length of path + penalty per node
			// remove the base difficulty and add in our own
			// take into account that longer paths are worse
			result.score = Math.round(result.score - pathLength + Math.pow(pathLength, 1.1));
		}

		results = results.sort((a, b) => a.score === b.score ? 0 : (a.score > b.score ? 1 : -1));

		if (results.length > 0) {
			movementPath = results[0];
		}

		cachedPaths.set(pathId, movementPath);
	}

	if (movementPath) {
		// log.info("getMovementPath", movementPath.path.length, movementPath.score);

		return {
			difficulty: movementPath.score,
			path: movementPath.path,
		};
	}

	return {
		difficulty: ObjectiveResult.Impossible,
	};
}

export async function moveToFaceTarget(context: Context, target: IVector3): Promise<MoveResult> {
	return move(context, target, true);
}

export async function moveToTarget(context: Context, target: IVector3): Promise<MoveResult> {
	return move(context, target, false);
}

export async function move(context: Context, target: IVector3, moveAdjacentToTarget: boolean, force?: boolean): Promise<MoveResult> {
	const movementPath = await getMovementPath(context, target, moveAdjacentToTarget);

	if (movementPath.difficulty !== 0) {
		if (!movementPath.path) {
			return MoveResult.NoPath;
		}

		const pathLength = movementPath.path.length;

		const end = movementPath.path[pathLength - 1];
		if (!end) {
			log.info("Broken path!", pathLength, movementPath.path, target.x, target.y, target.z, context.player.x, context.player.y, context.player.z);
			return MoveResult.NoPath;
		}

		const atEnd = context.player.x === end.x && context.player.y === end.y;
		if (!atEnd) {
			const nextPosition = movementPath.path[1];
			if (nextPosition) {
				const direction = getDirectionFromMovement(nextPosition.x - context.player.x, nextPosition.y - context.player.y);

				const nextTile = game.getTile(nextPosition.x, nextPosition.y, target.z);
				const tileType = TileHelpers.getType(nextTile);
				const terrainDescription = Terrains[tileType];

				if (terrainDescription && !terrainDescription.passable && !terrainDescription.water) {
					if (terrainDescription.gather) {
						if (direction !== context.player.facingDirection) {
							await executeAction(context, ActionType.UpdateDirection, (context, action) => {
								action.execute(context.player, direction, undefined);
							});
						}

						const actionType = terrainDescription.gather ? ActionType.Gather : ActionType.Dig;
						const item = terrainDescription.gather ? getBestActionItem(context, ActionType.Gather, DamageType.Blunt) : getBestActionItem(context, ActionType.Dig);

						await executeAction(context, actionType, (context, action) => {
							action.execute(context.player, item);
						});

					} else {
						log.info("Terrain is blocking movement", TerrainType[tileType]);
					}

				} else if (nextTile.doodad && nextTile.doodad.blocksMove()) {
					// walking into a doodad we can pickup
					if (direction !== context.player.facingDirection) {
						await executeAction(context, ActionType.UpdateDirection, (context, action) => {
							action.execute(context.player, direction, undefined);
						});
					}

					if (nextTile.doodad.canPickup(context.player)) {
						log.info("Picking up doodad", Direction[direction]);
						await executeAction(context, ActionType.Pickup, (context, action) => {
							action.execute(context.player);
						});

					} else if (hasCorpses(nextTile)) {
						log.info("Carving corpse on top of doodad blocking the path", Direction[direction]);

						// todo: what if you don't have a carve item?
						await executeAction(context, ActionType.Carve, (context, action) => {
							action.execute(context.player, getInventoryItemsWithUse(context, ActionType.Carve)[0]);
						});

					} else {
						log.info("Gathering from doodad blocking the path", Direction[direction]);
						await executeAction(context, ActionType.Gather, (context, action) => {
							action.execute(context.player, getBestActionItem(context, ActionType.Gather, DamageType.Slashing));
						});
					}

				} else if (nextTile.creature) {
					// walking into a creature
					if (direction !== context.player.facingDirection) {
						await executeAction(context, ActionType.UpdateDirection, (context, action) => {
							action.execute(context.player, direction, undefined);
						});
					}

					await executeAction(context, ActionType.Move, (context, action) => {
						action.execute(context.player, direction);
					});

				} else if (nextTile.npc) {
					log.info("No path through npc");
					return MoveResult.NoPath;
				}
			}

			if (force || !context.player.hasWalkPath()) {
				updateOverlay(movementPath.path);

				context.player.walkAlongPath(movementPath.path, true);
			}

			return MoveResult.Moving;
		}
	}

	if (moveAdjacentToTarget) {
		const direction = getDirectionFromMovement(target.x - context.player.x, target.y - context.player.y);
		if (direction !== context.player.facingDirection) {
			await executeAction(context, ActionType.UpdateDirection, (context, action) => {
				action.execute(context.player, direction, undefined);
			});
		}
	}

	return MoveResult.Complete;
}
