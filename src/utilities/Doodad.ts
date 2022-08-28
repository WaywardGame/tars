import type Doodad from "game/doodad/Doodad";
import Doodads from "game/doodad/Doodads";
import type { DoodadTypeGroup } from "game/doodad/IDoodad";
import { DoodadType } from "game/doodad/IDoodad";
import Enums from "utilities/enum/Enums";
import DoodadManager from "game/doodad/DoodadManager";

export class DoodadUtilities {

	public getDoodadTypes(doodadTypeOrGroup: DoodadType | DoodadTypeGroup, includeLitAndRevert?: boolean): Set<DoodadType> {
		const doodadTypes: Set<DoodadType> = new Set();
		if (DoodadManager.isGroup(doodadTypeOrGroup)) {
			for (const dt of Enums.values(DoodadType)) {
				const doodadDescription = Doodads[dt];
				if (!doodadDescription) {
					continue;
				}

				if (DoodadManager.isInGroup(dt, doodadTypeOrGroup)) {
					doodadTypes.add(dt);
				}

				const lit = doodadDescription.lit;
				if (lit !== undefined) {
					const litDoodadDescription = Doodads[lit];
					if (litDoodadDescription && DoodadManager.isInGroup(lit, doodadTypeOrGroup)) {
						doodadTypes.add(dt);
					}
				}

				const revert = doodadDescription.revert;
				if (revert !== undefined) {
					const revertDoodadDescription = Doodads[revert];
					if (revertDoodadDescription && DoodadManager.isInGroup(revert, doodadTypeOrGroup)) {
						doodadTypes.add(dt);
					}
				}
			}

		} else {
			doodadTypes.add(doodadTypeOrGroup);

			if (includeLitAndRevert) {
				const doodadDescription = Doodads[doodadTypeOrGroup];
				if (doodadDescription) {
					const lit = doodadDescription.lit;
					if (lit !== undefined) {
						const litDoodadDescription = Doodads[lit];
						if (litDoodadDescription) {
							doodadTypes.add(lit);
						}
					}

					const revert = doodadDescription.revert;
					if (revert !== undefined) {
						const revertDoodadDescription = Doodads[revert];
						if (revertDoodadDescription) {
							doodadTypes.add(revert);
						}
					}
				}
			}
		}

		return doodadTypes;
	}

	public isWaterStillDesalinating(waterStill: Doodad) {
		return (waterStill.decay !== undefined
			&& waterStill.decay > 0
			&& waterStill.gatherReady !== undefined
			&& waterStill.gatherReady > 0
			&& waterStill.description()?.providesFire) ? true : false;
	}

	public isWaterStillDrinkable(waterStill: Doodad) {
		return waterStill.gatherReady !== undefined && waterStill.gatherReady <= 0;
	}

	public requiresFire(doodadTypeOrGroup: DoodadType | DoodadTypeGroup) {
		const description = Doodads[doodadTypeOrGroup];
		if (description && description.lit !== undefined) {
			if (DoodadManager.isGroup(doodadTypeOrGroup)) {
				const litDescription = Doodads[description.lit];
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