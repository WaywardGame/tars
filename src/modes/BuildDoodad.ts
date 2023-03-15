import { EventBus } from "event/EventBuses";
import { EventHandler } from "event/EventManager";
import type Doodad from "game/doodad/Doodad";
import type DoodadManager from "game/doodad/DoodadManager";
import type { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import type Human from "game/entity/Human";
import { doodadDescriptions } from "game/doodad/Doodads";

import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import AcquireItemForDoodad from "../objectives/acquire/item/AcquireItemForDoodad";
import BuildItem from "../objectives/other/item/BuildItem";
import MoveToTarget from "../objectives/core/MoveToTarget";
import StartFire from "../objectives/other/doodad/StartFire";
import Lambda from "../objectives/core/Lambda";
import type { ITarsMode } from "../core/mode/IMode";

// import AcquireBuildMoveToDoodad from "../../objectives/acquire/doodad/AcquireBuildMoveToDoodad";

export class BuildDoodadMode implements ITarsMode {

	private finished: (success: boolean) => void;
	private doodadTypes: Set<DoodadType>;

	private doodad: number | undefined;

	constructor(private readonly doodadTypeOrGroup: DoodadType | DoodadTypeGroup) {
	}

	public async initialize(context: Context, finished: (success: boolean) => void) {
		this.finished = finished;
		this.doodadTypes = context.utilities.doodad.getDoodadTypes(this.doodadTypeOrGroup);
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		// should this work?
		// return [new AcquireBuildMoveToDoodad(this.doodadTypeOrGroup)];

		// const doodad = findDoodad(context, "BuildDoodad", (d: Doodad) => this.doodadTypes.has(d.type));
		const doodad = this.doodad ? context.human.island.doodads.get(this.doodad) : undefined;
		if (doodad && !doodad.isValid()) {
			this.doodad = undefined;
		}

		let requiresFire = false;

		if (doodad) {
			const description = doodad.description();
			if (description && description.lit !== undefined) {
				if (context.human.island.doodads.isGroup(this.doodadTypeOrGroup)) {
					const litDescription = doodadDescriptions[description.lit];
					if (litDescription && context.human.island.doodads.isInGroup(description.lit, this.doodadTypeOrGroup)) {
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
					this.finished(true);
					return ObjectiveResult.Complete;
				}));
			}
		}
		else {
			const inventoryItem = context.utilities.item.getInventoryItemForDoodad(context, this.doodadTypeOrGroup);
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
