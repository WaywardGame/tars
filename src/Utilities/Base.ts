import { IBase } from "../ITars";
import { IDoodad } from "doodad/IDoodad";
import { IVector3 } from "utilities/math/IVector";
import { ITile } from "tile/ITerrain";
import { isOpenTile } from "./Tile";
import { IContainer } from "item/IItem";

const nearBaseDistance = 10;

export function isGoodBuildTile(base: IBase, point: IVector3, tile: ITile): boolean {
	return isOpenArea(point, tile) && isNearBase(base, point);
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
