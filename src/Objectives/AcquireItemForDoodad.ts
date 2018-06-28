import { ActionType, DoodadType, DoodadTypeGroup, ItemType } from "Enums";
import { itemDescriptions as Items } from "item/Items";
import Enums from "utilities/enum/Enums";
import * as Helpers from "../Helpers";
import { IObjective, missionImpossible, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import AcquireItem from "./AcquireItem";

export default class AcquireItemForDoodad extends Objective {

	constructor(private doodadTypeOrGroup: DoodadType | DoodadTypeGroup) {
		super();
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const doodadTypes = Helpers.getDoodadTypes(this.doodadTypeOrGroup);

		const objectiveSets: IObjective[][] = [];

		for (const dt of doodadTypes) {
			for (const it of Enums.values(ItemType)) {
				const itemDescription = Items[it];
				if (itemDescription && itemDescription.onUse && itemDescription.onUse[ActionType.Build] === dt) {
					objectiveSets.push([new AcquireItem(it)]);
				}
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
