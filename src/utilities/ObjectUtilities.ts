/*!
 * Copyright 2011-2024 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type Doodad from "@wayward/game/game/doodad/Doodad";
import type Corpse from "@wayward/game/game/entity/creature/corpse/Corpse";
import type Creature from "@wayward/game/game/entity/creature/Creature";
import { MoveType } from "@wayward/game/game/entity/IEntity";
import type NPC from "@wayward/game/game/entity/npc/NPC";
import Vector2 from "@wayward/game/utilities/math/Vector2";

import { AiType } from "@wayward/game/game/entity/AI";
import { CreatureType } from "@wayward/game/game/entity/creature/ICreature";
import Entity from "@wayward/types/definitions/game/game/entity/Entity";
import type Context from "../core/context/Context";

export enum FindObjectType {
	Creature,
	Doodad,
	Corpse,
	NPC,
	// note: No Item here because we generally don't care about caching/sorting positions of all Items in the game
}

export class ObjectUtilities {

	private readonly cachedSorts: Map<string, any> = new Map();
	private readonly cachedObjects: Map<string, any> = new Map();

	public clearCache(): void {
		this.cachedSorts.clear();
		this.cachedObjects.clear();
	}

	public getSortedObjects<T extends Entity>(context: Context, type: FindObjectType, allObjects: SaferArray<T>): T[] {
		const sortedCacheId = FindObjectType[type];
		let sortedObjects = this.cachedSorts.get(sortedCacheId);
		if (sortedObjects === undefined) {
			sortedObjects = allObjects
				.slice()
				.filter(a => a !== undefined)
				.sort((a, b) => Vector2.squaredDistance(context.human, a!) - Vector2.squaredDistance(context.human, b!));
			this.cachedSorts.set(sortedCacheId, sortedObjects);
		}

		return sortedObjects;
	}

	private findObjects<T extends Entity>(context: Context, type: FindObjectType, id: string, allObjects: SaferArray<T>, isTarget: (object: T) => boolean, top?: number): T[] {
		const cacheId = top === undefined ? `${type}-${id}` : `${type}-${id}-${top}`;

		const cachedResults = this.cachedObjects.get(id) || this.cachedObjects.get(cacheId);
		if (cachedResults !== undefined) {
			return cachedResults;
		}

		const results: T[] = [];
		let matches = 0;

		const sortedObjects = this.getSortedObjects(context, type, allObjects);

		for (const object of sortedObjects) {
			if (isTarget(object)) {
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

	public findDoodads(context: Context, id: string, isTarget: (doodad: Doodad) => boolean, top?: number): Doodad[] {
		return this.findObjects(context, FindObjectType.Doodad, id, context.human.island.doodads.getObjects() as Doodad[], isTarget, top);
	}

	public findCreatures(context: Context, id: string, isTarget: (creature: Creature) => boolean, top?: number): Creature[] {
		return this.findObjects(context, FindObjectType.Creature, id, context.human.island.creatures.getObjects() as Creature[], isTarget, top);
	}

	public findNPCS(context: Context, id: string, isTarget: (npc: NPC) => boolean, top?: number): NPC[] {
		return this.findObjects(context, FindObjectType.NPC, id, context.human.island.npcs.getObjects() as NPC[], isTarget, top);
	}

	public findCarvableCorpses(context: Context, id: string, isTarget: (corpse: Corpse) => boolean): Corpse[] {
		return this.findObjects(context, FindObjectType.Corpse, id, context.human.island.corpses.getObjects() as Corpse[], corpse => {
			if (isTarget(corpse)) {
				return context.utilities.tile.canButcherCorpse(context, corpse.tile, context.inventory.butcher);
			}

			return false;
		});
	}

	public findHuntableCreatures(context: Context, id: string, options?: Partial<{ type: CreatureType; onlyHostile: boolean; top: number; skipWaterCreatures: boolean }>): Creature[] {
		return context.utilities.object.findCreatures(context, id, creature => {
			if (creature.isTamed) {
				return false;
			}

			if (options?.type !== undefined && creature.type !== options.type) {
				return false;
			}

			if (options?.onlyHostile && !creature.hasAi(AiType.Hostile)) {
				return false;
			}

			if (options?.skipWaterCreatures && !(creature.getMoveType() & MoveType.Land)) {
				return false;
			}

			return true;
		}, options?.top);
	}

	public findTamableCreatures(context: Context, id: string, options?: Partial<{ type: CreatureType; hostile: boolean; top: number }>): Creature[] {
		return context.utilities.object.findCreatures(context, id, creature => {
			if (creature.isTamed) {
				return false;
			}

			if (options?.type !== undefined && creature.type !== options.type) {
				return false;
			}

			if (options?.hostile !== undefined) {
				return options.hostile === creature.hasAi(AiType.Hostile);
			}

			return true;
		}, options?.top);
	}
}
