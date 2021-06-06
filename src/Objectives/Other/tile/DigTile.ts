import { ActionType } from "game/entity/action/IAction";
import { IVector3 } from "utilities/math/IVector";
import TileHelpers from "utilities/game/TileHelpers";

import Context from "../../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
import AcquireItemForAction from "../../acquire/item/AcquireItemForAction";
import AnalyzeInventory from "../../analyze/AnalyzeInventory";
import Lambda from "../../core/Lambda";
import MoveToTarget from "../../core/MoveToTarget";

import UseItem from "../item/UseItem";

export default class DigTile extends Objective {

	constructor(private readonly target: IVector3, private options: Partial<{ digUntilTypeIsNot: TerrainType }> = {}) {
		super();
	}

	public getIdentifier(): string {
		return `DigTile:${this.target.x},${this.target.y},${this.target.z}`;
	}

	public getStatus(): string {
		return `Digging ${this.target.x},${this.target.y},${this.target.z}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectives: IObjective[] = [];

		const shovel = context.inventory.shovel;
		if (!shovel) {
			objectives.push(new AcquireItemForAction(ActionType.Dig), new AnalyzeInventory());
		}

		objectives.push(new MoveToTarget(this.target, true), new UseItem(ActionType.Dig, shovel));

		const digUntilTypeIsNot = this.options.digUntilTypeIsNot;
		if (digUntilTypeIsNot !== undefined) {
			objectives.push(new Lambda(async () => {
				if (digUntilTypeIsNot === TileHelpers.getType(game.getTileFromPoint(this.target))) {
					return ObjectiveResult.Restart;
				}

				return ObjectiveResult.Complete;
			}));
		}

		return objectives;
	}

}
