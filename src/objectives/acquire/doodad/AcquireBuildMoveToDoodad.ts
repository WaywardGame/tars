import type Doodad from "game/doodad/Doodad";
import DoodadManager from "game/doodad/DoodadManager";
import { doodadDescriptions } from "game/doodad/Doodads";
import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";
import StartFire from "../../other/doodad/StartFire";
import BuildItem from "../../other/item/BuildItem";
import AcquireItemForDoodad from "../item/AcquireItemForDoodad";

export interface IAcquireBuildMoveToDoodadOptions {
	ignoreExistingDoodads: boolean;
	disableMoveTo: boolean;
}

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

	constructor(private readonly doodadTypeOrGroup: DoodadType | DoodadTypeGroup, private readonly options: Partial<IAcquireBuildMoveToDoodadOptions> = {}) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireBuildMoveToDoodad:${DoodadManager.isGroup(this.doodadTypeOrGroup) ? DoodadTypeGroup[this.doodadTypeOrGroup] : DoodadType[this.doodadTypeOrGroup]}`;
	}

	public getStatus(): string | undefined {
		return `Acquiring ${DoodadManager.isGroup(this.doodadTypeOrGroup) ? Translation.nameOf(Dictionary.DoodadGroup, this.doodadTypeOrGroup).getString() : Translation.nameOf(Dictionary.Doodad, this.doodadTypeOrGroup).getString()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const doodadTypes = context.utilities.doodad.getDoodadTypes(this.doodadTypeOrGroup);

		const doodads = !this.options.ignoreExistingDoodads ?
			context.utilities.object.findDoodads(context, this.getIdentifier(), (d: Doodad) => doodadTypes.has(d.type) && context.utilities.base.isBaseDoodad(context, d)) :
			undefined;
		if (doodads !== undefined && doodads.length > 0) {
			return doodads.map(doodad => {
				let requiresFire = false;

				const description = doodad.description();
				if (description && description.lit !== undefined) {
					if (DoodadManager.isGroup(this.doodadTypeOrGroup)) {
						const litDescription = doodadDescriptions[description.lit];
						if (litDescription && DoodadManager.isInGroup(description.lit, this.doodadTypeOrGroup)) {
							requiresFire = true;
						}

					} else if (description.lit === this.doodadTypeOrGroup) {
						requiresFire = true;
					}
				}

				const objectives: IObjective[] = [];

				if (requiresFire) {
					// StartFire handles fetching fire supplies and moving to the doodad to light it
					objectives.push(new StartFire(doodad));

				} else if (!this.options.disableMoveTo) {
					objectives.push(new MoveToTarget(doodad, true));
				}

				return objectives;
			});
		}

		// todo: calculate this correctly?
		const requiresFire = false;

		const objectives: IObjective[] = [];

		const inventoryItem = context.utilities.item.getInventoryItemForDoodad(context, this.doodadTypeOrGroup);
		if (inventoryItem === undefined) {
			objectives.push(new AcquireItemForDoodad(this.doodadTypeOrGroup));
		}

		objectives.push(new BuildItem(inventoryItem));

		if (requiresFire) {
			// StartFire handles fetching fire supplies and moving to the doodad to light it
			objectives.push(new StartFire());
		}

		return objectives;
	}

}
