import { ItemType, ItemTypeGroup } from "Enums";
import { itemDescriptions as Items } from "item/Items";
import Enums from "utilities/enum/Enums";
import { IObjective, missionImpossible, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import AcquireItem from "./AcquireItem";

export default class AcquireItemByGroup extends Objective {

	constructor(private itemTypeGroup: ItemTypeGroup) {
		super();
	}

	public getHashCode(): string {
		return `AcquireItemByGroup:${itemManager.getItemTypeGroupName(this.itemTypeGroup, false)}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const objectiveSets: IObjective[][] = [];

		for (const it of Enums.values(ItemType)) {
			const itemDescription = Items[it];
			if (itemDescription && itemDescription.group !== undefined && itemDescription.group.indexOf(this.itemTypeGroup as ItemTypeGroup) !== -1) {
				objectiveSets.push([new AcquireItem(it)]);
			}
		}

		const objective = await this.pickEasiestObjective(base, inventory, objectiveSets);

		if (objective === undefined) {
			if (calculateDifficulty) {
				return missionImpossible;
			}

			return ObjectiveStatus.Complete;
		}

		return objective;
	}

}
