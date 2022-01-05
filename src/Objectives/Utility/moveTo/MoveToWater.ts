import { canSailAwayFromPosition } from "game/entity/action/actions/SailToIsland";
import { ITile, TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";

import Context from "../../../core/context/Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../../core/objective/IObjective";
import Navigation from "../../../core/navigation/Navigation";
import Objective from "../../../core/objective/Objective";
import { tileUtilities } from "../../../utilities/Tile";
import MoveToTarget from "../../core/MoveToTarget";

export default class MoveToWater extends Objective {

	constructor(private readonly ocean = true) {
		super();
	}

	public getIdentifier(): string {
		return `MoveToWater:${this.ocean}`;
	}

	public getStatus(): string | undefined {
		return this.ocean ? "Moving to the ocean" : "Moving to water";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.player.vehicleItemReference) {
			// todo: confirm this
			return ObjectiveResult.Complete;
		}

		if (this.ocean ? tileUtilities.isOverDeepSeaWater(context) : tileUtilities.isSwimmingOrOverWater(context)) {
			return ObjectiveResult.Complete;
		}

		const navigation = Navigation.get();

		const disabledTiles: Set<ITile> = new Set();

		const target = TileHelpers.findMatchingTile(context.island, context.getPosition(), (_, point, tile) => {
			if (disabledTiles.has(tile)) {
				return false;
			}

			const tileType = TileHelpers.getType(tile);
			const terrainDescription = Terrains[tileType];
			if (terrainDescription && (this.ocean ? tileType === TerrainType.DeepSeawater : terrainDescription.water) &&
				!navigation.isDisabledFromPoint(point)) {
				// find the safest point

				if (this.ocean) {
					const result = canSailAwayFromPosition(context.player.island, point);
					if (result.canSailAway) {
						return true;
					}

					disabledTiles.addFrom(result.blockedTilesChecked);

					return false;
				}

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
