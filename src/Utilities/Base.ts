import { IBase } from "../ITars";
import { TerrainType, WorldZ } from "Enums";
import { IDoodad } from "doodad/IDoodad";
import { IVector3 } from "utilities/math/IVector";
import { ITile } from "tile/ITerrain";
import { isOpenTile } from "./Tile";
import { IContainer } from "item/IItem";
import { findDoodad } from "./Object";
import TileHelpers from "utilities/TileHelpers";
import Terrains from "tile/Terrains";

const nearBaseDistance = 12;

export function findBuildTile(hashCode: string, base: IBase, targetOrigin?: IVector3): IVector3 | undefined {
	const isValidOrigin = (origin: IVector3) => {
		// build our base near dirt and trees
		let dirt = 0;
		let grass = 0;

		for (let x = -6; x <= 6; x++) {
			for (let y = -6; y <= 6; y++) {
				if (x === 0 && y === 0) {
					continue;
				}

				const point: IVector3 = {
					x: origin.x + x,
					y: origin.y + y,
					z: origin.z
				};

				const tile = game.getTileFromPoint(point);
				if (!tile.doodad && isGoodBuildTile(base, point, tile)) {
					const tileType = TileHelpers.getType(tile);
					if (tileType === TerrainType.Dirt) {
						dirt++;

					} else if (tileType === TerrainType.Grass) {
						grass++;
					}
				}
			}
		}

		return dirt >= 3 && grass >= 4;
	};

	if (targetOrigin === undefined) {
		targetOrigin = findDoodad(hashCode, doodad => {
			const description = doodad.description();
			if (!description || !description.isTree) {
				return false;
			}

			return isValidOrigin(doodad);
		});

	} else if (!isValidOrigin(targetOrigin)) {
		return undefined;
	}

	if (targetOrigin === undefined) {
		return undefined;
	}

	let target: IVector3 | undefined;

	for (let x = -6; x <= 6; x++) {
		for (let y = -6; y <= 6; y++) {
			if (x === 0 && y === 0) {
				continue;
			}

			const point: IVector3 = {
				x: targetOrigin.x + x,
				y: targetOrigin.y + y,
				z: targetOrigin.z
			};

			const tile = game.getTileFromPoint(point);
			if (isGoodBuildTile(base, point, tile)) {
				target = point;
				x = 7;
				break;
			}
		}
	}

	return target;
}

export function isGoodBuildTile(base: IBase, point: IVector3, tile: ITile): boolean {
	return isOpenArea(point, tile) && isNearBase(base, point);
}

export function isGoodWellBuildTile(base: IBase, point: IVector3, tile: ITile, onlyUnlimited: boolean): boolean {
	if (!isGoodBuildTile(base, point, tile)) {
		return false;
	}
	
	// only place wells down on fresh water tiles
	const x = point.x;
	const y = point.y;
	
	for (let x2 = x - 6; x2 <= x + 6; x2++) {
		for (let y2 = y - 6; y2 <= y + 6; y2++) {
			const tileDescription = Terrains[TileHelpers.getType(game.getTile(x2, y2, point.z))];
			if (tileDescription && (tileDescription.water && !tileDescription.freshWater)) {
				// seawater well
				return false;
			}
		}
	}
	
	const caveTerrain = Terrains[TileHelpers.getType(game.getTile(x, y, WorldZ.Cave))];
	if (point.z === WorldZ.Cave || (caveTerrain && (caveTerrain.water || caveTerrain.shallowWater))) {
		return true;

	} else if (caveTerrain && !caveTerrain.passable && !onlyUnlimited) {
		return true;
	}
		
	return false;
}

export function isOpenArea(point: IVector3, tile: ITile): boolean {
	if (!isOpenTile(point, tile, false, false) || tile.corpses !== undefined) {
		return false;
	}

	for (let x = -1; x <= 1; x++) {
		for (let y = -1; y <= 1; y++) {
			const nearbyPoint: IVector3 = {
				x: point.x + x,
				y: point.y + y,
				z: point.z
			};

			const nearbyTile = game.getTileFromPoint(nearbyPoint);
			if (nearbyTile.doodad) {
				return false;
			}

			const container = tile as IContainer;
			if (container.containedItems && container.containedItems.length > 0) {
				return false;
			}

			if (!isOpenTile(nearbyPoint, nearbyTile) || game.isTileFull(nearbyTile)) {
				return false;
			}
		}
	}

	return true;
}

export function getBaseDoodads(base: IBase): IDoodad[] {
	let doodads: IDoodad[] = [];

	for (const key of Object.keys(base)) {
		const baseDoodadOrDoodads: IDoodad | IDoodad[] = (base as any)[key];
		if (Array.isArray(baseDoodadOrDoodads)) {
			doodads = doodads.concat(baseDoodadOrDoodads);

		} else {
			doodads.push(baseDoodadOrDoodads);
		}
	}

	return doodads;
}

export function isBaseDoodad(base: IBase, doodad: IDoodad) {
	return Object.keys(base).findIndex(key => {
		const baseDoodadOrDoodads: IDoodad | IDoodad[] = (base as any)[key];
		if (Array.isArray(baseDoodadOrDoodads)) {
			return baseDoodadOrDoodads.indexOf(doodad) !== -1;
		}

		return baseDoodadOrDoodads === doodad;
	}) !== -1;
}

export function getBasePosition(base: IBase): IVector3 {
	return base.campfire || base.waterStill || base.kiln || localPlayer;
}

export function hasBase(base: IBase): boolean {
	return Object.keys(base).findIndex(key => {
		const baseDoodadOrDoodads: IDoodad | IDoodad[] = (base as any)[key];
		if (Array.isArray(baseDoodadOrDoodads)) {
			return baseDoodadOrDoodads.length > 0;
		}

		return baseDoodadOrDoodads !== undefined;
	}) !== -1;
}

export function isNearBase(base: IBase, point: IVector3): boolean {
	if (!hasBase(base)) {
		return true;
	}

	for (let x = -nearBaseDistance; x <= nearBaseDistance; x++) {
		for (let y = -nearBaseDistance; y <= nearBaseDistance; y++) {
			const nearbyPoint: IVector3 = {
				x: point.x + x,
				y: point.y + y,
				z: point.z
			};

			const nearbyTile = game.getTileFromPoint(nearbyPoint);
			const doodad = nearbyTile.doodad;
			if (doodad && isBaseDoodad(base, doodad)) {
				return true;
			}
		}
	}

	return false;
}
