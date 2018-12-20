import { ActionType } from "action/IAction";
import { } from "Enums";
import { IItem } from "item/IItem";
import { IVector3 } from "utilities/math/IVector";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import { getMovementPath, MoveResult, moveToFaceTarget } from "../Utilities/Movement";
import ExecuteAction from "./ExecuteAction";

export default class UseItem extends Objective {

	constructor(private readonly item: IItem | undefined, private readonly useActionType: ActionType, private readonly target?: IVector3) {
		super();
	}

	public getHashCode(): string {
		return `UseItem:${this.item && this.item.getName(false).getString()}|${ActionType[this.useActionType]}`;
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

		return new ExecuteAction(ActionType.UseItem, action => action.execute(localPlayer, this.item!, this.useActionType));
	}

}
