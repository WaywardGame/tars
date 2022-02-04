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
import { DoodadType } from "game/doodad/IDoodad";
import StartSolarStill from "../other/doodad/StartSolarStill";

export interface IGatherWaterFromStillOptions {
	allowStartingWaterStill: boolean;
	allowWaitingForWater?: boolean;
	onlyIdleWhenWaitingForWaterStill?: boolean;
}

export default class GatherWaterFromStill extends Objective {

	constructor(private readonly waterOrSolarStill: Doodad, private readonly item: Item, private readonly options?: Partial<IGatherWaterFromStillOptions>) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWaterFromStill:${this.waterOrSolarStill}:${this.item}:${this.options?.allowStartingWaterStill}`;
	}

	public getStatus(): string | undefined {
		return `Gathering water from ${this.waterOrSolarStill.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!context.utilities.doodad.isWaterStillDrinkable(this.waterOrSolarStill)) {
			if (this.options?.allowStartingWaterStill) {
				// start desalination and run back to the waterstill and wait
				const objectives: IObjective[] = [
					this.waterOrSolarStill.type === DoodadType.SolarStill ? new StartSolarStill(this.waterOrSolarStill) : new StartWaterStillDesalination(this.waterOrSolarStill),
				];

				if (this.options?.allowWaitingForWater) {
					if (!this.options?.onlyIdleWhenWaitingForWaterStill) {
						objectives.push(new MoveToTarget(this.waterOrSolarStill, true, { range: 5 }));
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

		objectives.push(new MoveToTarget(this.waterOrSolarStill, true));
		objectives.push(new UseItem(ActionType.GatherLiquid, this.item)
			.setStatus(() => `Gathering water from ${this.waterOrSolarStill.getName()}`));

		return objectives;
	}

}
