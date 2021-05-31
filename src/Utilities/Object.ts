import Doodad from "game/doodad/Doodad";
import Corpse from "game/entity/creature/corpse/Corpse";
import Creature from "game/entity/creature/Creature";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";

import Context from "../Context";

import { isFreeOfOtherPlayers } from "./Tile";

const creatureRadius = 5;

const cachedSorts: Map<string, any> = new Map();
const cachedObjects: Map<string, any> = new Map();

export enum FindObjectType {
	Creature,
	Doodad,
	Corpse,
}

export function resetCachedObjects() {
	cachedSorts.clear();
	cachedObjects.clear();
}

export function getSortedObjects<T extends IVector3>(context: Context, type: FindObjectType, allObjects: T[]): T[] {
	const sortedCacheId = FindObjectType[type];
	let sortedObjects = cachedSorts.get(sortedCacheId);
	if (sortedObjects === undefined) {
		sortedObjects = allObjects
			.slice()
			.sort((a, b) => Vector2.squaredDistance(context.player, a) - Vector2.squaredDistance(context.player, b));
		cachedSorts.set(sortedCacheId, sortedObjects);
	}

	return sortedObjects;
}

export function findObjects<T extends IVector3>(context: Context, type: FindObjectType, id: string, allObjects: T[], isTarget: (object: T) => boolean, top?: number): T[] {
	const cacheId = top === undefined ? `${type}-${id}` : `${type}-${id}-${top}`;

	const cachedResults = cachedObjects.get(id) || cachedObjects.get(cacheId);
	if (cachedResults !== undefined) {
		return cachedResults;
	}

	const results: T[] = [];
	let matches = 0;

	const sortedObjects = getSortedObjects(context, type, allObjects);

	for (const object of sortedObjects) {
		if (object !== undefined && object.z === context.player.z && isTarget(object)) {
			results.push(object);
			matches++;

			if (top !== undefined && matches >= top) {
				break;
			}
		}
	}

	cachedObjects.set(cacheId, results);

	return results;
}

export function findObject<T extends IVector3>(context: Context, type: FindObjectType, id: string, object: T[], isTarget: (object: T) => boolean): T | undefined {
	const objects = findObjects(context, type, id, object, isTarget, 1);
	return objects.length > 0 ? objects[0] : undefined;
}

export function findDoodad(context: Context, id: string, isTarget: (doodad: Doodad) => boolean): Doodad | undefined {
	return findObject(context, FindObjectType.Doodad, id, island.doodads as Doodad[], isTarget);
}

export function findDoodads(context: Context, id: string, isTarget: (doodad: Doodad) => boolean, top?: number): Doodad[] {
	return findObjects(context, FindObjectType.Doodad, id, island.doodads as Doodad[], isTarget, top);
}

export function findCreatures(context: Context, id: string, isTarget: (creature: Creature) => boolean, top?: number): Creature[] {
	return findObjects(context, FindObjectType.Creature, id, island.creatures as Creature[], isTarget, top);
}

export function findCarvableCorpses(context: Context, id: string, isTarget: (corpse: Corpse) => boolean): Corpse[] {
	return findObjects(context, FindObjectType.Corpse, id, island.corpses as Corpse[], corpse => {
		if (isTarget(corpse)) {
			const tile = game.getTileFromPoint(corpse);
			return tile.creature === undefined &&
				tile.npc === undefined &&
				tile.events === undefined &&
				isFreeOfOtherPlayers(context, corpse);
		}

		return false;
	});
}

export function getNearbyCreature(point: IVector3): Creature | undefined {
	for (let x = creatureRadius * -1; x <= creatureRadius; x++) {
		for (let y = creatureRadius * -1; y <= creatureRadius; y++) {
			const validPoint = game.ensureValidPoint({ x: point.x + x, y: point.y + y, z: point.z });
			if (validPoint) {
				const tile = game.getTileFromPoint(validPoint);
				if (tile.creature && !tile.creature.isTamed()) {
					// that's a lie
					// if (tile.creature.getMoveType() === MoveType.None && (Math.abs(point.x - x) > 1 || Math.abs(point.y - y) > 1)) {
					// 	// a non moving creature that is at least 1 tile away from us is not scary
					// 	continue;
					// }

					return tile.creature;
				}
			}
		}
	}

	return undefined;
}
