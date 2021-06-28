import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Navigation from "../../navigation/Navigation";
import Objective from "../../Objective";
import { tileUtilities } from "../../utilities/Tile";
import MoveToTarget from "../core/MoveToTarget";

export default class MoveToWater extends Objective {

	constructor(private readonly deepWater = true) {
		super();
	}

	public getIdentifier(): string {
		return `MoveToWater:${this.deepWater}`;
	}

	public getStatus(): string | undefined {
		return "Moving to water";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.deepWater ? tileUtilities.isOverDeepWater(context) : tileUtilities.isSwimmingOrOverWater(context)) {
			return ObjectiveResult.Complete;
		}

		const navigation = Navigation.get();

		const target = TileHelpers.findMatchingTile(context.getPosition(), (point, tile) => {
			const tileType = TileHelpers.getType(tile);
			const terrainDescription = Terrains[tileType];
			if (terrainDescription && (this.deepWater ? terrainDescription.deepWater : terrainDescription.water) &&
				!navigation.isDisabledFromPoint(point)) {
				// find the safest point
				return true;
			}

			return false;
		});

		if (!target) {
			return ObjectiveResult.Impossible;
		}

		return new MoveToTarget(target, false, { allowBoat: true, disableStaminaCheck: true });
	}

}
