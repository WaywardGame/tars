import ActionExecutor from "action/ActionExecutor";
import actionDescriptions from "action/Actions";
import { ActionType, IActionDescription } from "action/IAction";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import { executeAction } from "../Utilities/Action";

export default class ExecuteAction<T extends ActionType> extends Objective {

	constructor(private readonly actionType: T, private readonly executor: (action: ((typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R> ? ActionExecutor<A, E, R> : never)) => void, private readonly complete: boolean = true) {
		super();
	}

	public getHashCode(): string {
		return `ExecuteAction:${ActionType[this.actionType]}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (calculateDifficulty) {
			return 0;
		}

		await executeAction(this.actionType, this.executor as any);

		if (this.complete) {
			return ObjectiveStatus.Complete;
		}
	}

}
