import { getDirectionFromMovement } from "game/entity/player/IPlayer";
import { WaterType } from "game/island/IIsland";
import type { ITile } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
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

		const disabledTiles: Set<ITile> = new Set();

		const target = TileHelpers.findMatchingTile(context.island, context.getPosition(), (_, point, tile) => {
			if (disabledTiles.has(tile)) {
				return false;
			}

			const tileType = TileHelpers.getType(tile);
			const terrainDescription = Terrains[tileType];
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

					const result = context.human.canSailAwayFromPosition(context.human.island, point);
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

					const tileData = context.island.getTileData(point.x, point.y, point.z);
					if (tileData && !tileData[0].fishAvailable) {
						return false;
					}

					// fishing involves a range trace infront of the player
					// determine where the player is going to end up when moving to this fishable tile
					const standableNearbyPoints: IVector3[] = [];

					for (const nearbyPoint of TileHelpers.getPointsAround(point)) {
						const nearbyTile = context.island.getTileFromPoint(nearbyPoint);
						const nearbyTileType = TileHelpers.getType(nearbyTile);
						const nearbyTerrainDescription = Terrains[nearbyTileType];
						if ((nearbyTerrainDescription?.shallowWater || !nearbyTerrainDescription?.water) && !navigation.isDisabledFromPoint(nearbyPoint)) {
							standableNearbyPoints.push(nearbyPoint);
						}
					}

					if (standableNearbyPoints.length === 0) {
						return false;
					}

					// verify that fishing will work for each possible neighbor position
					const targetPoints: IVector3[] = [];

					for (const standableNearbyPoint of standableNearbyPoints) {
						const direction = Vector2.DIRECTIONS[getDirectionFromMovement(point.x - standableNearbyPoint.x, point.y - standableNearbyPoint.y)];

						// act like we are fishing from this tile
						const targetX = standableNearbyPoint.x + (direction.x * (this.options?.fishingRange ?? 1));
						const targetY = standableNearbyPoint.y + (direction.y * (this.options?.fishingRange ?? 1));

						const targetTile = context.island.getTile(targetX, targetY, point.z);
						const targetTileType = TileHelpers.getType(targetTile);
						const targetTerrainDescription = Terrains[targetTileType];
						if (targetTerrainDescription?.shallowWater || !targetTerrainDescription?.water) {
							return false;
						}

						const targetTileData = context.island.getTileData(targetX, targetY, point.z);
						if (targetTileData && !targetTileData[0].fishAvailable) {
							return false;
						}

						targetPoints.push({ x: targetX, y: targetY, z: point.z });

						// console.warn(targetX, targetY, this.options?.fishingRange, targetTileData?.[0]?.fishAvailable);
					}

					// verify the target points are actually fishable. this should be the most expensive check
					for (const targetPoint of targetPoints) {
						const checkTiles = 16;
						const fillCount = context.island.checkWaterFill(targetPoint.x, targetPoint.y, targetPoint.z, checkTiles, WaterType.None);
						if (fillCount < checkTiles) {
							return false;
						}
					}

					break;
			}

			if (navigation.isDisabledFromPoint(point)) {
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
