import type Doodad from "@wayward/game/game/doodad/Doodad";
import Ride from "@wayward/game/game/entity/action/actions/Ride";
import Corpse from "@wayward/game/game/entity/creature/corpse/Corpse";
import Creature from "@wayward/game/game/entity/creature/Creature";
import type Human from "@wayward/game/game/entity/Human";
import type { IStatMax } from "@wayward/game/game/entity/IStats";
import { Stat } from "@wayward/game/game/entity/IStats";
import type Item from "@wayward/game/game/item/Item";
import Tile from "@wayward/game/game/tile/Tile";
import type TileEvent from "@wayward/game/game/tile/TileEvent";
import type { IVector3 } from "@wayward/game/utilities/math/IVector";
import Vector2 from "@wayward/game/utilities/math/Vector2";
import AscendDescend from "@wayward/game/game/entity/action/actions/AscendDescend";

import type Context from "../../core/context/Context";
import { ContextDataType } from "../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { MoveResult } from "../../utilities/MovementUtilities";
import EquipItem from "../other/item/EquipItem";
import UseItem from "../other/item/UseItem";
import Rest from "../other/Rest";
import AddDifficulty from "./AddDifficulty";
import ExecuteAction from "../core/ExecuteAction";
// import MoveToZ from "../utility/moveTo/MoveToZ";

// caves are scary
const zChangeDifficulty = 500;

export interface IMoveToTargetOptions {
	range: number;
	stopWhenWithinRange: boolean;

	disableStaminaCheck: boolean;
	disableTracking: boolean;
	allowBoat: boolean;
	skipIfAlreadyThere: boolean;
	ascendDescend: boolean;

	/**
	 * Equip weapons when close to the target when it's a creature
	 */
	equipWeapons: boolean;

	skipZCheck: boolean;
	changeZ: number;

	reverse: boolean;
}

export default class MoveToTarget extends Objective {

	private readonly trackedCreature: Creature | undefined;
	private readonly trackedCorpse: Corpse | undefined;
	private trackedItem: Item | undefined;

	private trackedPosition: IVector3 | undefined;

	public override readonly includePositionInHashCode: boolean = true;

	constructor(
		protected target: Human | Creature | TileEvent | Doodad | Corpse | Tile,
		protected readonly moveAdjacentToTarget: boolean,
		protected readonly options?: Partial<IMoveToTargetOptions>) {
		super();

		if (!options?.disableTracking) {
			if (target instanceof Creature) {
				this.trackedCreature = target;
				this.trackedPosition = target.point;

			} else if (target instanceof Corpse) {
				this.trackedCorpse = target;
			}
		}
	}

	public getIdentifier(context: Context | undefined): string {
		// ${this.target} - likely an [object] without a ToString
		return `MoveToTarget:(${this.target.x},${this.target.y},${this.target.z}):${this.moveAdjacentToTarget}:${this.options?.disableStaminaCheck ? true : false}:${this.options?.range ?? 0}:${this.options?.reverse ?? false}:${this.options?.changeZ ?? this.target.z}`;
	}

	public getStatus(context: Context): string | undefined {
		let status = `Moving to ${this.target.getName()}`;

		if (!Tile.is(this.target)) {
			status += ` (${this.target.x},${this.target.y},${this.target.z})`;
		}

		return status;
	}

	public getPosition(): IVector3 {
		return this.target;
	}

	public override isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const tile = context.getTile();

		if (!context.options.allowCaves && tile.z !== this.target.z) {
			return ObjectiveResult.Impossible;
		}

		// this doesn't take into account moveAdjacentToTarget
		// if (this.options?.skipIfAlreadyThere && this.target.x === tile.x && this.target.y === tile.y && this.target.z === tile.z) {
		// 	return ObjectiveResult.Complete;
		// }

		const endPositions = context.utilities.movement.getMovementEndPositions(context, this.target, this.moveAdjacentToTarget);
		if (endPositions.length === 0) {
			return ObjectiveResult.Impossible;
		}

		// PlanningAccuracy.Simple is handled by the objective position, no need for extra tricks like this
		// if (context.options.planningAccuracy === PlanningAccuracy.Simple && context.calculatingDifficulty) {
		// 	const defaultEndPosition = endPositions[0];

		// 	if (tile.x !== context.human.x || tile.y !== context.human.y || tile.z !== context.human.z) {
		// 		context.setData(ContextDataType.Tile, context.island.getTile(defaultEndPosition.x, defaultEndPosition.y, this.options?.changeZ ?? defaultEndPosition.z));

		// 		// squared distance makes the diff very large. other diffs would have to be modified to compensate
		// 		const diff = Math.ceil(Vector2.distance(tile, defaultEndPosition) + (tile.z !== defaultEndPosition.z ? zChangeDifficulty : 0));

		// 		return diff;
		// 	}
		// }

		if (this.options?.changeZ === tile.z) {
			// this objective runs dynamically so it's possible it's already in the correct z
			return ObjectiveResult.Complete;
		}

		if (!this.options?.skipZCheck && tile.z !== this.target.z) {
			const origin = context.utilities.navigation.getOrigin();
			const oppositeZOrigin = context.utilities.navigation.getOppositeOrigin();
			if (!origin || !oppositeZOrigin) {
				return ObjectiveResult.Impossible;
			}

			switch (this.target.z) {
				case oppositeZOrigin.z:
					// the target z is in the known oppositeZ nav map

					// note: passOverriddenDifficulty is very important
					// MoveItemIntoInventory will set difficulty to 0 for certain base chests (in the event the player needs to move to the base to craft the item anyway)
					// the overriden difficulty must be passed through to the child actions
					return [
						new AddDifficulty(zChangeDifficulty),

						// move to cave entrance
						new MoveToTarget(context.island.getTile(oppositeZOrigin.x, oppositeZOrigin.y, tile.z), false, { ...this.options, ascendDescend: true, changeZ: this.target.z }).passOverriddenDifficulty(this),

						// move to target
						new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options, skipZCheck: true }).passOverriddenDifficulty(this),
					];

				case origin.z:
					return ObjectiveResult.Impossible;

				// position is not in target z
				// position is not in origin z
				// origin z === target z & is in the primary nav map
				// should move from position [opposite z] -> cave entrance [origin z]
				// move to target from reverse(opposite z origin -> position)
				// if (this.target.x === 83 && this.target.y === 311 && this.target.z === 1) {
				// 	// console.warn("broken okay?");
				// }

				// return [
				// 	// move to cave entrance from the current position - reverse is true!
				// 	new MoveToTarget({ x: position.x, y: position.y, z: position.z }, false, { ...this.options, reverse: true, idleIfAlreadyThere: true, changeZ: this.target.z }).passOverriddenDifficulty(this),

				// 	// move to target
				// 	new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options/*, skipZCheck: true*/ }).passOverriddenDifficulty(this),
				// ];

				default:
					return ObjectiveResult.Impossible;
			}
		}

		if (this.trackedCreature && !this.trackedCreature.isValid) {
			return ObjectiveResult.Complete;
		}

		const movementPath = await context.utilities.movement.getMovementPath(context, this.target, this.moveAdjacentToTarget, this.options?.reverse);

		const path = (movementPath !== ObjectiveResult.Complete && movementPath !== ObjectiveResult.Impossible) ? movementPath.path : undefined;

		if (context.calculatingDifficulty) {
			if (movementPath === ObjectiveResult.Impossible) {
				return movementPath;
			}

			if (movementPath === ObjectiveResult.Complete) {
				// set position
				return movementPath;
			}

			if (this.trackedCorpse || this.trackedItem) {
				const decay = this.trackedCorpse?.decay ?? this.trackedItem?.getDecayTime();
				if (decay !== undefined && decay <= movementPath.path.length) {
					// assuming manual turn mode, the corpse / item will decay by the time we arrive
					return ObjectiveResult.Impossible;
				}
			}

			if (this.options?.reverse) {
				const origin = context.utilities.navigation.getOrigin();
				const oppositeZOrigin = context.utilities.navigation.getOppositeOrigin();
				if (origin && origin.z === this.target.z) {
					// console.warn("set reversed origin to ", origin);
					context.setData(ContextDataType.Tile, context.island.getTile(origin.x, origin.y, this.options?.changeZ ?? origin.z));

				} else if (oppositeZOrigin) {
					// console.warn("set reversed origin to opposite ", oppositeZOrigin);
					context.setData(ContextDataType.Tile, context.island.getTile(oppositeZOrigin.x, oppositeZOrigin.y, this.options?.changeZ ?? oppositeZOrigin.z));
				}

			} else {
				const realEndPosition = movementPath.path[movementPath.path.length - 1];
				context.setData(ContextDataType.Tile, context.island.getTile(realEndPosition.x, realEndPosition.y, this.options?.changeZ ?? realEndPosition.z));
			}

			return movementPath.score;
		}

		if (!this.options?.disableStaminaCheck && !context.human.vehicleItemReference && path) {
			// check how our stamina is
			const stamina = context.human.stat.get<IStatMax>(Stat.Stamina);
			if ((stamina.max - stamina.value) > 2) {
				let swimTiles = 0;

				for (let i = 4; i < path.length; i++) {
					const point = path[i];
					const tile = context.island.getTile(point.x, point.y, context.human.z);
					const terrainDescription = tile.description;
					if (terrainDescription?.water) {
						swimTiles++;
					}
				}

				if (swimTiles > 0) {
					// going to be swimming soon. make sure we have enough stamina for the trip
					if (stamina.value - swimTiles <= 10) {
						context.log.info(`Going to be swimming for ${swimTiles} tiles soon. Resting first`);

						return [
							new Rest(),
							new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options, disableStaminaCheck: true }),
						];
					}
				}
			}
		}

		if (this.options?.allowBoat && context.inventory.sailboat && !context.human.vehicleItemReference) {
			const tile = context.human.tile;
			const terrainDescription = tile.description;
			if (terrainDescription?.water) {
				return [
					new UseItem(Ride, context.inventory.sailboat),
					new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options, allowBoat: false }),
				];
			}

			if (path) {
				let firstWaterTile: Tile | undefined;

				for (let i = 0; i < path.length - 1; i++) {
					const point = path[i];
					const tile = context.island.getTile(point.x, point.y, this.target.z);
					const terrainDescription = tile.description;
					if (terrainDescription?.water) {
						firstWaterTile = tile;
						break;
					}
				}

				if (firstWaterTile) {
					return [
						new MoveToTarget(firstWaterTile, false),
						new UseItem(Ride, context.inventory.sailboat),
						new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options }),
					];
				}
			}
		}

		const range = this.options?.range;
		if (range !== undefined && Vector2.isDistanceWithin(context.human, this.target, range)) {
			this.log.info("Within range of the target");
			return ObjectiveResult.Complete;
		}

		const moveResult = await context.utilities.movement.move(context, this.target, this.moveAdjacentToTarget);

		switch (moveResult) {
			case MoveResult.NoTarget:
				this.log.info("No target to move to");
				return ObjectiveResult.Complete;

			case MoveResult.NoPath:
				this.log.info(`No path to target ${this.target}`);
				// todo: switch to Restart or Impossible?
				return ObjectiveResult.Complete;

			case MoveResult.Moving:
				// continue
				this.log.info(`Moving to target (${this.target.x},${this.target.y},${this.target.z})`);
				return ObjectiveResult.Pending;

			case MoveResult.Complete:
				this.log.info(`Finished moving to target (${this.target.x},${this.target.y},${this.target.z})`);
				context.setData(ContextDataType.Tile, context.human.tile);

				if (movementPath === ObjectiveResult.Complete && this.options?.ascendDescend && context.human.z !== (this.options?.changeZ ?? this.target.z)) {
					return new ExecuteAction(AscendDescend, []).setStatus("Ascend/Descend");
				}

				return ObjectiveResult.Complete;
		}
	}

	/**
	 * Causes an interrupt if the item decays before we arrive.
	 */
	public trackItem(item: Item | undefined): this {
		this.trackedItem = item;

		return this;
	}

	public onItemRemoved(context: Context, item: Item): boolean {
		return this.trackedItem === item;
	}

	public onCreatureRemoved(context: Context, creature: Creature): boolean {
		return this.trackedCreature === creature;
	}

	public onCorpseRemoved(context: Context, corpse: Corpse): boolean {
		return this.trackedCorpse === corpse;
	}

	/**
	 * Called when the context human or creature moves
	 */
	public override async onMove(context: Context): Promise<boolean | IObjective | EquipItem> {
		const trackedCreature = this.trackedCreature;
		if (trackedCreature && this.trackedPosition) {
			if (!trackedCreature.isValid) {
				this.log.info("Creature died");
				return true;
			}

			if (trackedCreature.isTamed) {
				this.log.info("Creature became tamed");
				return true;
			}

			if (Vector2.distance(context.human, trackedCreature) > 5) {
				// track once it's closer
				return false;
			}

			if (this.options?.equipWeapons && !context.options.lockEquipment) {
				const handEquipmentChange = context.utilities.item.updateHandEquipment(context);
				if (handEquipmentChange) {
					this.log.info(`Should equip ${handEquipmentChange.item} before attacking`);

					return new EquipItem(handEquipmentChange.equipType, handEquipmentChange.item);
					// await context.utilities.action.executeAction(context, ActionType.Equip, (context) => {
					// 	action.execute(context.actionExecutor, handEquipmentChange.item, handEquipmentChange.equipType);
					// 	return ObjectiveResult.Complete;
					// });
				}
			}

			if (trackedCreature.x !== this.trackedPosition.x ||
				trackedCreature.y !== this.trackedPosition.y ||
				trackedCreature.z !== this.trackedPosition.z) {
				this.log.info("Moving with tracked creature");

				this.trackedPosition = trackedCreature.point;

				// ensure a new path is used
				context.utilities.movement.clearCache();

				// move to it's latest location
				const moveResult = await context.utilities.movement.move(context, trackedCreature, this.moveAdjacentToTarget, true, true);

				switch (moveResult) {
					case MoveResult.NoTarget:
						this.log.info("No target to move to");
						return true;

					case MoveResult.NoPath:
						this.log.info(`No path to target ${trackedCreature}`);
						return true;

					case MoveResult.Moving:
						// continue
						return false;

					case MoveResult.Complete:
						this.log.info("Finished moving to target");
						return false;
				}
			}
		}

		if (this.options?.allowBoat && context.inventory.sailboat && !context.human.vehicleItemReference) {
			const tile = context.human.tile;
			const terrainDescription = tile.description;
			if (terrainDescription?.water) {
				this.log.warn("Interrupting to use sail boat");
				return true;
			}
		}

		const range = this.options?.range;
		if (range !== undefined && this.options?.stopWhenWithinRange && Vector2.isDistanceWithin(context.human, this.target, range)) {
			this.log.info("Within range of the target");
			return true;
		}

		return super.onMove(context, this.trackedCreature);
	}
}
