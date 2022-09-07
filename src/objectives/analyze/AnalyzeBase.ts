import type Doodad from "game/doodad/Doodad";
import TileHelpers from "utilities/game/TileHelpers";
import type { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";

import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import type { BaseInfoKey } from "../../core/ITars";
import { baseInfo } from "../../core/ITars";

const baseDoodadDistanceSq = Math.pow(50, 2);

export default class AnalyzeBase extends Objective {

	public getIdentifier(): string {
		return "AnalyzeBase";
	}

	public getStatus(): string | undefined {
		return "Analyzing base";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.calculatingDifficulty) {
			return 0;
		}

		let changed = false;

		const keys = Object.keys(baseInfo) as BaseInfoKey[];
		for (const key of keys) {
			const info = baseInfo[key];

			const doodads = context.base[key] = context.base[key]
				.filter(doodad => {
					// verify the existing base doodad is still valid
					// maybe we messed up some tiles next to it since when we placed it
					if (!doodad.isValid() || !context.utilities.base.matchesBaseInfo(context, info, doodad.type, doodad)) {
						changed = true;
						this.log.info(`"${key}" was removed`);

						context.utilities.navigation.refreshOverlay(doodad.getTile(), doodad.x, doodad.y, doodad.z, false);

						return false;
					}

					return true;
				});

			if (doodads.length === 0 || info.allowMultiple) {
				let targets: Doodad[];

				const placeNear = info.tryPlaceNear;
				if (placeNear !== undefined && context.base[placeNear].length > 0) {
					targets = [];

					const nearDoodads = context.base[placeNear];
					const possiblePoints = AnalyzeBase.getNearPointsFromDoodads(nearDoodads);

					for (const point of possiblePoints) {
						const tile = context.island.getTileFromPoint(point);
						const doodad = tile.doodad;
						if (doodad && context.utilities.base.matchesBaseInfo(context, info, doodad.type, doodad)) {
							targets.push(doodad);
						}
					}

				} else {
					// UUID for the key in order to ensure this always does a fresh scan
					targets = info.findTargets ?
						info.findTargets(context) :
						context.utilities.object.findDoodads(context, `${this.getIdentifier()}:${this.getUniqueIdentifier()}`, doodad => doodad.builderIdentifier !== undefined && context.utilities.base.matchesBaseInfo(context, info, doodad.type, doodad));
				}

				for (const target of targets) {
					if (!info.canAdd || info.canAdd(context, target)) {
						const distance = Vector2.squaredDistance(context.getPosition(), target);
						if (distance < (info.nearBaseDistanceSq ?? baseDoodadDistanceSq) && !context.base[key].includes(target)) {
							changed = true;

							context.base[key].push(target);

							this.log.info(`Found "${key}" - ${target} (distance: ${Math.round(distance)})`);

							info.onAdd?.(context, target);

							context.utilities.navigation.refreshOverlay(target.getTile(), target.x, target.y, target.z, true);

							if (!info.allowMultiple) {
								break;
							}
						}
					}
				}
			}
		}

		if (changed) {
			let availableUnlimitedWellLocation: IVector3 | undefined;

			const baseDoodads = context.utilities.base.getBaseDoodads(context);
			for (const baseDoodad of baseDoodads) {
				const unlimitedWellTile = TileHelpers.findMatchingTile(context.island, baseDoodad, (_, point, tile) => context.utilities.base.isGoodWellBuildTile(context, point, tile, true), { maxTilesChecked: 50 });
				if (unlimitedWellTile) {
					availableUnlimitedWellLocation = unlimitedWellTile;
					break;
				}
			}

			if (availableUnlimitedWellLocation !== undefined) {
				if (context.base.availableUnlimitedWellLocation === undefined || (
					context.base.availableUnlimitedWellLocation.x !== availableUnlimitedWellLocation.x ||
					context.base.availableUnlimitedWellLocation.y !== availableUnlimitedWellLocation.y ||
					context.base.availableUnlimitedWellLocation.z !== availableUnlimitedWellLocation.z)) {
					context.base.availableUnlimitedWellLocation = availableUnlimitedWellLocation;
					this.log.info(`Found unlimited well location (${context.base.availableUnlimitedWellLocation.x}, ${context.base.availableUnlimitedWellLocation.y}, ${context.base.availableUnlimitedWellLocation.z})`);
				}

			} else if (context.base.availableUnlimitedWellLocation !== undefined) {
				context.base.availableUnlimitedWellLocation = undefined;
				this.log.info("Lost unlimited well location");
			}

			context.utilities.base.clearCache();

			// execute it again.
			// one of the doodads might need to be near another - but depending on the ordering it might be get set yet
			await this.execute(context);
		}

		return ObjectiveResult.Ignore;
	}

	public static getNearPointsFromDoodads(doodads: Doodad[]) {
		return doodads.map(doodad => this.getNearPoints(doodad)).flat();
	}

	public static getNearPoints(point: IVector3): IVector3[] {
		return [
			{ x: point.x, y: point.y + 2, z: point.z },
			{ x: point.x, y: point.y - 2, z: point.z },
			{ x: point.x + 2, y: point.y, z: point.z },
			{ x: point.x - 2, y: point.y, z: point.z },
		];
	}

}
