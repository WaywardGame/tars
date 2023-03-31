import { WaterType } from "game/island/IIsland";
import { TerrainType } from "game/tile/ITerrain";
import Tile from "game/tile/Tile";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";

export enum MoveToWaterType {
	AnyWater,
	SailAwayWater,
	FishableWater,
}

export interface IMoveToWaterOptions {
	fishingRange: number;
	disallowBoats: boolean;
	moveToAdjacentTile: boolean;
}

export default class MoveToWater extends Objective {

	constructor(private readonly waterType: MoveToWaterType, private readonly options?: Partial<IMoveToWaterOptions>) {
		super();
	}

	public getIdentifier(): string {
		return `MoveToWater:${this.waterType}:${this.options?.disallowBoats}:${this.options?.moveToAdjacentTile}`;
	}

	public getStatus(): string | undefined {
		return this.waterType === MoveToWaterType.AnyWater ? "Moving to water" : "Moving to the ocean";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.human.vehicleItemReference) {
			// todo: confirm this
			return ObjectiveResult.Complete;
		}

		if (this.waterType === MoveToWaterType.AnyWater && context.utilities.tile.isSwimmingOrOverWater(context)) {
			return ObjectiveResult.Complete;
		}

		// ? context.utilities.tile.isOverDeepSeaWater(context) :

		const navigation = context.utilities.navigation;

		const disabledTiles: Set<Tile> = new Set();

		const target = context.getTile().findMatchingTile((tile) => {
			if (disabledTiles.has(tile)) {
				return false;
			}

			const tileType = tile.type;
			const terrainDescription = tile.description;
			if (!terrainDescription) {
				return false;
			}

			switch (this.waterType) {
				case MoveToWaterType.AnyWater:
					if (!terrainDescription.water) {
						return false;
					}

					break;

				case MoveToWaterType.SailAwayWater:
					if (tileType !== TerrainType.DeepSeawater) {
						return false;
					}

					const result = tile.canSailAwayFrom();
					if (!result.canSailAway) {
						if (result.blockedTilesChecked) {
							disabledTiles.addFrom(result.blockedTilesChecked);
						}

						return false;
					}

					break;

				case MoveToWaterType.FishableWater:
					if (!terrainDescription.water || terrainDescription.shallowWater) {
						return false;
					}

					const tileData = tile.getTileData();
					if (tileData && !tileData[0].fishAvailable) {
						return false;
					}

					// fishing involves a range trace infront of the player
					// determine where the player is going to end up when moving to this fishable tile
					const standableNearbyPoints: IVector3[] = [];

					for (const nearbyTile of tile.getTilesAround()) {
						const nearbyTerrainDescription = nearbyTile.description;
						if ((nearbyTerrainDescription?.shallowWater || !nearbyTerrainDescription?.water) && !navigation.isDisabled(nearbyTile)) {
							standableNearbyPoints.push(nearbyTile);
						}
					}

					if (standableNearbyPoints.length === 0) {
						return false;
					}

					// verify that fishing will work for each possible neighbor position
					const targetTiles: Tile[] = [];

					for (const standableNearbyPoint of standableNearbyPoints) {
						const direction = Vector2.DIRECTIONS[context.island.getDirectionFromMovement(tile.x - standableNearbyPoint.x, tile.y - standableNearbyPoint.y)];

						// act like we are fishing from this tile
						const targetX = standableNearbyPoint.x + (direction.x * (this.options?.fishingRange ?? 1));
						const targetY = standableNearbyPoint.y + (direction.y * (this.options?.fishingRange ?? 1));

						const targetTile = context.island.getTile(targetX, targetY, tile.z);
						const targetTerrainDescription = targetTile.description;
						if (targetTerrainDescription?.shallowWater || !targetTerrainDescription?.water) {
							return false;
						}

						const targetTileData = targetTile.getTileData();
						if (targetTileData && !targetTileData[0].fishAvailable) {
							return false;
						}

						targetTiles.push(targetTile);

						// console.warn(targetX, targetY, this.options?.fishingRange, targetTileData?.[0]?.fishAvailable);
					}

					// verify the target points are actually fishable. this should be the most expensive check
					for (const targetTile of targetTiles) {
						const checkTiles = 16;
						const fillCount = context.island.checkWaterFill(targetTile, checkTiles, WaterType.None);
						if (fillCount < checkTiles) {
							return false;
						}
					}

					break;
			}

			if (navigation.isDisabled(tile)) {
				return false;
			}

			return true;
		});

		if (!target) {
			return ObjectiveResult.Impossible;
		}

		return new MoveToTarget(
			target,
			this.options?.moveToAdjacentTile ? true : false,
			{
				allowBoat: !this.options?.disallowBoats,
				disableStaminaCheck: true,
			});
	}

}
