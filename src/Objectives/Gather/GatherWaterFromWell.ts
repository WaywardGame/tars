import type Doodad from "game/doodad/Doodad";
import { ActionType } from "game/entity/action/IAction";
import type Item from "game/item/Item";
import { getTileId } from "utilities/game/TilePosition";

import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import MoveToTarget from "../core/MoveToTarget";
import UseItem from "../other/item/UseItem";
import ReserveItems from "../core/ReserveItems";

export default class GatherWaterFromWell extends Objective {

	constructor(private readonly well: Doodad, private readonly item: Item) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWaterFromWell:${this.well}`;
	}

	public getStatus(): string | undefined {
		return `Gathering water from ${this.well.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const pos = this.well.getPoint();

		const wellData = context.island.wellData[getTileId(pos.x, pos.y, pos.z)];
		if (!wellData || wellData.quantity === 0) {
			return ObjectiveResult.Impossible;
		}

		return [
			new ReserveItems(this.item),
			new MoveToTarget(this.well, true),
			new UseItem(ActionType.GatherLiquid, this.item)
				.setStatus(() => `Gathering water from ${this.well.getName()}`),
		];
	}
}
