import Dig from "game/entity/action/actions/Dig";
import { TerrainType } from "game/tile/ITerrain";
import Tile from "game/tile/Tile";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import Lambda from "../../core/Lambda";
import MoveToTarget from "../../core/MoveToTarget";
import UseItem from "../item/UseItem";
import ClearTile from "./ClearTile";
import AcquireInventoryItem from "../../acquire/item/AcquireInventoryItem";

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
		const objectives: IObjective[] = [];

		objectives.push(new AcquireInventoryItem("shovel"));

		objectives.push(new MoveToTarget(this.target, true));

		objectives.push(new ClearTile(this.target));

		objectives.push(new UseItem(Dig, context.inventory.shovel));

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
