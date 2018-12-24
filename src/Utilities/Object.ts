import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import { IDoodad } from "doodad/IDoodad";
import { ICreature } from "creature/ICreature";
import { ICorpse } from "creature/corpse/ICorpse";
import { CreatureType } from "Enums";

const creatureRadius = 3;

let cachedObjects: { [index: string]: any | undefined };

export function resetCachedObjects() {
	cachedObjects = {};
}

export function findObjects<T extends IVector3>(id: string, allObjects: T[], isTarget: (object: T) => boolean): T[] {
	const cachedResults = cachedObjects[id];
	if (cachedResults) {
		return cachedResults;
	}

	const result = allObjects.filter(o => o !== undefined && o.z === localPlayer.z && isTarget(o)).sort((a, b) => Vector2.distance(localPlayer, a) > Vector2.distance(localPlayer, b) ? 1 : -1);

	cachedObjects[id] = result;

	return result;
}

export function findObject<T extends IVector3>(id: string, object: T[], isTarget: (object: T) => boolean): T | undefined {
	const objects = findObjects(id, object, isTarget);
	return objects.length > 0 ? objects[0] : undefined;
}

export function findDoodad(id: string, isTarget: (doodad: IDoodad) => boolean): IDoodad | undefined {
	return findObject(`Doodad:${id}`, game.doodads as IDoodad[], isTarget);
}

export function findDoodads(id: string, isTarget: (doodad: IDoodad) => boolean): IDoodad[] {
	return findObjects(`Doodad:${id}`, game.doodads as IDoodad[], isTarget);
}

export function findCreature(id: string, isTarget: (creature: ICreature) => boolean): ICreature | undefined {
	return findObject(`Creature:${id}`, game.creatures as ICreature[], isTarget);
}

export function findCarvableCorpse(id: string, isTarget: (corpse: ICorpse) => boolean): ICorpse | undefined {
	return findObject(`Corpse:${id}`, game.corpses as ICorpse[], (corpse) => {
		if (isTarget(corpse) && corpse.type !== CreatureType.Blood && corpse.type !== CreatureType.WaterBlood) {
			const tile = game.getTileFromPoint(corpse);
			return tile.creature === undefined &&
				tile.npc === undefined &&
				!game.isPlayerAtPosition(corpse.x, corpse.y, corpse.z) &&
				getNearbyCreature(corpse) === undefined;
		}

		return false;
	});
}

export function getNearbyCreature(point: IVector3): ICreature | undefined {
	for (let x = -creatureRadius; x <= creatureRadius; x++) {
		for (let y = -creatureRadius; y <= creatureRadius; y++) {
			const tile = game.getTile(point.x + x, point.y + y, point.z);
			if (tile.creature && !tile.creature.isTamed()) {
				return tile.creature;
			}
		}
	}

	return undefined;
}
