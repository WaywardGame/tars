import Doodad from "game/doodad/Doodad";
import doodadDescriptions from "game/doodad/Doodads";
import { DoodadType } from "game/doodad/IDoodad";
import TileHelpers from "utilities/game/TileHelpers";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { baseInfo, BaseInfoKey, IBaseInfo } from "../../ITars";
import Objective from "../../Objective";
import { baseUtilities } from "../../utilities/Base";
import { objectUtilities } from "../../utilities/Object";

const baseDoodadDistanceSq = Math.pow(150, 2);

export default class AnalyzeBase extends Objective {

	public getIdentifier(): string {
		return "AnalyzeBase";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.calculatingDifficulty) {
			return 0;
		}

		let changed = false;

		const keys = Object.keys(baseInfo) as BaseInfoKey[];
		for (const key of keys) {
			const doodads = context.base[key] = context.base[key]
				.filter(doodad => {
					if (!doodad.isValid()) {
						changed = true;
						this.log.info(`"${key}" was removed`);
						return false;
					}

					return true;
				});

			const info = baseInfo[key];
			if (doodads.length === 0 || info.allowMultiple) {
				let targets: Doodad[];

				const placeNear = info.tryPlaceNear;
				if (placeNear !== undefined) {
					targets = [];

					const nearDoodads = context.base[placeNear];
					const possiblePoints = AnalyzeBase.getNearPoints(nearDoodads);

					for (const point of possiblePoints) {
						const tile = game.getTileFromPoint(point);
						const doodad = tile.doodad;
						if (doodad && AnalyzeBase.matchesBaseInfo(info, doodad.type)) {
							targets.push(doodad);
						}
					}

				} else {
					targets = info.findTargets ?
						info.findTargets(context.base) :
						objectUtilities.findDoodads(context, key, doodad => doodad.ownerIdentifier !== undefined && AnalyzeBase.matchesBaseInfo(info, doodad.type));
				}

				for (const target of targets) {
					if (!info.canAdd || info.canAdd(context.base, target)) {
						const distance = Vector2.squaredDistance(context.getPosition(), target);
						if (distance < baseDoodadDistanceSq && context.base[key].indexOf(target) === -1) {
							changed = true;

							context.base[key].push(target);

							this.log.info(`Found "${key}" - ${target} (distance: ${Math.round(distance)})`);

							if (info.onAdd) {
								info.onAdd(context.base, target);
							}

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

			const baseDoodads = baseUtilities.getBaseDoodads(context);
			for (const baseDoodad of baseDoodads) {
				const unlimitedWellTile = TileHelpers.findMatchingTile(baseDoodad, (point, tile) => baseUtilities.isGoodWellBuildTile(context, point, tile, true), { maxTilesChecked: 50 });
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

			baseUtilities.clearCache();

			// execute it again.
			// one of the doodads might need to be near another - but depending on the ordering it might be get set yet
			await this.execute(context);
		}

		return ObjectiveResult.Ignore;
	}

	public static getNearPoints(doodads: Doodad[]) {
		const points: IVector3[] = [];

		for (const doodad of doodads) {
			points.push(...[
				{ x: doodad.x, y: doodad.y + 2, z: doodad.z },
				{ x: doodad.x, y: doodad.y - 2, z: doodad.z },
				{ x: doodad.x + 2, y: doodad.y, z: doodad.z },
				{ x: doodad.x - 2, y: doodad.y, z: doodad.z },
			]);
		}

		return points;
	}

	public static matchesBaseInfo(info: IBaseInfo, doodadType: DoodadType): boolean {
		const doodadDescription = doodadDescriptions[doodadType];
		if (!doodadDescription) {
			return false;
		}

		if (info.doodadTypes) {
			for (const doodadTypeOrGroup of info.doodadTypes) {
				if (doodadManager.isGroup(doodadTypeOrGroup)) {
					if (doodadManager.isInGroup(doodadType, doodadTypeOrGroup)) {
						return true;
					}

					if (doodadDescription.group && doodadDescription.group.includes(doodadTypeOrGroup)) {
						return true;
					}

				} else if (doodadTypeOrGroup === doodadType) {
					return true;
				}
			}
		}

		if (info.litType !== undefined && doodadDescription.lit !== undefined) {
			const litDescription = doodadDescriptions[doodadDescription.lit];
			if (litDescription && doodadManager.isInGroup(doodadDescription.lit, info.litType)) {
				return true;
			}
		}

		return false;
	}
}
