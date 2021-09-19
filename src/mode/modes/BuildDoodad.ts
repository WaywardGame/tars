import { EventBus } from "event/EventBuses";
import { EventHandler } from "event/EventManager";
import Doodad from "game/doodad/Doodad";
import DoodadManager from "game/doodad/DoodadManager";
import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import Human from "game/entity/Human";
import Doodads from "game/doodad/Doodads";

import Context from "../../Context";
import { IObjective, ObjectiveResult } from "../../IObjective";
import { ITarsMode } from "../IMode";
import AcquireItemForDoodad from "../../objectives/acquire/item/AcquireItemForDoodad";
import BuildItem from "../../objectives/other/item/BuildItem";
import MoveToTarget from "../../objectives/core/MoveToTarget";
import StartFire from "../../objectives/other/doodad/StartFire";
import Lambda from "../../objectives/core/Lambda";
import { doodadUtilities } from "../../utilities/Doodad";
import { itemUtilities } from "../../utilities/Item";
// import AcquireBuildMoveToDoodad from "../../objectives/acquire/doodad/AcquireBuildMoveToDoodad";

export class BuildDoodadMode implements ITarsMode {

	private finished: () => void;

	private doodad: number | undefined;

	private doodadTypes: Set<DoodadType>;

	constructor(private readonly doodadTypeOrGroup: DoodadType | DoodadTypeGroup) {
		this.doodadTypes = doodadUtilities.getDoodadTypes(this.doodadTypeOrGroup);
	}

	public async initialize(_: Context, finished: () => void) {
		this.finished = finished;
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		// should this work?
		// return [new AcquireBuildMoveToDoodad(this.doodadTypeOrGroup)];

		// const doodad = findDoodad(context, "BuildDoodad", (d: Doodad) => this.doodadTypes.has(d.type));
		const doodad = this.doodad ? island.doodads[this.doodad] : undefined;
		if (doodad && !doodad.isValid()) {
			this.doodad = undefined;
		}

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

		if (doodad) {
			if (requiresFire) {
				// StartFire handles fetching fire supplies and moving to the doodad to light it
				objectives.push(new StartFire(doodad));

			} else {
				objectives.push(new MoveToTarget(doodad, true));
				objectives.push(new Lambda(async () => {
					this.finished();
					return ObjectiveResult.Complete;
				}));
			}
		}
		else {
			const inventoryItem = itemUtilities.getInventoryItemForDoodad(context, this.doodadTypeOrGroup);
			if (inventoryItem) {
				objectives.push(new BuildItem(inventoryItem));

			} else {
				objectives.push(new AcquireItemForDoodad(this.doodadTypeOrGroup));
			}
		}

		return objectives;
	}

	@EventHandler(EventBus.DoodadManager, "create")
	public onDoodadCreate(_: DoodadManager, doodad: Doodad, creator?: Human) {
		if (creator === localPlayer && this.doodadTypes.has(doodad.type)) {
			this.doodad = doodad.id;
		}
	}
}
