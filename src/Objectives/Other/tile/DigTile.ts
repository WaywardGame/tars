import { ActionType } from "game/entity/action/IAction";
import type { IVector3 } from "utilities/math/IVector";
import TileHelpers from "utilities/game/TileHelpers";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AcquireItemForAction from "../../acquire/item/AcquireItemForAction";
import AnalyzeInventory from "../../analyze/AnalyzeInventory";
import Lambda from "../../core/Lambda";
import MoveToTarget from "../../core/MoveToTarget";

import UseItem from "../item/UseItem";
import ClearTile from "./ClearTile";

export interface IDigTileOptions {
	digUntilTypeIsNot: TerrainType;
}

export default class DigTile extends Objective {

	constructor(private readonly target: IVector3, private readonly options?: Partial<IDigTileOptions>) {
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

		const shovel = context.inventory.shovel;
		if (!shovel) {
			objectives.push(
				new AcquireItemForAction(ActionType.Dig),
				new AnalyzeInventory(),
			);
		}

		objectives.push(new MoveToTarget(this.target, true));

		objectives.push(new ClearTile(this.target));

		objectives.push(new UseItem(ActionType.Dig, shovel));

		const digUntilTypeIsNot = this.options?.digUntilTypeIsNot;
		if (digUntilTypeIsNot !== undefined) {
			objectives.push(new Lambda(async () => {
				if (digUntilTypeIsNot === TileHelpers.getType(context.island.getTileFromPoint(this.target))) {
					return ObjectiveResult.Restart;
				}

				return ObjectiveResult.Complete;
			}));
		}

		return objectives;
	}

}
