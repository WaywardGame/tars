import type { ITile } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";

export default class MoveToWater extends Objective {

	constructor(private readonly ocean = true, private readonly allowBoat = true) {
		super();
	}

	public getIdentifier(): string {
		return `MoveToWater:${this.ocean}:${this.allowBoat}`;
	}

	public getStatus(): string | undefined {
		return this.ocean ? "Moving to the ocean" : "Moving to water";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.human.vehicleItemReference) {
			// todo: confirm this
			return ObjectiveResult.Complete;
		}

		if (this.ocean ? context.utilities.tile.isOverDeepSeaWater(context) : context.utilities.tile.isSwimmingOrOverWater(context)) {
			return ObjectiveResult.Complete;
		}

		const navigation = context.utilities.navigation;

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
					const result = context.human.canSailAwayFromPosition(context.human.island, point);
					if (result.canSailAway) {
						return true;
					}

					if (result.blockedTilesChecked) {
						disabledTiles.addFrom(result.blockedTilesChecked);
					}

					return false;
				}

				return true;
			}

			return false;
		});

		if (!target) {
			return ObjectiveResult.Impossible;
		}

		return new MoveToTarget(target, false, { allowBoat: this.allowBoat, disableStaminaCheck: true });
	}

}
