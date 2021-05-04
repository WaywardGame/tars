
import { ActionType } from "game/entity/action/IAction";
import Creature from "game/entity/creature/Creature";
import { IStatMax, Stat } from "game/entity/IStats";
import terrainDescriptions from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
import Vector2 from "utilities/math/Vector2";

import Context from "../../Context";
import { ContextDataType } from "../../IContext";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { log } from "../../Utilities/Logger";
import { getMovementPath, move, MoveResult } from "../../Utilities/Movement";
import Rest from "../Other/Rest";
import UseItem from "../Other/UseItem";

// import MoveToZ from "../Utility/MoveToZ";

export interface IMoveToTargetOptions {
	range?: number;
	disableStaminaCheck?: boolean;
	skipZCheck?: boolean;
	allowBoat?: boolean;
}

export default class MoveToTarget extends Objective {

	private trackedCreature: Creature | undefined;
	private trackedPosition: IVector3 | undefined;

	constructor(
		protected target: IVector3,
		protected readonly moveAdjacentToTarget: boolean,
		protected readonly options?: IMoveToTargetOptions) {
		super();
	}

	public getIdentifier(): string {
		return `MoveToTarget:${this.target}:(${this.target.x},${this.target.y},${this.target.z}):${this.moveAdjacentToTarget}:${this.options?.disableStaminaCheck ? true : false}:${this.options?.range ?? 0}`;
	}

	public getStatus(): string {
		return `Moving to (${this.target.x},${this.target.y},${this.target.z})`;
	}

	public isDynamic(): boolean {
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

		const movementPath = await getMovementPath(context, this.target, this.moveAdjacentToTarget);

		if (context.calculatingDifficulty) {
			context.setData(ContextDataType.Position, { x: this.target.x, y: this.target.y, z: this.target.z });
			return movementPath.difficulty;
		}

		if (!this.options?.disableStaminaCheck && context.player.vehicleItemId === undefined) {
			const path = movementPath.path;
			if (path) {
				// check how our stamina is
				const stamina = context.player.stat.get<IStatMax>(Stat.Stamina);
				if ((stamina.max - stamina.value) > 2) {
					let swimTiles = 0;

					for (let i = 4; i < path.length; i++) {
						const point = path[i];
						const tile = game.getTile(point.x, point.y, context.player.z);
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

		if (this.options?.allowBoat && context.inventory.sailBoat && context.player.vehicleItemId === undefined) {
			const tile = context.player.getTile();
			const tileType = TileHelpers.getType(tile);
			const terrainDescription = terrainDescriptions[tileType];
			if (terrainDescription && terrainDescription.water) {
				return new UseItem(ActionType.Paddle, context.inventory.sailBoat);
			}

			const path = movementPath.path;
			if (path) {
				let firstWaterTile: IVector2 | undefined;

				for (let i = 0; i < path.length - 1; i++) {
					const point = path[i];
					const tile = game.getTile(point.x, point.y, context.player.z);
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
						new MoveToTarget(this.target, this.moveAdjacentToTarget),
					];
				}
			}
		}

		const range = this.options?.range;
		if (range !== undefined && Vector2.isDistanceWithin(context.player, this.target, range)) {
			this.log.info("Within range of the target");
			return ObjectiveResult.Complete;
		}

		const moveResult = await move(context, this.target, this.moveAdjacentToTarget);

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

	public trackCreature(creature: Creature | undefined) {
		this.trackedCreature = creature;
		this.trackedPosition = creature ? creature.getPoint() : undefined;

		return this;
	}

	public async onMove(context: Context) {
		if (this.trackedCreature && this.trackedPosition) {
			if (!this.trackedCreature.isValid()) {
				this.log.info("Creature died");
				return true;
			}

			if (this.trackedCreature.isTamed()) {
				this.log.info("Creature became tamed");
				return true;
			}

			if (Vector2.distance(context.player, this.trackedCreature) > 5) {
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
				const moveResult = await move(context, trackedCreaturePosition, this.moveAdjacentToTarget, true);

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

		if (this.options?.allowBoat && context.inventory.sailBoat && context.player.vehicleItemId === undefined) {
			const tile = context.player.getTile();
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
