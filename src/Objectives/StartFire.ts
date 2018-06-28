import { IDoodad } from "doodad/IDoodad";
import { ActionType, ItemTypeGroup } from "Enums";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems, MoveResult } from "../ITars";
import Objective from "../Objective";
import AcquireItemByGroup from "./AcquireItemByGroup";
import AcquireItemForAction from "./AcquireItemForAction";
import UseItem from "./UseItem";

export default class StartFire extends Objective {

	constructor(private doodad: IDoodad) {
		super();
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (calculateDifficulty) {
			const objectives: IObjective[] = [];

			if (inventory.fireStarter === undefined) {
				objectives.push(new AcquireItemForAction(ActionType.StartFire));
			}

			if (inventory.fireKindling === undefined) {
				objectives.push(new AcquireItemByGroup(ItemTypeGroup.Kindling));
			}

			if (inventory.fireTinder === undefined) {
				objectives.push(new AcquireItemByGroup(ItemTypeGroup.Tinder));
			}

			objectives.push(new UseItem(undefined!, ActionType.StartFire, this.doodad));

			return this.calculateObjectiveDifficulties(base, inventory, objectives);
		}

		const description = this.doodad.description();
		if (!description || description.lit === undefined || description.providesFire) {
			const moveResult = await Helpers.moveToTarget(this.doodad);
			if (moveResult === MoveResult.NoPath) {
				this.log.info("No path to doodad");
				return ObjectiveStatus.Complete;
			}

			if (moveResult === MoveResult.Moving) {
				return;
			}

			return ObjectiveStatus.Complete;
		}

		if (inventory.fireStarter === undefined) {
			return new AcquireItemForAction(ActionType.StartFire);
		}

		if (inventory.fireKindling === undefined) {
			return new AcquireItemByGroup(ItemTypeGroup.Kindling);
		}

		if (inventory.fireTinder === undefined) {
			return new AcquireItemByGroup(ItemTypeGroup.Tinder);
		}

		return new UseItem(inventory.fireStarter, ActionType.StartFire, this.doodad);
	}

}
