import { DoodadType, DoodadTypeGroup } from "doodad/IDoodad";
import { ActionType } from "entity/action/IAction";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import AcquireBuildMoveToDoodad from "../Acquire/Doodad/AcquireBuildMoveToDoodad";
import AcquireBuildMoveToFire from "../Acquire/Doodad/AcquireBuildMoveToFire";
import AnalyzeBase from "../Analyze/AnalyzeBase";
import ExecuteAction from "../Core/ExecuteAction";
import Lambda from "../Core/Lambda";
import MoveToTarget from "../Core/MoveToTarget";
import StartFire from "../Other/StartFire";

export default class CompleteRequirements extends Objective {

	constructor(private readonly requiredDoodad: DoodadType | DoodadTypeGroup | undefined, private readonly requiresFire: boolean) {
		super();
	}

	public getIdentifier(): string {
		return `CompleteRequirements:${this.requiredDoodad}:${this.requiresFire}`;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(): boolean {
		// we care about the context's reserved items
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectives: IObjective[] = [];

		if (this.requiredDoodad !== undefined && this.requiresFire) {
			this.log.info("Requires doodad and fire too", this.requiredDoodad);

			if (this.requiredDoodad !== DoodadTypeGroup.Anvil) {
				this.log.error("Required doodad is not an anvil", this.requiredDoodad);
				return ObjectiveResult.Impossible;
			}

			const anvil = context.base.anvil[0];
			const kiln = context.base.kiln[0];

			if (!anvil) {
				objectives.push(new AcquireBuildMoveToDoodad(this.requiredDoodad));
				objectives.push(new AnalyzeBase());
				objectives.push(new Lambda(async context => {
					if (!context.base.anvil[0]) {
						// the anvil we went to is not our base anvil
						// it was probably not placed correctly
						// pick it up. the object will be then built in the correct spot
						this.log.info("Picking up anvil to place it next to the kiln");
						return new ExecuteAction(ActionType.Pickup, (context, action) => {
							action.execute(context.player);
						});
					}

					return ObjectiveResult.Complete;
				}));
			}

			if (!kiln) {
				objectives.push(new AcquireBuildMoveToFire("kiln"));
			}

			if (kiln && anvil) {
				objectives.push(new StartFire(kiln));

				objectives.push(new MoveToTarget({
					x: (kiln.x + anvil.x) / 2,
					y: (kiln.y + anvil.y) / 2,
					z: anvil.z,
				}, false));
			}

		} else if (this.requiredDoodad !== undefined) {
			this.log.info("Requires doodad");
			objectives.push(new AcquireBuildMoveToDoodad(this.requiredDoodad));

		} else if (this.requiresFire) {
			this.log.info("Requires fire");
			objectives.push(new AcquireBuildMoveToFire());
		}

		return objectives;
	}

}
