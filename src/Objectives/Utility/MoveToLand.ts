import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { defaultMaxTilesChecked } from "../../ITars";
import Navigation from "../../Navigation/Navigation";
import Objective from "../../Objective";
import { isOverWater } from "../../Utilities/Tile";
import MoveToTarget from "../Core/MoveToTarget";


export default class MoveToLand extends Objective {

	public getIdentifier(): string {
		return "MoveToLand";
	}

	public getStatus(): string {
		return "Moving to land";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!isOverWater(context)) {
			return ObjectiveResult.Complete;
		}

		const navigation = Navigation.get();

		const target = TileHelpers.findMatchingTile(context.getPosition(), (point, tile) => {
			const tileType = TileHelpers.getType(tile);
			const terrainDescription = Terrains[tileType];
			if (terrainDescription && !terrainDescription.water &&
				!navigation.isDisabledFromPoint(point) && navigation.getPenaltyFromPoint(point) === 0) {
				// find the safest point to land on
				return true;
			}

			return false;
		}, defaultMaxTilesChecked);

		if (!target) {
			return ObjectiveResult.Impossible;
		}

		return new MoveToTarget(target, false, { disableStaminaCheck: true });
	}

}
