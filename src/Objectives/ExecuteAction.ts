import { ExecuteArgument } from "action/IAction";
import { ActionType } from "Enums";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";

export default class ExecuteAction extends Objective {

	constructor(private actionType: ActionType, private executeArgument?: ExecuteArgument, private complete: boolean = true) {
		super();
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (calculateDifficulty) {
			return 0;
		}

		await Helpers.executeAction(this.actionType, this.executeArgument);

		if (this.complete) {
			return ObjectiveStatus.Complete;
		}
	}

}
