
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
import type Context from "../../core/context/Context";
import { ContextDataType } from "../../core/context/IContext";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { log } from "../../utilities/Logger";
import { MoveResult } from "../../utilities/Movement";
import UseItem from "../other/item/UseItem";
import Rest from "../other/Rest";
// import MoveToZ from "../utility/moveTo/MoveToZ";

export interface IMoveToTargetOptions {
	range: number;
	disableStaminaCheck: boolean;
	disableTracking: boolean;
	skipZCheck: boolean;
	allowBoat: boolean;
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

	public getIdentifier(): string {
		// ${this.target} - likely an [object] without a ToString
		return `MoveToTarget:(${this.target.x},${this.target.y},${this.target.z}):${this.moveAdjacentToTarget}:${this.options?.disableStaminaCheck ? true : false}:${this.options?.range ?? 0}`;
	}

	public getStatus(): string | undefined {
		let status = `Moving to `;

		if (Doodad.is(this.target) || Creature.is(this.target) || TileEvent.is(this.target) || Corpse.is(this.target)) {
			status += `${this.target.getName()} `;
		}

		status += `(${this.target.x},${this.target.y},${this.target.z})`;

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
		if (position.z !== this.target.z) {
			return ObjectiveResult.Impossible;
		}

		// if (!this.options?.skipZCheck && position.z !== this.target.z) {
		// 	this.log.info("Target is on different Z");

		// 	return [
		// 		new MoveToZ(this.target.z),
		// 		new MoveToTarget(this.target, this.moveAdjacentToTarget, { ...this.options, skipZCheck: true }), // todo: replace with this?
		// 	];
		// }

		const movementPath = await context.utilities.movement.getMovementPath(context, this.target, this.moveAdjacentToTarget);

		if (context.calculatingDifficulty) {
			if (movementPath.difficulty !== ObjectiveResult.Impossible) {
				if (movementPath.path && (this.trackedCorpse || this.trackedItem)) {
					const decay = this.trackedCorpse?.decay ?? this.trackedItem?.decay;
					if (decay !== undefined && decay <= movementPath.path?.length) {
						// assuming manual turn mode, the corpse / item will decay by the time we arrive
						return ObjectiveResult.Impossible;
					}
				}

				context.setData(ContextDataType.Position, { x: this.target.x, y: this.target.y, z: this.target.z });
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
						new MoveToTarget(this.target, this.moveAdjacentToTarget, this.options),
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
				this.log.info("Finished moving to target");
				context.setData(ContextDataType.Position, { x: this.target.x, y: this.target.y, z: this.target.z });
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

	public onCorpseRemoved(context: Context, corpse: Corpse) {
		return this.trackedCorpse === corpse;
	}

	/**
	 * Called when the context human moves
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

			const trackedCreaturePosition = this.trackedCreature.getPoint();

			if (trackedCreaturePosition.x !== this.trackedPosition.x ||
				trackedCreaturePosition.y !== this.trackedPosition.y ||
				trackedCreaturePosition.z !== this.trackedPosition.z) {
				this.log.info("Moving with tracked creature");

				this.trackedPosition = trackedCreaturePosition;

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
