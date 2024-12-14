import Deity from "@wayward/game/game/deity/Deity";

import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

// const deityItemLimit = 5

export default class DeitySacrifice extends Objective {

	constructor(private readonly deity: Deity) {
		super();
	}

	public getIdentifier(): string {
		return `DeitySacrifice:${this.deity}`;
	}

	public getStatus(): string | undefined {
		return `Sacrificing items to ${Deity[this.deity]}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		return ObjectiveResult.Ignore;

		// if (context.human.alignment.invoked) {
		// }

		// const objectives: IObjective[] = [];

		// if (context.base.altar.length === 0) {
		// 	objectives.push(new AcquireInventoryItem("altar"), new BuildItem(), new Restart());

		// } else {
		// 	const altar = context.base.altar[0];

		// 	if (altar.containedItems!.length < deityItemLimit) {
		// 		// try putting more items on the alter before sacrificing
		// 		let runes = context.utilities.item.getBaseItems(context).filter(item => item.isInGroup(ItemTypeGroup.AncientRune));

		// 		// test limit
		// 		runes = runes.slice(0, deityItemLimit);

		// 		if (runes.length === 0) {
		// 			return ObjectiveResult.Impossible;
		// 		}

		// 		objectives.push(new ReserveItems(...runes));

		// 		for (const item of runes) {
		// 			objectives.push(new MoveItemsIntoInventory(item));
		// 		}

		// 		objectives.push(new MoveToTarget(context.base.altar[0], true));

		// 		for (const item of runes) {
		// 			objectives.push(new MoveItemsFromContainer(item, altar as IContainer));
		// 		}
		// 	}

		// 	objectives.push(new ExecuteAction(Sacrifice, () => {
		// 		return [{ deity: this.deity, altar }] as ActionArgumentsOf<typeof Sacrifice>;
		// 	}).setStatus(this));
		// }

		// return objectives;
	}

}
