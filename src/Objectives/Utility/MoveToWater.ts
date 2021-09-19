import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
import { TerrainType } from "game/tile/ITerrain";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Navigation from "../../navigation/Navigation";
import Objective from "../../Objective";
import { tileUtilities } from "../../utilities/Tile";
import MoveToTarget from "../core/MoveToTarget";

export default class MoveToWater extends Objective {

	constructor(private readonly deepSeaWater = true) {
		super();
	}

	public getIdentifier(): string {
		return `MoveToWater:${this.deepSeaWater}`;
	}

	public getStatus(): string | undefined {
		return "Moving to water";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.player.vehicleItemId !== undefined) {
			// todo: confirm this
			return ObjectiveResult.Complete;
		}

		if (this.deepSeaWater ? tileUtilities.isOverDeepSeaWater(context) : tileUtilities.isSwimmingOrOverWater(context)) {
			return ObjectiveResult.Complete;
		}

		const navigation = Navigation.get();

		const target = TileHelpers.findMatchingTile(context.getPosition(), (point, tile) => {
			const tileType = TileHelpers.getType(tile);
			const terrainDescription = Terrains[tileType];
			if (terrainDescription && (this.deepSeaWater ? tileType === TerrainType.DeepSeawater : terrainDescription.water) &&
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
