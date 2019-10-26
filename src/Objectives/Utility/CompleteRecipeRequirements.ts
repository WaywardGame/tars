import { DoodadTypeGroup } from "doodad/IDoodad";
import { IRecipe } from "item/IItem";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import AcquireBuildMoveToDoodad from "../Acquire/Doodad/AcquireBuildMoveToDoodad";
import AcquireBuildMoveToFire from "../Acquire/Doodad/AcquireBuildMoveToFire";
import MoveToTarget from "../Core/MoveToTarget";
import StartFire from "../Other/StartFire";

export default class CompleteRecipeRequirements extends Objective {

	constructor(private readonly recipe: IRecipe) {
		super();
	}

	public getIdentifier(): string {
		return `CompleteRecipeRequirements:${this.recipe.requiredDoodad}:${this.recipe.requiresFire}`;
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

		if (this.recipe.requiredDoodad !== undefined && this.recipe.requiresFire) {
			this.log.info("Recipe requires doodad and fire too");

			if (this.recipe.requiredDoodad !== DoodadTypeGroup.Anvil) {
				this.log.error("Required doodad is not an anvil", this.recipe.requiredDoodad);
				return ObjectiveResult.Impossible;
			}

			const anvil = context.base.anvil[0];
			const kiln = context.base.kiln[0];

			if (!anvil) {
				objectives.push(new AcquireBuildMoveToDoodad(this.recipe.requiredDoodad));
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

		} else if (this.recipe.requiredDoodad !== undefined) {
			this.log.info("Recipe requires doodad");
			objectives.push(new AcquireBuildMoveToDoodad(this.recipe.requiredDoodad));

		} else if (this.recipe.requiresFire) {
			this.log.info("Recipe requires fire");
			objectives.push(new AcquireBuildMoveToFire());
		}

		return objectives;
	}

}
