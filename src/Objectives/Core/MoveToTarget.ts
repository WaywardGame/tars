
import Doodad from "game/doodad/Doodad";
import { ActionType } from "game/entity/action/IAction";
import Corpse from "game/entity/creature/corpse/Corpse";
import Creature from "game/entity/creature/Creature";
import type { IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import Item from "game/item/Item";
import terrainDescriptions from "game/tile/Terrains";
import TileEvent from "game/tile/TileEvent";
import TileHelpers from "utilities/game/TileHelpers";
import type { IVector2, IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import Vector3 from "utilities/math/Vector3";
import type Context from "../../core/context/Context";
import { ContextDataType } from "../../core/context/IContext";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { log } from "../../utilities/Logger";
import { MoveResult } from "../../utilities/Movement";
import Idle from "../other/Idle";
import EquipItem from "../other/item/EquipItem";
import UseItem from "../other/item/UseItem";
import Rest from "../other/Rest";
// import MoveToZ from "../utility/moveTo/MoveToZ";

// caves are scary
const zChangeDifficulty = 500;

export interface IMoveToTargetOptions {
	range: number;
	disableStaminaCheck: boolean;
	disableTracking: boolean;
	allowBoat: boolean;
	idleIfAlreadyThere: boolean;

	/**
	 * Equip weapons when close to the target when it's a creature
	 */
	equipWeapons: boolean;

	skipZCheck: boolean;
	changeZ: number;

	reverse: boolean;
}

export default class MoveToTarget extends Objective {

	private trackedCreature: Creature | undefined;
	private trackedCorpse: Corpse | undefined;
	private trackedItem: Item | undefined;

	private trackedPosition: IVector3 | undefined;

	constructor(
		protected target: IVector3,
		protected readonly moveAdjacentToTarget: boolean,
		protected readonly options?: Partial<IMoveToTargetOptions>) {
		super();

		if (!options?.disableTracking) {
			if (target instanceof Creature) {
				this.trackedCreature = target;
				this.trackedPosition = target.getPoint();

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
		let status = `Moving to`;

		if (Doodad.is(this.target) || Creature.is(this.target) || TileEvent.is(this.target) || Corpse.is(this.target)) {
			status += ` ${this.target.getName()}`;
		}

		status += ` (${this.target.x},${this.target.y},${this.target.z})`;

		return status;
	}

	public getPosition(): IVector3 {
		return this.target;
	}

	public override isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const position = context.getPosition();

		if (!context.options.allowCaves && position.z !== this.target.z) {
			return ObjectiveResult.Impossible;
		}

		// if (this.target.x === 115 && this.target.y === 388 && this.target.z === 0) {
		// 	console.warn("target", this.target, context.calculatingDifficulty);
		// 	console.warn("player position", context.human.getPoint());
		// 	console.warn(`context position ${position} - ${context.getData(ContextDataType.Position)}`);
		// }

		if (context.calculatingDifficulty) {
			if (position.x !== context.human.x || position.y !== context.human.y || position.z !== context.human.z) {
				context.setData(ContextDataType.Position, new Vector3(this.target.x, this.target.y, this.options?.changeZ ?? this.target.z));
				const diff = Vector2.squaredDistance(position, this.target) + (position.z !== this.target.z ? zChangeDifficulty : 0);

				// if (this.target.x === 115 && this.target.y === 388 && this.target.z === 0) {
				// 	console.warn("diff", diff);
				// }

				return diff;
			}

			// if (this.target.x === 115 && this.target.y === 388 && this.target.z === 0) {
			// 	console.warn("how");
			// }

			// if (position.z !== this.target.z) {
			// }
		}

		// if (this.target.x === 83 && this.target.y === 311 && this.target.z === 1) {
		// 	console.warn("player position", context.human.getPoint());
		// 	console.warn(`context position ${position} - ${context.getData(ContextDataType.Position)}`);
		// 	console.warn("oppositeZOrigin", context.utilities.navigation.getOppositeOrigin());
		// }

		if (this.options?.changeZ === position.z) {
			// this objective runs dynamically so it's possible it's already in the correct z
			return ObjectiveResult.Complete;
		}

		if (!this.options?.skipZCheck && position.z !== this.target.z) {
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
						// move to cave entrance
						new MoveToTarget({ x: oppositeZOrigin.x, y: oppositeZOrigin.y, z: position.z }, false, { ...this.options, idleIfAlreadyThere: true, changeZ: this.target.z }).passOverriddenDifficulty(this).addDifficulty(zChangeDifficulty),

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

					// if (this.target.x === 83 && this.target.y === 311 && this.target.z === 1) {
					// 	// console.warn("broken 2");
					// }

					return ObjectiveResult.Impossible;
			}
		}

		if (this.trackedCreature && !this.trackedCreature.isValid()) {
			return ObjectiveResult.Complete;
		}

		const movementPath = await context.utilities.movement.getMovementPath(context, this.target, this.moveAdjacentToTarget, this.options?.reverse);

		if (context.calculatingDifficulty) {
			if (movementPath.difficulty !== ObjectiveResult.Impossible) {
				if (movementPath.path && (this.trackedCorpse || this.trackedItem)) {
					const decay = this.trackedCorpse?.decay ?? this.trackedItem?.decay;
					if (decay !== undefined && decay <= movementPath.path?.length) {
						// assuming manual turn mode, the corpse / item will decay by the time we arrive
						return ObjectiveResult.Impossible;
					}
				}

				if (this.target.x === 83 && this.target.y === 311 && this.target.z === 1) {
					// console.warn("diff 2", movementPath.difficulty);
				}

				// if (this.target.x === 137 && this.target.y === 383 && this.target.z === 1) {
				// 	console.warn("moved", context.human.getPoint(), context.getPosition().toString(), movementPath.difficulty);
				// }

				if (this.options?.reverse) {
					const origin = context.utilities.navigation.getOrigin();
					const oppositeZOrigin = context.utilities.navigation.getOppositeOrigin();
					if (origin && origin.z === this.target.z) {
						// console.warn("set reversed origin to ", origin);
						context.setData(ContextDataType.Position, new Vector3(origin.x, origin.y, this.options?.changeZ ?? origin.z));

					} else if (oppositeZOrigin) {
						// console.warn("set reversed origin to opposite ", oppositeZOrigin);
						context.setData(ContextDataType.Position, new Vector3(oppositeZOrigin.x, oppositeZOrigin.y, this.options?.changeZ ?? oppositeZOrigin.z));
					}

				} else {
					context.setData(ContextDataType.Position, new Vector3(this.target.x, this.target.y, this.options?.changeZ ?? this.target.z));
				}
			}

			return movementPath.difficulty;
		}

		if (!this.options?.disableStaminaCheck && !context.human.vehicleItemReference) {
			const path = movementPath.path;
			if (path) {
				// check how our stamina is
				const stamina = context.human.stat.get<IStatMax>(Stat.Stamina);
				if ((stamina.max - stamina.value) > 2) {
					let swimTiles = 0;

					for (let i = 4; i < path.length; i++) {
						const point = path[i];
						const tile = context.island.getTile(point.x, point.y, context.human.z);
						const tileType = TileHelpers.getType(tile);
						const terrainDescription = terrainDescriptions[tileType];
						if (terrainDescription && terrainDescription.water) {
							swimTiles++;
						}
					}

					if (swimTiles > 0) {
						// going to be swimming soon. make sure we have enough stamina for the trip
						if (stamina.value - swimTiles <= 10) {
							log.info(`Going to be swimming for ${swimTiles} tiles soon. Resting first`);

							return [
								new Rest(),
								new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options, disableStaminaCheck: true }),
							];
						}
					}
				}
			}
		}

		if (this.options?.allowBoat && context.inventory.sailBoat && !context.human.vehicleItemReference) {
			const tile = context.human.getTile();
			const tileType = TileHelpers.getType(tile);
			const terrainDescription = terrainDescriptions[tileType];
			if (terrainDescription && terrainDescription.water) {
				return [
					new UseItem(ActionType.Paddle, context.inventory.sailBoat),
					new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options, allowBoat: false }),
				];
			}

			const path = movementPath.path;
			if (path) {
				let firstWaterTile: IVector2 | undefined;

				for (let i = 0; i < path.length - 1; i++) {
					const point = path[i];
					const tile = context.island.getTile(point.x, point.y, context.human.z);
					const tileType = TileHelpers.getType(tile);
					const terrainDescription = terrainDescriptions[tileType];
					if (terrainDescription && terrainDescription.water) {
						firstWaterTile = point;
						break;
					}
				}

				if (firstWaterTile) {
					return [
						new MoveToTarget({ ...firstWaterTile, z: this.target.z }, false),
						new UseItem(ActionType.Paddle, context.inventory.sailBoat),
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
				context.setData(ContextDataType.Position, new Vector3(this.target));

				if (movementPath.difficulty === 0 && this.options?.idleIfAlreadyThere && context.human.z !== (this.options?.changeZ ?? this.target.z)) {
					return new Idle(false);
				}

				return ObjectiveResult.Complete;
		}
	}

	/**
	 * Causes an interrupt if the item decays before we arrive.
	 */
	public trackItem(item: Item | undefined) {
		this.trackedItem = item;

		return this;
	}

	public onItemRemoved(context: Context, item: Item) {
		return this.trackedItem === item;
	}

	public onCreatureRemoved(context: Context, creature: Creature) {
		return this.trackedCreature === creature;
	}

	public onCorpseRemoved(context: Context, corpse: Corpse) {
		return this.trackedCorpse === corpse;
	}

	/**
	 * Called when the context human or creature moves
	 */
	public override async onMove(context: Context) {
		if (this.trackedCreature && this.trackedPosition) {
			if (!this.trackedCreature.isValid()) {
				this.log.info("Creature died");
				return true;
			}

			if (this.trackedCreature.isTamed()) {
				this.log.info("Creature became tamed");
				return true;
			}

			if (Vector2.distance(context.human, this.trackedCreature) > 5) {
				// track once it's closer
				return false;
			}

			if (this.options?.equipWeapons && !context.options.lockEquipment) {
				const handEquipmentChange = context.utilities.item.updateHandEquipment(context);
				if (handEquipmentChange) {
					this.log.info(`Should equip ${handEquipmentChange.item} before attacking`);

					return new EquipItem(handEquipmentChange.equipType, handEquipmentChange.item);
					// await context.utilities.action.executeAction(context, ActionType.Equip, (context, action) => {
					// 	action.execute(context.actionExecutor, handEquipmentChange.item, handEquipmentChange.equipType);
					// 	return ObjectiveResult.Complete;
					// });
				}
			}

			const trackedCreaturePosition = this.trackedCreature.getPoint();

			if (trackedCreaturePosition.x !== this.trackedPosition.x ||
				trackedCreaturePosition.y !== this.trackedPosition.y ||
				trackedCreaturePosition.z !== this.trackedPosition.z) {
				this.log.info("Moving with tracked creature");

				this.trackedPosition = trackedCreaturePosition;

				// ensure a new path is used
				context.utilities.movement.clearCache();

				// move to it's latest location
				const moveResult = await context.utilities.movement.move(context, trackedCreaturePosition, this.moveAdjacentToTarget, true, true);

				switch (moveResult) {
					case MoveResult.NoTarget:
						this.log.info("No target to move to");
						return true;

					case MoveResult.NoPath:
						this.log.info(`No path to target ${this.trackedCreature.toString()}`);
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

		if (this.options?.allowBoat && context.inventory.sailBoat && !context.human.vehicleItemReference) {
			const tile = context.human.getTile();
			const tileType = TileHelpers.getType(tile);
			const terrainDescription = terrainDescriptions[tileType];
			if (terrainDescription && terrainDescription.water) {
				this.log.warn("Interrupting to use sail boat");
				return true;
			}
		}

		return super.onMove(context, this.trackedCreature);
	}
}
