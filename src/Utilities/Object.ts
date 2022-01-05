import Doodad from "game/doodad/Doodad";
import Corpse from "game/entity/creature/corpse/Corpse";
import Creature from "game/entity/creature/Creature";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import NPC from "game/entity/npc/NPC";
import Item from "game/item/Item";
import { AiType } from "game/entity/IEntity";

import Context from "../core/context/Context";
import { tileUtilities } from "./Tile";

export enum FindObjectType {
	Creature,
	Doodad,
	Corpse,
	Item,
	NPC,
}

class ObjectUtilities {

	private cachedSorts: Map<string, any> = new Map();
	private cachedObjects: Map<string, any> = new Map();

	public clearCache() {
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
		return this.findObject(context, FindObjectType.Doodad, id, context.player.island.doodads.getObjects() as Doodad[], isTarget);
	}

	public findDoodads(context: Context, id: string, isTarget: (doodad: Doodad) => boolean, top?: number): Doodad[] {
		return this.findObjects(context, FindObjectType.Doodad, id, context.player.island.doodads.getObjects() as Doodad[], isTarget, top);
	}

	public findCreatures(context: Context, id: string, isTarget: (creature: Creature) => boolean, top?: number): Creature[] {
		return this.findObjects(context, FindObjectType.Creature, id, context.player.island.creatures.getObjects() as Creature[], isTarget, top);
	}

	public findNPCS(context: Context, id: string, isTarget: (npc: NPC) => boolean, top?: number): NPC[] {
		return this.findObjects(context, FindObjectType.NPC, id, context.player.island.npcs.getObjects() as NPC[], isTarget, top);
	}

	public findItem(context: Context, id: string, isTarget: (item: Item) => boolean, top?: number): Item[] {
		return this.findObjects(context, FindObjectType.Item, id, context.player.island.items.getObjects(), isTarget, top, (object) => object.getPoint()!);
	}

	public findCarvableCorpses(context: Context, id: string, isTarget: (corpse: Corpse) => boolean): Corpse[] {
		const island = context.player.island;
		return this.findObjects(context, FindObjectType.Corpse, id, island.corpses.getObjects() as Corpse[], corpse => {
			if (isTarget(corpse)) {
				const tile = island.getTileFromPoint(corpse);
				return tile.creature === undefined &&
					tile.npc === undefined &&
					tile.events === undefined &&
					tileUtilities.isFreeOfOtherPlayers(context, corpse);
			}

			return false;
		});
	}

	public findHuntableCreatures(context: Context, id: string, onlyHostile?: boolean, top?: number) {
		return objectUtilities.findCreatures(context, id, creature => !creature.isTamed() && (!onlyHostile || creature.hasAi(AiType.Hostile)), top);
	}

	public findTamableCreatures(context: Context, id: string, onlyHostile: boolean, top?: number) {
		return objectUtilities.findCreatures(context, id, creature => {
			if (creature.isTamed()) {
				return false;
			}

			if (creature.hasAi(AiType.Hostile)) {
				return onlyHostile;
			}

			return !onlyHostile;
		}, top);
	}
}

export const objectUtilities = new ObjectUtilities();
