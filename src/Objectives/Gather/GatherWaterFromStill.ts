import type Doodad from "game/doodad/Doodad";
import { ActionType } from "game/entity/action/IAction";
import type Item from "game/item/Item";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import MoveToTarget from "../core/MoveToTarget";
import Idle from "../other/Idle";
import StartWaterStillDesalination from "../other/doodad/StartWaterStillDesalination";
import UseItem from "../other/item/UseItem";
import EmptyWaterContainer from "../other/EmptyWaterContainer";

export interface IGatherWaterFromStillOptions {
	allowStartingWaterStill: boolean;
	allowWaitingForWaterStill?: boolean;
	onlyIdleWhenWaitingForWaterStill?: boolean;
}

export default class GatherWaterFromStill extends Objective {

	constructor(private readonly waterStill: Doodad, private readonly item: Item, private readonly options?: Partial<IGatherWaterFromStillOptions>) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWaterFromStill:${this.waterStill}:${this.item}:${this.options?.allowStartingWaterStill}`;
	}

	public getStatus(): string | undefined {
		return `Gathering water from ${this.waterStill.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!context.utilities.doodad.isWaterStillDrinkable(this.waterStill)) {
			if (this.options?.allowStartingWaterStill) {
				// start desalination and run back to the waterstill and wait
				const objectives: IObjective[] = [
					new StartWaterStillDesalination(this.waterStill),
				];

				if (this.options?.allowWaitingForWaterStill) {
					if (!this.options?.onlyIdleWhenWaitingForWaterStill) {
						objectives.push(new MoveToTarget(this.waterStill, true, { range: 5 }));
					}

					// add difficulty to show that we don't want to idle
					objectives.push(new Idle().addDifficulty(100));
				}

				return objectives;
			}

			return ObjectiveResult.Impossible;
		}

		const objectives: IObjective[] = [];

		if (!context.utilities.item.canGatherWater(this.item)) {
			objectives.push(new EmptyWaterContainer(this.item));
		}

		objectives.push(new MoveToTarget(this.waterStill, true));
		objectives.push(new UseItem(ActionType.GatherLiquid, this.item)
			.setStatus(() => `Gathering water from ${this.waterStill.getName()}`));

		return objectives;
	}

}
