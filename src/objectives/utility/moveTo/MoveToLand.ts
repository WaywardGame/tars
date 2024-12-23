import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";
import { defaultMaxTilesChecked } from "../../../core/ITars";

export default class MoveToLand extends Objective {

	public getIdentifier(): string {
		return "MoveToLand";
	}

	public getStatus(): string | undefined {
		return "Moving to land";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!context.utilities.tile.isSwimmingOrOverWater(context)) {
			return ObjectiveResult.Complete;
		}

		const navigation = context.utilities.navigation;

		const target = context.getTile().findMatchingTile(tile => {
			const terrainDescription = tile.description;
			if (terrainDescription && !terrainDescription.water &&
				!navigation.isDisabled(tile) && navigation.getPenalty(tile) === 0) {
				// find the safest point to land on
				return true;
			}

			return false;
		}, { maxTilesChecked: defaultMaxTilesChecked });

		if (!target) {
			return ObjectiveResult.Impossible;
		}

		return new MoveToTarget(target, false, { disableStaminaCheck: true });
	}

}
