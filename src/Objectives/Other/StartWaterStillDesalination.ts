import Doodad from "doodad/Doodad";
import { ActionType } from "entity/action/IAction";
import { IStat, Stat } from "entity/IStats";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { isNearBase } from "../../Utilities/Base";
import { isWaterStillDrinkable } from "../../Utilities/Doodad";
import { canDrinkItem } from "../../Utilities/Item";
import AcquireWaterContainer from "../Acquire/Item/Specific/AcquireWaterContainer";
import ExecuteAction from "../Core/ExecuteAction";
import Lambda from "../Core/Lambda";
import MoveToTarget from "../Core/MoveToTarget";
import GatherWater from "../Gather/GatherWater";
import RepairItem from "../Interrupt/RepairItem";

import StartFire from "./StartFire";
import StokeFire from "./StokeFire";
import UseItem from "./UseItem";

export default class StartWaterStillDesalination extends Objective {

	private static readonly waterStillStokeFireTargetDecay: Map<number, number | undefined> = new Map();

	constructor(private readonly waterStill: Doodad) {
		super();
	}

	public getIdentifier(): string {
		return `StartWaterStillDesalination:${this.waterStill}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const waterStillDescription = this.waterStill.description();

		const objectives: IObjective[] = [];

		if (isWaterStillDrinkable(this.waterStill)) {
			// water is ready
			return ObjectiveResult.Ignore;
		}

		if (this.waterStill.gatherReady === undefined) {
			// still is not desalination

			let isWaterInContainer = false;

			// check if we need a water container
			if (context.inventory.waterContainer !== undefined) {
				isWaterInContainer = canDrinkItem(context.inventory.waterContainer);

				if (context.inventory.waterContainer.minDur !== undefined &&
					context.inventory.waterContainer.maxDur !== undefined &&
					(context.inventory.waterContainer.minDur / context.inventory.waterContainer.maxDur) < 0.6) {
					// repair our container
					objectives.push(new RepairItem(context.inventory.waterContainer));
				}

			} else if (this.waterStill.stillContainer === undefined) {
				objectives.push(new AcquireWaterContainer());

			} else {
				// detach the still container and use it to pour water into the still
				this.log.info("Moving to detach container");

				objectives.push(new MoveToTarget(this.waterStill, true));

				objectives.push(new ExecuteAction(ActionType.DetachContainer, (context, action) => {
					action.execute(context.player);
				}));
			}

			if (!isWaterInContainer) {
				// gather water for our container
				objectives.push(new GatherWater(context.inventory.waterContainer));
			}

			objectives.push(new MoveToTarget(this.waterStill, true));

			// pour our water into the water still
			objectives.push(new UseItem(ActionType.Pour, context.inventory.waterContainer));

		} else if (!this.waterStill.stillContainer) {
			this.log.info("No still container");

			if (context.inventory.waterContainer === undefined) {
				objectives.push(new AcquireWaterContainer());
			}

			objectives.push(new MoveToTarget(this.waterStill, true));

			const waterStillTile = this.waterStill.getTile();
			if (waterStillTile.containedItems && waterStillTile.containedItems.length > 0) {
				// cleanup water still tile
				objectives.push(new ExecuteAction(ActionType.PickupAllItems, (context, action) => {
					action.execute(context.player);
				}));
			}

			this.log.info("Moving to detach container");
			// attach the container to the water still
			objectives.push(new UseItem(ActionType.AttachContainer, context.inventory.waterContainer));

		} else if (waterStillDescription && !waterStillDescription.providesFire) {
			// only start the fire if we are near the base or if we have an emergency
			if (isNearBase(context) || context.player.stat.get<IStat>(Stat.Thirst).value <= 3) {
				// we need to start the fire
				objectives.push(new Lambda(async () => {
					StartWaterStillDesalination.waterStillStokeFireTargetDecay.set(this.waterStill.id, 250);
					return ObjectiveResult.Complete;
				}));
				objectives.push(new StartFire(this.waterStill));
				objectives.push(new StokeFire(this.waterStill));

			} else {
				return ObjectiveResult.Ignore;
			}

		} else {
			const waterStillStokeFireTargetDecay = StartWaterStillDesalination.waterStillStokeFireTargetDecay.get(this.waterStill.id);
			if (waterStillStokeFireTargetDecay !== undefined) {
				if (this.waterStill.decay !== undefined && this.waterStill.decay < waterStillStokeFireTargetDecay) {
					objectives.push(new StokeFire(this.waterStill));

				} else {
					StartWaterStillDesalination.waterStillStokeFireTargetDecay.delete(this.waterStill.id);
				}

			} else {
				// wait still is desalinating
				return ObjectiveResult.Ignore;
			}
		}

		return objectives;
	}

}
