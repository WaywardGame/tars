import type { NPCType } from "@wayward/game/game/entity/npc/INPCs";
import type NPC from "@wayward/game/game/entity/npc/NPC";
import type Doodad from "@wayward/game/game/doodad/Doodad";
import type { DoodadType } from "@wayward/game/game/doodad/IDoodad";
import type { IslandId } from "@wayward/game/game/island/IIsland";
import type { TerrainType } from "@wayward/game/game/tile/ITerrain";
import type { ITarsMode } from "../core/mode/IMode";

import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import Lambda from "../objectives/core/Lambda";
import MoveToTarget from "../objectives/core/MoveToTarget";
import MoveToBase from "../objectives/utility/moveTo/MoveToBase";
import MoveToIsland from "../objectives/utility/moveTo/MoveToIsland";
import type { CreatureType } from "@wayward/game/game/entity/creature/ICreature";
import { ContextDataType } from "../core/context/IContext";
import SetContextData from "../objectives/contextData/SetContextData";

export enum MoveToType {
	Island,
	Terrain,
	Doodad,
	Creature,
	Player,
	Base,
	NPC,
}

interface IMoveTo {
	type: MoveToType;
}

export interface IMoveToIsland extends IMoveTo {
	type: MoveToType.Island;
	islandId: IslandId;
}

export interface IMoveToTerrain extends IMoveTo {
	type: MoveToType.Terrain;
	terrainType: TerrainType;
}

export interface IMoveToDoodad extends IMoveTo {
	type: MoveToType.Doodad;
	doodadType: DoodadType;
}

export interface IMoveToPlayer extends IMoveTo {
	type: MoveToType.Player;
	playerIdentifier: string;
	follow?: boolean;
}

export interface IMoveToNPC extends IMoveTo {
	type: MoveToType.NPC;
	npc: NPC | NPCType;
	follow?: boolean;
}

export interface IMoveToCreature extends IMoveTo {
	type: MoveToType.Creature;
	creatureType: CreatureType;
}

export interface IMoveToBase extends IMoveTo {
	type: MoveToType.Base;
}

export type MoveTo = IMoveToIsland | IMoveToTerrain | IMoveToDoodad | IMoveToPlayer | IMoveToCreature | IMoveToNPC | IMoveToBase;

export class MoveToMode implements ITarsMode {

	private finished: (success: boolean) => void;

	constructor(private readonly target: MoveTo) {
	}

	public async initialize(_: Context, finished: (success: boolean) => void): Promise<void> {
		this.finished = finished;
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		switch (this.target.type) {
			case MoveToType.Island:
				return [
					new MoveToIsland(this.target.islandId),
					new Lambda(async () => {
						this.finished(true);
						return ObjectiveResult.Complete;
					}),
				];

			case MoveToType.Terrain:
				const tileLocations = context.utilities.tile.getNearestTileLocation(context, this.target.terrainType);

				if (tileLocations.length > 0) {
					return tileLocations.map(tileLocation => ([
						new MoveToTarget(tileLocation.tile, true),
						new Lambda(async () => {
							this.finished(true);
							return ObjectiveResult.Complete;
						}),
					]));
				}

				break;

			case MoveToType.Doodad:
				const doodadTypes = context.utilities.doodad.getDoodadTypes(this.target.doodadType, true);

				const doodadObjectives = context.utilities.object.findDoodads(context, "MoveToDoodad", (doodad: Doodad) => doodadTypes.has(doodad.type), 5)
					.map(doodad => ([
						new MoveToTarget(doodad, true),
						new Lambda(async () => {
							this.finished(true);
							return ObjectiveResult.Complete;
						}),
					]));

				if (doodadObjectives.length > 0) {
					return doodadObjectives;
				}

				break;

			case MoveToType.NPC:
				const npcOrType = this.target.npc;
				if (typeof (npcOrType) === "number") {
					const npcObjectives = context.utilities.object.findNPCS(context, "MoveToNPC", (npc: NPC) => npc.type === npcOrType, 5)
						.map(npc => ([
							new MoveToTarget(npc, true),
							new Lambda(async () => {
								this.finished(true);
								return ObjectiveResult.Complete;
							}),
						]));

					if (npcObjectives.length > 0) {
						return npcObjectives;
					}

				} else if (npcOrType === context.human) {
					return [
						new Lambda(async () => {
							this.finished(true);
							return ObjectiveResult.Complete;
						}),
					];

				} else {
					const objectives: IObjective[] = [
						new MoveToIsland(npcOrType.islandId),
						new MoveToTarget(npcOrType, true),
					];

					if (!this.target.follow) {
						objectives.push(new Lambda(async () => {
							this.finished(true);
							return ObjectiveResult.Complete;
						}));
					}

					return objectives;
				}

				break;

			case MoveToType.Creature:
				const creatureType = this.target.creatureType;

				const creatureObjectives = context.utilities.object.findCreatures(context, "MoveToCreature", creature => creature.type === creatureType, 5)
					.map(creature => ([
						new SetContextData(ContextDataType.TamingCreature, creature),
						new MoveToTarget(creature, true),
						new Lambda(async () => {
							this.finished(true);
							return ObjectiveResult.Complete;
						}),
					]));

				if (creatureObjectives.length > 0) {
					return creatureObjectives;
				}

				break;

			case MoveToType.Player:
				const player = game.playerManager.getByIdentifier(this.target.playerIdentifier);

				if (player) {
					if (player === context.human) {
						return [
							new Lambda(async () => {
								this.finished(true);
								return ObjectiveResult.Complete;
							}),
						];
					}

					const objectives: IObjective[] = [
						new MoveToIsland(player.islandId),
						new MoveToTarget(player, true),
					];

					if (!this.target.follow) {
						objectives.push(new Lambda(async () => {
							this.finished(true);
							return ObjectiveResult.Complete;
						}));
					}

					return objectives;
				}

				break;

			case MoveToType.Base:
				return [
					new MoveToBase(),
					new Lambda(async () => {
						this.finished(true);
						return ObjectiveResult.Complete;
					}),
				];
		}

		this.finished(false);

		return [];
	}

}
