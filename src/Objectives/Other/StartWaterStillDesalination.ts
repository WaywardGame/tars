import Doodad from "doodad/Doodad";
import { ActionType } from "entity/action/IAction";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { isNearBase } from "../../Utilities/Base";
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

	private static waterStillStokeFireTargetDecay: number | undefined;

	constructor(private readonly waterStill: Doodad) {
		super();
	}

	public getIdentifier(): string {
		return `StartWaterStillDesalination:${this.waterStill}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const waterStillDescription = this.waterStill.description();

		const objectives: IObjective[] = [];

		if (this.waterStill.gatherReady !== undefined && this.waterStill.gatherReady <= 0) {
			// water is ready
			return ObjectiveResult.Ignore;
		}

		if (this.waterStill.gatherReady === undefined) {
			// no water in the still

			let isWaterInContainer = false;

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

			// attach the container to the water still
			objectives.push(new UseItem(ActionType.AttachContainer, context.inventory.waterContainer));

		} else if (waterStillDescription && !waterStillDescription.providesFire) {
			// only start the fire if we are near the base
			if (isNearBase(context)) {
				// we need to start the fire				
				objectives.push(new Lambda(async () => {
					StartWaterStillDesalination.waterStillStokeFireTargetDecay = 300;
					return ObjectiveResult.Complete;
				}));
				objectives.push(new StartFire(this.waterStill));

			} else {
				return ObjectiveResult.Ignore;
			}

		} else if (StartWaterStillDesalination.waterStillStokeFireTargetDecay !== undefined) {
			if (this.waterStill.decay !== undefined && this.waterStill.decay < StartWaterStillDesalination.waterStillStokeFireTargetDecay) {
				objectives.push(new StokeFire(this.waterStill));

			} else {
				StartWaterStillDesalination.waterStillStokeFireTargetDecay = undefined;
			}

		} else {
			// wait still is desalinating
			return ObjectiveResult.Ignore;
		}

		return objectives;
	}

}
