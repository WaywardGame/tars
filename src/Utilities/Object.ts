import Doodad from "game/doodad/Doodad";
import Corpse from "game/entity/creature/corpse/Corpse";
import Creature from "game/entity/creature/Creature";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import Item from "game/item/Item";

import Context from "../Context";
import { tileUtilities } from "./Tile";

export enum FindObjectType {
	Creature,
	Doodad,
	Corpse,
	Item,
}

class ObjectUtilities {

	private cachedSorts: Map<string, any> = new Map();
	private cachedObjects: Map<string, any> = new Map();

	public reset() {
		this.cachedSorts.clear();
		this.cachedObjects.clear();
	}

	public getSortedObjects<T>(context: Context, type: FindObjectType, allObjects: SaferArray<T>, getPoint?: (object: T) => IVector3): T[] {
		const sortedCacheId = FindObjectType[type];
		let sortedObjects = this.cachedSorts.get(sortedCacheId);
		if (sortedObjects === undefined) {
			sortedObjects = allObjects
				.slice()
				.filter(a => a !== undefined)
				.sort((a, b) => Vector2.squaredDistance(context.player, getPoint?.(a!) ?? a as any as IVector3) - Vector2.squaredDistance(context.player, getPoint?.(b!) ?? b as any as IVector3));
			this.cachedSorts.set(sortedCacheId, sortedObjects);
		}

		return sortedObjects;
	}

	public findObjects<T>(context: Context, type: FindObjectType, id: string, allObjects: SaferArray<T>, isTarget: (object: T) => boolean, top?: number, getPoint?: (object: T) => IVector3): T[] {
		const cacheId = top === undefined ? `${type}-${id}` : `${type}-${id}-${top}`;

		const cachedResults = this.cachedObjects.get(id) || this.cachedObjects.get(cacheId);
		if (cachedResults !== undefined) {
			return cachedResults;
		}

		const results: T[] = [];
		let matches = 0;

		const sortedObjects = this.getSortedObjects(context, type, allObjects);

		for (const object of sortedObjects) {
			if ((getPoint?.(object) ?? object as any as IVector3).z === context.player.z && isTarget(object)) {
				results.push(object);
				matches++;

				if (top !== undefined && matches >= top) {
					break;
				}
			}
		}

		this.cachedObjects.set(cacheId, results);

		return results;
	}

	public findObject<T extends IVector3>(context: Context, type: FindObjectType, id: string, object: T[], isTarget: (object: T) => boolean): T | undefined {
		const objects = this.findObjects(context, type, id, object, isTarget, 1);
		return objects.length > 0 ? objects[0] : undefined;
	}

	public findDoodad(context: Context, id: string, isTarget: (doodad: Doodad) => boolean): Doodad | undefined {
		return this.findObject(context, FindObjectType.Doodad, id, island.doodads as Doodad[], isTarget);
	}

	public findDoodads(context: Context, id: string, isTarget: (doodad: Doodad) => boolean, top?: number): Doodad[] {
		return this.findObjects(context, FindObjectType.Doodad, id, island.doodads as Doodad[], isTarget, top);
	}

	public findCreatures(context: Context, id: string, isTarget: (creature: Creature) => boolean, top?: number): Creature[] {
		return this.findObjects(context, FindObjectType.Creature, id, island.creatures as Creature[], isTarget, top);
	}

	public findItem(context: Context, id: string, isTarget: (item: Item) => boolean, top?: number): Item[] {
		return this.findObjects(context, FindObjectType.Item, id, island.items, isTarget, top, (object) => object.getPoint()!);
	}

	public findCarvableCorpses(context: Context, id: string, isTarget: (corpse: Corpse) => boolean): Corpse[] {
		return this.findObjects(context, FindObjectType.Corpse, id, island.corpses as Corpse[], corpse => {
			if (isTarget(corpse)) {
				const tile = game.getTileFromPoint(corpse);
				return tile.creature === undefined &&
					tile.npc === undefined &&
					tile.events === undefined &&
					tileUtilities.isFreeOfOtherPlayers(context, corpse);
			}

			return false;
		});
	}

}

export const objectUtilities = new ObjectUtilities();
