import { ActionType, SentenceCaseStyle } from "Enums";
import { IItem } from "item/IItem";
import { IVector3 } from "utilities/math/IVector";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import ExecuteAction from "./ExecuteAction";
import { getMovementPath, moveToFaceTarget, MoveResult } from "../Utilities/Movement";

export default class UseItem extends Objective {

	constructor(private item: IItem | undefined, private useActionType: ActionType, private target?: IVector3) {
		super();
	}

	public getHashCode(): string {
		return `UseItem:${game.getName(this.item, SentenceCaseStyle.Title, false)}|${ActionType[this.useActionType]}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (this.target) {
			if (calculateDifficulty) {
				return (await getMovementPath(this.target, true)).difficulty;
			}

			const moveResult = await moveToFaceTarget(this.target);
			if (moveResult === MoveResult.NoPath) {
				this.log.info("No path for use item target");
				return;
			}

			if (moveResult !== MoveResult.Complete) {
				return;
			}
		}

		if (this.item === undefined) {
			this.log.error("Invalid item");
			return ObjectiveStatus.Complete;
		}

		return new ExecuteAction(ActionType.UseItem, {
			item: this.item,
			useActionType: this.useActionType
		});
	}

}
