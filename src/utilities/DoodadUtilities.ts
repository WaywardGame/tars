import type Doodad from "@wayward/game/game/doodad/Doodad";
import { doodadDescriptions } from "@wayward/game/game/doodad/Doodads";
import type { DoodadTypeGroup } from "@wayward/game/game/doodad/IDoodad";
import { DoodadType } from "@wayward/game/game/doodad/IDoodad";
import Enums from "@wayward/game/utilities/enum/Enums";
import DoodadManager from "@wayward/game/game/doodad/DoodadManager";

export class DoodadUtilities {

	public getDoodadTypes(doodadTypeOrGroup: DoodadType | DoodadTypeGroup, includeLitAndRevert?: boolean): Set<DoodadType> {
		const doodadTypes = new Set<DoodadType>();
		if (DoodadManager.isGroup(doodadTypeOrGroup)) {
			for (const dt of Enums.values(DoodadType)) {
				const doodadDescription = doodadDescriptions[dt];
				if (!doodadDescription) {
					continue;
				}

				if (DoodadManager.isInGroup(dt, doodadTypeOrGroup)) {
					doodadTypes.add(dt);
				}

				const lit = doodadDescription.lit;
				if (lit !== undefined) {
					const litDoodadDescription = doodadDescriptions[lit];
					if (litDoodadDescription && DoodadManager.isInGroup(lit, doodadTypeOrGroup)) {
						doodadTypes.add(dt);
					}
				}

				const revert = doodadDescription.revert;
				if (revert !== undefined) {
					const revertDoodadDescription = doodadDescriptions[revert];
					if (revertDoodadDescription && DoodadManager.isInGroup(revert, doodadTypeOrGroup)) {
						doodadTypes.add(dt);
					}
				}
			}

		} else {
			doodadTypes.add(doodadTypeOrGroup);

			if (includeLitAndRevert) {
				const doodadDescription = doodadDescriptions[doodadTypeOrGroup];
				if (doodadDescription) {
					const lit = doodadDescription.lit;
					if (lit !== undefined) {
						const litDoodadDescription = doodadDescriptions[lit];
						if (litDoodadDescription) {
							doodadTypes.add(lit);
						}
					}

					const revert = doodadDescription.revert;
					if (revert !== undefined) {
						const revertDoodadDescription = doodadDescriptions[revert];
						if (revertDoodadDescription) {
							doodadTypes.add(revert);
						}
					}
				}
			}
		}

		return doodadTypes;
	}

	/**
	 * Checks if a drip stone is dripping / a water still is stilling
	 */
	public isWaterSourceDoodadBusy(waterSource: Doodad): boolean {
		if (waterSource.hasWater?.top) {
			return true;
		}

		if (waterSource.decay !== undefined &&
			waterSource.decay > 0 &&
			waterSource.gatherReady !== undefined &&
			waterSource.gatherReady > 0 &&
			waterSource.description?.providesFire) {
			return true;
		}

		return false;
	}

	public isWaterSourceDoodadDrinkable(waterStill: Doodad): boolean {
		return waterStill.gatherReady !== undefined && waterStill.gatherReady <= 0;
	}

	public requiresFire(doodadTypeOrGroup: DoodadType | DoodadTypeGroup): boolean {
		const description = doodadDescriptions[doodadTypeOrGroup];
		if (description?.lit !== undefined) {
			if (DoodadManager.isGroup(doodadTypeOrGroup)) {
				const litDescription = doodadDescriptions[description.lit];
				if (litDescription && DoodadManager.isInGroup(description.lit, doodadTypeOrGroup)) {
					return true;
				}

			} else if (description.lit === doodadTypeOrGroup) {
				return true;
			}
		}

		return false;
	}
}
