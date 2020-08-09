
import Creature from "entity/creature/Creature";
import { IStatMax, Stat } from "entity/IStats";
import terrainDescriptions from "tile/Terrains";
import Vector2 from "utilities/math/Vector2";
import TileHelpers from "utilities/TileHelpers";

import Context, { ContextDataType } from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { log } from "../../Utilities/Logger";
import { getMovementPath, move, MoveResult } from "../../Utilities/Movement";
import Rest from "../Other/Rest";

export interface IMoveToTargetOptions {
	range?: number;
	disableStaminaCheck?: boolean;
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

	public isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const movementPath = await getMovementPath(context, this.target, this.moveAdjacentToTarget);

		if (context.calculatingDifficulty) {
			context.setData(ContextDataType.LastKnownPosition, { x: this.target.x, y: this.target.y, z: this.target.z });
			return movementPath.difficulty;
		}

		if (!this.options?.disableStaminaCheck) {
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
							return new Rest();
						}
					}
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
				return ObjectiveResult.Complete;

			case MoveResult.Moving:
				// continue
				this.log.info(`Moving to target (${this.target.x},${this.target.y},${this.target.z})`);
				return ObjectiveResult.Pending;

			case MoveResult.Complete:
				this.log.info("Finished moving to target");
				context.setData(ContextDataType.LastKnownPosition, { x: this.target.x, y: this.target.y, z: this.target.z });
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
				// creature died
				this.log.info("Creature died");
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

		return super.onMove(context, this.trackedCreature);
	}
}
