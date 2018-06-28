import { ActionType } from "Enums";
import { IItem } from "item/IItem";
import { IVector3 } from "utilities/math/IVector";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems, MoveResult } from "../ITars";
import Objective from "../Objective";
import ExecuteAction from "./ExecuteAction";

export default class UseItem extends Objective {

	constructor(private item: IItem, private useActionType: ActionType, private target?: IVector3) {
		super();
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (this.target) {
			if (calculateDifficulty) {
				return Helpers.calculateDifficultyMoveToTarget(this.target);
			}

			const moveResult = await Helpers.moveToTarget(this.target);
			if (moveResult === MoveResult.NoPath) {
				this.log.info("No path for use item target");
				return;
			}

			if (moveResult !== MoveResult.Complete) {
				return;
			}
		}

		return new ExecuteAction(ActionType.UseItem, {
			item: this.item,
			useActionType: this.useActionType
		});
	}

}
