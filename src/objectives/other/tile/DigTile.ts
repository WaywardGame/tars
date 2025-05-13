import type { TerrainType } from "@wayward/game/game/tile/ITerrain";
import type Tile from "@wayward/game/game/tile/Tile";

import Dig from "@wayward/game/game/entity/action/actions/Dig";
import type { ActionArgument, IActionDescription } from "@wayward/game/game/entity/action/IAction";
import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import UseItem from "../../../objectives/other/item/UseItem";
import AcquireInventoryItem from "../../acquire/item/AcquireInventoryItem";
import Lambda from "../../core/Lambda";
import MoveToTarget from "../../core/MoveToTarget";
import ClearTile from "./ClearTile";

export interface IDigTileOptions {
	digUntilTypeIsNot: TerrainType;
}

export default class DigTile extends Objective {

	constructor(private readonly target: Tile, private readonly options?: Partial<IDigTileOptions>) {
		super();
	}

	public getIdentifier(): string {
		return `DigTile:${this.target.x},${this.target.y},${this.target.z}`;
	}

	public getStatus(): string | undefined {
		return `Digging ${this.target.x},${this.target.y},${this.target.z}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.target.isDeepHole) {
			// too deep to dig
			return ObjectiveResult.Impossible;
		}

		const objectives: IObjective[] = [];

		objectives.push(new AcquireInventoryItem("shovel"));

		objectives.push(new MoveToTarget(this.target, true));

		objectives.push(new ClearTile(this.target));

		objectives.push(new UseItem(Dig as IActionDescription<[[ActionArgument.Undefined, ActionArgument.ItemInventory]]>, context.inventory.shovel));

		const digUntilTypeIsNot = this.options?.digUntilTypeIsNot;
		if (digUntilTypeIsNot !== undefined) {
			objectives.push(new Lambda(async () => {
				if (digUntilTypeIsNot === this.target.type) {
					return ObjectiveResult.Restart;
				}

				return ObjectiveResult.Complete;
			}).setStatus(this));
		}

		return objectives;
	}

}
