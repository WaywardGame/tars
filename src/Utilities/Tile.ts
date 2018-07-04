import Terrains from "tile/Terrains";
import TileHelpers from "utilities/TileHelpers";
import { IVector3 } from "utilities/math/IVector";
import { ITile } from "tile/ITerrain";
import { getNavigation } from "../Navigation";
import { ITileLocation } from "../ITars";
import { TerrainType } from "Enums";

export async function getNearestTileLocation(tileType: TerrainType, position: IVector3): Promise<ITileLocation[]> {
	return getNavigation().getNearestTileLocation(tileType, position);
}

export function isOpenTile(point: IVector3, tile: ITile, ignoreLocalPlayer: boolean = true, allowWater: boolean = true): boolean {
	if (tile.creature !== undefined) {
		return false;
	}

	if (tile.doodad !== undefined) {
		return false;
	}

	const terrainType = TileHelpers.getType(tile);
	const terrainInfo = Terrains[terrainType];
	if (terrainInfo) {
		if (!terrainInfo.passable && !terrainInfo.water) {
			return false;
		}

		if (!allowWater && (terrainInfo.water || terrainInfo.shallowWater)) {
			return false;
		}
	}

	const players = game.getPlayersAtPosition(point.x, point.y, point.z, false, true);
	if (players.length > 0) {
		for (const player of players) {
			if (player !== localPlayer || (!ignoreLocalPlayer && player === localPlayer)) {
				return false;
			}
		}
	}

	return true;
}
