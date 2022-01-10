import type Doodad from "game/doodad/Doodad";
import { ActionType } from "game/entity/action/IAction";
import type { IStat } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AcquireWaterContainer from "../../acquire/item/specific/AcquireWaterContainer";
import ExecuteAction from "../../core/ExecuteAction";
import MoveToTarget from "../../core/MoveToTarget";
import Restart from "../../core/Restart";
import GatherWater from "../../gather/GatherWater";
import RepairItem from "../../interrupt/RepairItem";

import UseItem from "../item/UseItem";
import PickUpAllTileItems from "../tile/PickUpAllTileItems";
import AnalyzeInventory from "../../analyze/AnalyzeInventory";
import EmptyWaterContainer from "../EmptyWaterContainer";
import { inventoryItemInfo } from "../../../core/ITars";
import StokeFire from "./StokeFire";

export interface IStartWaterStillDesalinationOptions {
	disableAttaching: boolean;
	disablePouring: boolean;
	disableStarting: boolean;
	forceStarting: boolean;
	forceStoke: boolean;
}

/**
 * It will ensure the water still is desalinating as long as we're near the base
 * It will pour water into the still, attach containers, gather water, start & stoke fires.
 */
export default class StartWaterStillDesalination extends Objective {

	constructor(private readonly waterStill: Doodad, private readonly options: Partial<IStartWaterStillDesalinationOptions> = {}) {
		super();
	}

	public getIdentifier(): string {
		return `StartWaterStillDesalination:${this.waterStill}`;
	}

	public getStatus(): string | undefined {
		return `Starting desalination process for ${this.waterStill.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!this.options.forceStoke && context.utilities.doodad.isWaterStillDrinkable(this.waterStill)) {
			// water is ready
			return ObjectiveResult.Ignore;
		}

		const waterStillDescription = this.waterStill.description();
		if (!waterStillDescription) {
			return ObjectiveResult.Impossible;
		}

		const objectives: IObjective[] = [];

		const availableWaterContainers = AnalyzeInventory.getItems(context, inventoryItemInfo["waterContainer"]);

		const availableWaterContainer = Array.from(availableWaterContainers).find(waterContainer => !context.utilities.item.isSafeToDrinkItem(waterContainer));

		if (!this.options.disablePouring && this.waterStill.gatherReady === undefined) {
			// water still cannot be desalinated yet
			let isWaterInContainer = false;

			// check if we need a water container
			if (availableWaterContainer) {
				isWaterInContainer = context.utilities.item.isDrinkableItem(availableWaterContainer);

				if (availableWaterContainer.minDur !== undefined &&
					availableWaterContainer.maxDur !== undefined &&
					(availableWaterContainer.minDur / availableWaterContainer.maxDur) < 0.6) {
					// repair our container
					objectives.push(new RepairItem(availableWaterContainer));
				}

			} else if (this.waterStill.stillContainer === undefined) {
				objectives.push(new AcquireWaterContainer().keepInInventory());

			} else {
				// detach the still container and use it to pour water into the still
				this.log.info("Moving to detach container");

				objectives.push(new MoveToTarget(this.waterStill, true));

				objectives.push(new ExecuteAction(ActionType.DetachContainer, (context, action) => {
					action.execute(context.player);
					return ObjectiveResult.Complete;
				}).setStatus(() => `Detaching container from ${this.waterStill.getName()}`));
			}

			if (!isWaterInContainer) {
				// gather water for our container
				objectives.push(new GatherWater(availableWaterContainer, { disallowWaterStill: true }));
			}

			objectives.push(new MoveToTarget(this.waterStill, true));

			this.log.info("Going to pour water into the water still");

			// pour our water into the water still
			objectives.push(new UseItem(ActionType.Pour, availableWaterContainer));
		}

		if (!this.options.disableAttaching && !this.waterStill.stillContainer) {
			this.log.info("No still container");

			if (availableWaterContainer === undefined) {
				objectives.push(new AcquireWaterContainer().keepInInventory());
			}

			if (availableWaterContainer && !context.utilities.item.canGatherWater(availableWaterContainer)) {
				// theres water in the container - it's like seawater
				// pour it out so we can attach it to the container
				objectives.push(new EmptyWaterContainer(availableWaterContainer));
			}

			objectives.push(new MoveToTarget(this.waterStill, true));

			objectives.push(new PickUpAllTileItems(this.waterStill));

			this.log.info("Moving to detach container");

			// attach the container to the water still
			objectives.push(new UseItem(ActionType.AttachContainer, availableWaterContainer));
		}

		if (!this.options.disableStarting) {
			if (this.options.forceStoke) {
				objectives.push(new StokeFire(this.waterStill));

			} else if (!waterStillDescription.providesFire) {
				// only start the fire if we are near the base or if we have an emergency
				if (this.options.forceStarting || context.utilities.base.isNearBase(context) || context.player.stat.get<IStat>(Stat.Thirst).value <= 3) {
					// we need to start the fire. stoke fire will do it for us
					objectives.push(new StokeFire(this.waterStill));
					objectives.push(new Restart());

				} else {
					this.log.info("Too far away from water still");
					return ObjectiveResult.Ignore;
				}

			} else if (this.waterStill.decay !== undefined && this.waterStill.gatherReady !== undefined) {
				// water still is lit and desalinating
				if (this.waterStill.decay <= this.waterStill.gatherReady) {
					this.log.info(`Going to stoke fire. Water still decay is ${this.waterStill.decay}. Gather ready is ${this.waterStill.gatherReady}`);

					objectives.push(new StokeFire(this.waterStill));
					objectives.push(new Restart());

				} else {
					// water still is desalinating and the decay is enough for the process to finish
					return ObjectiveResult.Ignore;
				}
			}
		}

		return objectives;
	}

}
