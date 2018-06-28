import Doodads from "doodad/Doodads";
import { IDoodad } from "doodad/IDoodad";
import { DoodadType, DoodadTypeGroup } from "Enums";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems, MoveResult } from "../ITars";
import Objective from "../Objective";
import AcquireItemForDoodad from "./AcquireItemForDoodad";
import BuildItem from "./BuildItem";
import StartFire from "./StartFire";

export default class AcquireBuildMoveToDoodad extends Objective {

	constructor(private doodadTypeOrGroup: DoodadType | DoodadTypeGroup) {
		super();
	}

	public getHashCode(): string {
		return `AcquireBuildMoveToDoodad:${this.doodadTypeOrGroup}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const doodadTypes = Helpers.getDoodadTypes(this.doodadTypeOrGroup);

		const doodad = Helpers.findDoodad(this.getHashCode(), (d: IDoodad) => doodadTypes.indexOf(d.type) !== -1);

		let requiresFire = false;

		if (doodad) {
			const description = doodad.description();
			if (description && description.lit !== undefined) {
				if (doodadManager.isDoodadTypeGroup(this.doodadTypeOrGroup)) {
					const litDescription = Doodads[description.lit];
					if (litDescription && litDescription.group === this.doodadTypeOrGroup) {
						requiresFire = true;
					}

				} else if (description.lit === this.doodadTypeOrGroup) {
					requiresFire = true;
				}
			}
		}

		if (calculateDifficulty) {
			const objectives: IObjective[] = [];

			if (!doodad) {
				objectives.push(new AcquireItemForDoodad(this.doodadTypeOrGroup));
				objectives.push(new BuildItem(undefined!));
			}

			if (requiresFire) {
				objectives.push(new StartFire(doodad!));
			}

			return this.calculateObjectiveDifficulties(base, inventory, objectives);
		}

		if (doodad === undefined) {
			return new AcquireItemForDoodad(this.doodadTypeOrGroup);
		}

		if (requiresFire) {
			return new StartFire(doodad);
		}

		const moveResult = await Helpers.moveToTarget(doodad);
		if (moveResult === MoveResult.NoPath) {
			this.log.info("No path to doodad");
			return ObjectiveStatus.Complete;
		}

		if (moveResult !== MoveResult.Complete) {
			return;
		}

		return ObjectiveStatus.Complete;
	}

}
