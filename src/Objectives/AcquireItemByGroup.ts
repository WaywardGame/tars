import { ItemTypeGroup } from "Enums";
import Collectors from "utilities/iterable/Collectors";
import { IObjective, missionImpossible, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import AcquireItem from "./AcquireItem";

export default class AcquireItemByGroup extends Objective {

	constructor(private readonly itemTypeGroup: ItemTypeGroup) {
		super();
	}

	public getHashCode(): string {
		return `AcquireItemByGroup:${itemManager.getItemTypeGroupName(this.itemTypeGroup, false)}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const objectiveSets: IObjective[][] = itemManager.getGroupItems(this.itemTypeGroup).values()
			.map(item => [new AcquireItem(item)])
			.collect(Collectors.toArray);

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
