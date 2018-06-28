import { IStat, Stat } from "entity/IStats";
import { ActionType, ItemTypeGroup, WeightStatus } from "Enums";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import AcquireItemByGroup from "./AcquireItemByGroup";
import OrganizeInventory from "./OrganizeInventory";
import UseItem from "./UseItem";

export default class RecoverHealth extends Objective {

	private saveChildObjectives = false;

	public shouldSaveChildObjectives(): boolean {
		return this.saveChildObjectives;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const healItems = Helpers.getInventoryItemsWithUse(ActionType.Heal);
		if (healItems.length > 0) {
			this.log.info(`Healing with ${game.getName(healItems[0])}`);
			return new UseItem(healItems[0], ActionType.Heal);
		}

		if (localPlayer.getWeightStatus() !== WeightStatus.None) {
			// special case - this interrupt is instead of ReduceWeight
			// reduce weight now
			this.log.info("Reduce weight before finding a health item");
			this.saveChildObjectives = false;
			return new OrganizeInventory(true, false);
		}

		this.saveChildObjectives = true;

		if (!localPlayer.status.Bleeding && localPlayer.getStat<IStat>(Stat.Hunger).value < 0) {
			// fix hunger first (continue to the hunger interrupt)
			return ObjectiveStatus.Complete;
		}

		this.log.info("Acquire a Health item");
		return new AcquireItemByGroup(ItemTypeGroup.Health);
	}

}
