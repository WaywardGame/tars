import Doodad from "game/doodad/Doodad";
import { ActionType } from "game/entity/action/IAction";
import { ItemTypeGroup } from "game/item/IItem";
import { TileEventType } from "game/tile/ITileEvent";

import Context from "../../../Context";
import { ContextDataType } from "../../../IContext";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
import AcquireItemByGroup from "../../acquire/item/AcquireItemByGroup";
import AcquireItemForAction from "../../acquire/item/AcquireItemForAction";
import MoveToTarget from "../../core/MoveToTarget";

import UseItem from "../item/UseItem";

export default class StartFire extends Objective {

	constructor(private readonly doodad?: Doodad) {
		super();
	}

	public getIdentifier(): string {
		return `StartFire:${this.doodad}`;
	}

	public getStatus(): string | undefined {
		return `Starting a fire for ${this.doodad?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const doodad = this.doodad || context.getData(ContextDataType.LastBuiltDoodad);
		if (!doodad) {
			this.log.error("Invalid doodad");
			return ObjectiveResult.Restart;
		}

		const objectives: IObjective[] = [];

		const description = doodad.description();
		if (!description || description.lit === undefined || description.providesFire) {
			// it's already lit
			objectives.push(new MoveToTarget(doodad, true));

		} else {
			if (context.island.tileEvents.getFromTile(doodad.getTile(), TileEventType.Fire)) {
				this.log.warn("Doodad already on fire?");
				return ObjectiveResult.Impossible;
			}

			if (context.inventory.fireKindling === undefined) {
				objectives.push(new AcquireItemByGroup(ItemTypeGroup.Kindling));
			}

			if (context.inventory.fireTinder === undefined) {
				objectives.push(new AcquireItemByGroup(ItemTypeGroup.Tinder));
			}

			if (context.inventory.fireStarter === undefined) {
				objectives.push(new AcquireItemForAction(ActionType.StartFire));
			}

			objectives.push(new MoveToTarget(doodad, true));

			objectives.push(new UseItem(ActionType.StartFire, context.inventory.fireStarter));
		}

		return objectives;
	}

}
