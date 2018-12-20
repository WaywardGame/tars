import { ActionType } from "action/IAction";
import { WeightStatus } from "Enums";
import { IContainer } from "item/IItem";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import { getUnusedItems } from "../Utilities/Item";
import ExecuteAction from "./ExecuteAction";
import OrganizeInventory from "./OrganizeInventory";

export default class ReduceWeight extends Objective {

	public getHashCode(): string {
		return "ReduceWeight";
	}

	public shouldSaveChildObjectives(): boolean {
		return false;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const weightStatus = localPlayer.getWeightStatus();
		if (weightStatus === WeightStatus.None) {
			const doodadInFront = localPlayer.getFacingTile().doodad;
			const chest = base.chests !== undefined ? base.chests.find(c => c === doodadInFront) : undefined;
			if (chest) {
				this.log.info("Still infront of chest");

				const targetContainer = chest as IContainer;
				const containerWeight = itemManager.computeContainerWeight(targetContainer);

				// move extra items into the chest
				let unusedExtraItems = getUnusedItems(inventory);

				unusedExtraItems = unusedExtraItems
					.filter(item => (containerWeight + item.weight) <= targetContainer.weightCapacity!)
					.filter(item => unusedExtraItems.filter(i => i.type === item.type).length >= 3);

				if (unusedExtraItems.length > 0) {
					const item = unusedExtraItems[0];

					this.log.info(`Moving extra item ${item.getName().getString()} into chest`);

					return new ExecuteAction(ActionType.MoveItem, action => action.execute(localPlayer, item, undefined, targetContainer), false);
				}
			}

			return ObjectiveStatus.Complete;
		}

		return new OrganizeInventory(true, weightStatus !== WeightStatus.Overburdened);
	}

}
