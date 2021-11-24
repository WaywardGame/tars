import Doodad from "game/doodad/Doodad";
import DoodadManager from "game/doodad/DoodadManager";
import Doodads from "game/doodad/Doodads";
import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import Context from "../../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
import { baseUtilities } from "../../../utilities/Base";
import { doodadUtilities } from "../../../utilities/Doodad";
import { itemUtilities } from "../../../utilities/Item";
import { objectUtilities } from "../../../utilities/Object";
import MoveToTarget from "../../core/MoveToTarget";
import StartFire from "../../other/doodad/StartFire";
import BuildItem from "../../other/item/BuildItem";
import AcquireItemForDoodad from "../item/AcquireItemForDoodad";


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
		return `AcquireBuildMoveToDoodad:${DoodadManager.isGroup(this.doodadTypeOrGroup) ? DoodadTypeGroup[this.doodadTypeOrGroup] : DoodadType[this.doodadTypeOrGroup]}`;
	}

	public getStatus(): string | undefined {
		return `Acquiring ${DoodadManager.isGroup(this.doodadTypeOrGroup) ? Translation.nameOf(Dictionary.DoodadGroup, this.doodadTypeOrGroup).getString() : Translation.nameOf(Dictionary.Doodad, this.doodadTypeOrGroup).getString()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const doodadTypes = doodadUtilities.getDoodadTypes(this.doodadTypeOrGroup);

		const doodad = objectUtilities.findDoodad(context, this.getIdentifier(), (d: Doodad) => doodadTypes.has(d.type) && baseUtilities.isBaseDoodad(context, d));

		let requiresFire = false;

		if (doodad) {
			const description = doodad.description();
			if (description && description.lit !== undefined) {
				if (DoodadManager.isGroup(this.doodadTypeOrGroup)) {
					const litDescription = Doodads[description.lit];
					if (litDescription && DoodadManager.isInGroup(description.lit, this.doodadTypeOrGroup)) {
						requiresFire = true;
					}

				} else if (description.lit === this.doodadTypeOrGroup) {
					requiresFire = true;
				}
			}
		}

		const objectives: IObjective[] = [];

		if (!doodad) {
			const inventoryItem = itemUtilities.getInventoryItemForDoodad(context, this.doodadTypeOrGroup);
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
