import Doodad from "game/doodad/Doodad";
import Doodads from "game/doodad/Doodads";
import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";

import Context from "../../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
import { getDoodadTypes } from "../../../utilities/Doodad";
import { getInventoryItemForDoodad } from "../../../utilities/Item";
import { findDoodad } from "../../../utilities/Object";
import MoveToTarget from "../../core/MoveToTarget";
import BuildItem from "../../other/BuildItem";
import StartFire from "../../other/StartFire";
import AcquireItemForDoodad from "../Item/AcquireItemForDoodad";

/**
 * Acquires, builds, and moves to the doodad
 * 
 * If the doodad doesn't exist and the build item isn't in the inventory, it will acquire the item.
 * 
 * If the doodad doesn't exist and the build item is in the inventory, it will build it.
 * 
 * If the doodad exists, it will move to face the doodad.
 * 
 * If the lit version of the doodad is specified, it will light the fire for it.
 */
export default class AcquireBuildMoveToDoodad extends Objective {

	constructor(private readonly doodadTypeOrGroup: DoodadType | DoodadTypeGroup) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireBuildMoveToDoodad:${doodadManager.isGroup(this.doodadTypeOrGroup) ? DoodadTypeGroup[this.doodadTypeOrGroup] : DoodadType[this.doodadTypeOrGroup]}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const doodadTypes = getDoodadTypes(this.doodadTypeOrGroup);

		const doodad = findDoodad(context, this.getIdentifier(), (d: Doodad) => doodadTypes.has(d.type));

		let requiresFire = false;

		if (doodad) {
			const description = doodad.description();
			if (description && description.lit !== undefined) {
				if (doodadManager.isGroup(this.doodadTypeOrGroup)) {
					const litDescription = Doodads[description.lit];
					if (litDescription && doodadManager.isInGroup(description.lit, this.doodadTypeOrGroup)) {
						requiresFire = true;
					}

				} else if (description.lit === this.doodadTypeOrGroup) {
					requiresFire = true;
				}
			}
		}

		const objectives: IObjective[] = [];

		if (!doodad) {
			const inventoryItem = getInventoryItemForDoodad(context, this.doodadTypeOrGroup);
			if (inventoryItem === undefined) {
				objectives.push(new AcquireItemForDoodad(this.doodadTypeOrGroup));
			}

			objectives.push(new BuildItem(inventoryItem));
		}

		if (requiresFire) {
			// StartFire handles fetching fire supplies and moving to the doodad to light it
			objectives.push(new StartFire(doodad));

		} else if (doodad) {
			objectives.push(new MoveToTarget(doodad, true));
		}

		return objectives;
	}

}
