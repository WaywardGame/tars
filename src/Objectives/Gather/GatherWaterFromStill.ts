import Doodad from "game/doodad/Doodad";
import { ActionType } from "game/entity/action/IAction";
import Item from "game/item/Item";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import MoveToTarget from "../core/MoveToTarget";
import Idle from "../other/Idle";
import StartWaterStillDesalination from "../other/doodad/StartWaterStillDesalination";
import { doodadUtilities } from "../../utilities/Doodad";
import UseItem from "../other/item/UseItem";
import { itemUtilities } from "../../utilities/Item";
import EmptyWaterContainer from "../other/EmptyWaterContainer";

export default class GatherWaterFromStill extends Objective {

	constructor(private readonly waterStill: Doodad, private readonly item: Item, private readonly allowStartingWaterStill?: boolean, private readonly allowWaitingForWaterStill?: boolean) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWaterFromStill:${this.waterStill}:${this.item}:${this.allowStartingWaterStill}`;
	}

	public getStatus(): string | undefined {
		return `Gathering water from ${this.waterStill.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!doodadUtilities.isWaterStillDrinkable(this.waterStill)) {
			if (this.allowStartingWaterStill) {
				// start desalination and run back to the waterstill and wait
				const objectives: IObjective[] = [
					new StartWaterStillDesalination(this.waterStill),
				];

				if (this.allowWaitingForWaterStill) {
					objectives.push(new MoveToTarget(this.waterStill, true, { range: 5 }));

					// add difficulty to show that we don't want to idle
					objectives.push(new Idle().addDifficulty(100));
				}

				return objectives;
			}

			return ObjectiveResult.Impossible;
		}

		const objectives: IObjective[] = [];

		if (!itemUtilities.canGatherWater(this.item)) {
			objectives.push(new EmptyWaterContainer(this.item));
		}

		objectives.push(new MoveToTarget(this.waterStill, true));
		objectives.push(new UseItem(ActionType.GatherLiquid, this.item)
			.setStatus(() => `Gathering water from ${this.waterStill.getName()}`));

		return objectives;
	}

}
