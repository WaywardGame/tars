import { DoodadTypeGroup } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import { IRequirementInfo, RequirementStatus } from "game/item/IItemManager";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import AcquireBuildMoveToDoodad from "../acquire/doodad/AcquireBuildMoveToDoodad";
import AcquireBuildMoveToFire from "../acquire/doodad/AcquireBuildMoveToFire";
import AnalyzeBase from "../analyze/AnalyzeBase";
import ExecuteAction from "../core/ExecuteAction";
import Lambda from "../core/Lambda";
import MoveToTarget from "../core/MoveToTarget";
import StartFire from "../other/doodad/StartFire";

export default class CompleteRequirements extends Objective {

	constructor(private readonly requirementInfo: IRequirementInfo) {
		super();
	}

	public getIdentifier(): string {
		return `CompleteRequirements:${this.requirementInfo.fireRequirement}:${this.requirementInfo.doodadsRequired.join(",")}`;
	}

	public getStatus(): string | undefined {
		return "Completing requirements for a recipe";
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(): boolean {
		// we care about the context's reserved items
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.requirementInfo.doodadsRequired.length > 1) {
			this.log.warn("Requires more than a single doodad", this.requirementInfo.doodadsRequired);
			return ObjectiveResult.Impossible;
		}

		const requiresDoodads = this.requirementInfo.doodadsRequired.length > 0;
		const requiresFire = this.requirementInfo.fireRequirement !== RequirementStatus.NotRequired;

		const objectives: IObjective[] = [];

		if (requiresDoodads && requiresFire) {
			this.log.info("Requires doodad and fire", this.requirementInfo.doodadsRequired);

			const primaryDoodad = this.requirementInfo.doodadsRequired[0];

			if (primaryDoodad !== DoodadTypeGroup.Anvil) {
				this.log.warn("Required doodad is not an anvil", this.requirementInfo.doodadsRequired);
				return ObjectiveResult.Impossible;
			}

			const anvil = context.base.anvil[0];
			const kiln = context.base.kiln[0];

			if (!anvil) {
				objectives.push(new AcquireBuildMoveToDoodad(primaryDoodad));
				objectives.push(new AnalyzeBase());
				objectives.push(new Lambda(async context => {
					if (!context.base.anvil[0]) {
						// the anvil we went to is not our base anvil
						// it was probably not placed correctly
						// pick it up. the object will be then built in the correct spot
						return new ExecuteAction(ActionType.Pickup, (context, action) => {
							action.execute(context.player);
							return ObjectiveResult.Complete;
						}).setStatus("Picking up anvil to place it next to the kiln");
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

		} else if (requiresDoodads) {
			this.log.info("Requires doodad", this.requirementInfo.doodadsRequired[0]);
			objectives.push(new AcquireBuildMoveToDoodad(this.requirementInfo.doodadsRequired[0]));

		} else if (requiresFire) {
			this.log.info("Requires fire");
			objectives.push(new AcquireBuildMoveToFire());
		}

		return objectives;
	}

}
