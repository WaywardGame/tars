import { log } from "./Logger";
import { executeAction } from "./Action";
import { getDirectionFromMovement } from "player/IPlayer";
import { ActionType } from "Enums";
import { IVector2, IVector3 } from "utilities/math/IVector";
import TileHelpers from "utilities/TileHelpers";
import { ITile, IOverlayInfo } from "tile/ITerrain";
import Terrains from "tile/Terrains";
import { defaultMaxTilesChecked } from "../ITars";
import { ICreature } from "creature/ICreature";
import { AiType } from "entity/IEntity";
import { ICorpse } from "creature/corpse/ICorpse";
import { findObjects } from "./Object";
import PathOverlayFootPrints from "newui/screen/screens/game/util/movement/PathOverlayFootPrints";
import { getNavigation } from "../Navigation";
import { missionImpossible } from "../IObjective";
import Vector2 from "utilities/math/Vector2";

export interface IMovementPath {
	difficulty: number;
	path?: IVector2[];
}

export enum MoveResult {
	NoTarget,
	NoPath,
	Moving,
	Complete
}

export function findTarget(start: IVector3, isTarget: (point: IVector3, tile: ITile) => boolean, maxTilesChecked: number = defaultMaxTilesChecked): IVector3 | undefined {
	return TileHelpers.findMatchingTile(start, isTarget, maxTilesChecked, (point, tile) => {
		const tileType = TileHelpers.getType(tile);
		const terrainDescription = Terrains[tileType];
		if (terrainDescription && terrainDescription.water) {
			return false;
		}

		return true;
	});
}


export async function findAndMoveToTarget(isTarget: (point: IVector3, tile: ITile) => boolean, maxTilesChecked: number = defaultMaxTilesChecked, start: IVector3 = localPlayer): Promise<MoveResult> {
	return moveToTargetWithRetries((ignoredTiles: ITile[]) => findTarget(start, (point, tile) => ignoredTiles.indexOf(tile) === -1 && isTarget(point, tile), maxTilesChecked));
}

export async function findAndMoveToFaceTarget(isTarget: (point: IVector3, tile: ITile) => boolean, maxTilesChecked: number = defaultMaxTilesChecked, start: IVector3 = localPlayer): Promise<MoveResult> {
	return moveToFaceTargetWithRetries((ignoredTiles: ITile[]) => findTarget(start, (point, tile) => ignoredTiles.indexOf(tile) === -1 && isTarget(point, tile), maxTilesChecked));
}

export async function findAndMoveToCreature(id: string, isTarget: (creature: ICreature) => boolean): Promise<MoveResult> {
	return _findAndMoveToObject(`Creature:${id}`, (game.creatures as ICreature[]).filter(c => c !== undefined && (c.ai & AiType.Hidden) === 0), isTarget, false);
}

export async function findAndMoveToFaceCorpse(id: string, isTarget: (corpse: ICorpse) => boolean): Promise<MoveResult> {
	return _findAndMoveToObject(`Corpse:${id}`, game.corpses as ICorpse[], isTarget, true);
}

export async function moveToTargetWithRetries(getTarget: (ignoredTiles: ITile[]) => IVector3 | undefined, maxRetries: number = 5): Promise<MoveResult> {
	return _moveToTargetWithRetries(getTarget, false, maxRetries);
}

export async function moveToFaceTargetWithRetries(getTarget: (ignoredTiles: ITile[]) => IVector3 | undefined, maxRetries: number = 5): Promise<MoveResult> {
	return _moveToTargetWithRetries(getTarget, true, maxRetries);
}

async function _findAndMoveToObject<T extends IVector3>(id: string, allObjects: T[], isTarget: (object: T) => boolean, moveAdjacentToTarget: boolean) {
	const objects = findObjects(id, allObjects, isTarget);
	if (objects.length > 0) {
		for (let i = 0; i < Math.min(objects.length, 2); i++) {
			const result = await (moveAdjacentToTarget ? moveToFaceTarget(objects[i]) : moveToTarget(objects[i]));
			if (result === MoveResult.Moving || result === MoveResult.Complete) {
				return result;
			}
		}

		return MoveResult.NoPath;
	}

	return MoveResult.NoTarget;
}

async function _moveToTargetWithRetries(getTarget: (ignoredTiles: ITile[]) => IVector3 | undefined, moveAdjacentToTarget: boolean, maxRetries: number = 5): Promise<MoveResult> {
	const ignoredTiles: ITile[] = [];

	let result = MoveResult.NoPath;
	while (result === MoveResult.NoPath && maxRetries > 0) {
		maxRetries--;

		const target = getTarget(ignoredTiles);
		if (target) {
			result = await (moveAdjacentToTarget ? moveToFaceTarget(target) : moveToTarget(target));
			if (result === MoveResult.NoPath) {
				log("Cannot path to target, ignoring", target);
				ignoredTiles.push(game.getTileFromPoint(target));

			} else {
				return result;
			}

		} else {
			return MoveResult.NoTarget;
		}
	}

	return MoveResult.NoTarget;
}

let cachedPaths: { [index: string]: IVector2[] | undefined };

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

	game.updateView(false);
}

export function updateOverlay(path: IVector2[]) {
	resetMovementOverlays();

	for (let i = 1; i < path.length; i++) {
		const lastPos = path[i - 1];
		const pos = path[i];
		const nextPos: IVector2 | undefined = path[i + 1];

		const tile = game.getTile(pos.x, pos.y, localPlayer.z);

		const overlay = PathOverlayFootPrints(i, path.length, pos, lastPos, nextPos);
		if (overlay) {
			TileHelpers.Overlay.add(tile, overlay);
			movementOverlays.push({
				tile: tile,
				overlay: overlay
			});
		}
	}
}

export function resetCachedPaths() {
	cachedPaths = {};
}

export async function getMovementPath(target: IVector3, moveAdjacentToTarget: boolean): Promise<IMovementPath> {
	if (localPlayer.x === target.x && localPlayer.y === target.y && localPlayer.z === target.z && !moveAdjacentToTarget) {
		return {
			difficulty: 1
		};
	}

	let movementPath: IVector2[] | undefined;

	const pathId = `${target.x},${target.y},${target.z}`;
	if (pathId in cachedPaths) {
		movementPath = cachedPaths[pathId];

	} else {
		const navigation = getNavigation();

		const ends = navigation.getValidPoints(target, !moveAdjacentToTarget).sort((a, b) => Vector2.squaredDistance(localPlayer, a) > Vector2.squaredDistance(localPlayer, b) ? 1 : -1);
		if (ends.length === 0) {
			return {
				difficulty: missionImpossible
			};
		}

		for (const end of ends) {
			movementPath = await navigation.findPath(end, localPlayer);
			if (movementPath) {
				break;
			}
		}

		cachedPaths[pathId] = movementPath;
	}

	if (movementPath) {
		// log("getMovementPath", movementPath.length, Vector2.squaredDistance(localPlayer, target));

		return {
			difficulty: Vector2.squaredDistance(localPlayer, target),
			path: movementPath
		};
	}

	return {
		difficulty: missionImpossible
	};
}

export async function moveToFaceTarget(target: IVector3): Promise<MoveResult> {
	return move(target, true);
}

export async function moveToTarget(target: IVector3): Promise<MoveResult> {
	return move(target, false);
}

export async function moveAwayFromTarget(target: IVector3): Promise<MoveResult> {
	const direction = getDirectionFromMovement(localPlayer.x - target.x, localPlayer.y - target.y);
	if (direction !== localPlayer.facingDirection) {
		await executeAction(ActionType.UpdateDirection, {
			direction: direction,
			bypass: true
		});
	}

	await executeAction(ActionType.Move, {
		direction: direction,
		bypass: true
	});

	return MoveResult.Complete;
}

async function move(target: IVector3, moveAdjacentToTarget: boolean): Promise<MoveResult> {
	const moveCompleted = localPlayer.x === target.x && localPlayer.y === target.y && localPlayer.z === target.z && !moveAdjacentToTarget;
	if (!moveCompleted) {
		const movementPath = await getMovementPath(target, moveAdjacentToTarget);
		if (!movementPath.path) {
			return MoveResult.NoPath;
		}

		const pathLength = movementPath.path.length;

		const end = movementPath.path[pathLength - 1];
		if (!end) {
			log("Broken path!", pathLength, target.x, target.x, target.y, localPlayer.x, localPlayer.y, localPlayer.z);
			return MoveResult.NoPath;
		}

		const atEnd = localPlayer.x === end.x && localPlayer.y === end.y;
		if (!atEnd) {
			if (!localPlayer.hasWalkPath()) {
				updateOverlay(movementPath.path);

				localPlayer.walkAlongPath(movementPath.path);
			}

			return MoveResult.Moving;
		}
	}

	if (moveAdjacentToTarget) {
		const direction = getDirectionFromMovement(target.x - localPlayer.x, target.y - localPlayer.y);
		if (direction !== localPlayer.facingDirection) {
			await executeAction(ActionType.UpdateDirection, {
				direction: direction,
				bypass: true
			});
		}
	}

	return MoveResult.Complete;
}
