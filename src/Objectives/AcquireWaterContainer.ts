import { ItemType } from "Enums";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import AcquireItem from "./AcquireItem";

export default class AcquireWaterContainer extends Objective {

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		return this.pickEasiestObjective(base, inventory, [
			[new AcquireItem(ItemType.Waterskin)],
			[new AcquireItem(ItemType.ClayJug)],
			[new AcquireItem(ItemType.GlassBottle)]
		]);
	}

}
