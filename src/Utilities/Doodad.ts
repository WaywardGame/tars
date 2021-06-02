import Doodad from "game/doodad/Doodad";
import Doodads from "game/doodad/Doodads";
import { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import Enums from "utilities/enum/Enums";

class DoodadUtilities {

	public getDoodadTypes(doodadTypeOrGroup: DoodadType | DoodadTypeGroup): Set<DoodadType> {
		const doodadTypes: Set<DoodadType> = new Set();
		if (doodadManager.isGroup(doodadTypeOrGroup)) {
			for (const dt of Enums.values(DoodadType)) {
				const doodadDescription = Doodads[dt];
				if (!doodadDescription) {
					continue;
				}

				if (doodadManager.isInGroup(dt, doodadTypeOrGroup)) {
					doodadTypes.add(dt);
				}

				const lit = doodadDescription.lit;
				if (lit !== undefined) {
					const litDoodadDescription = Doodads[lit];
					if (litDoodadDescription && doodadManager.isInGroup(lit, doodadTypeOrGroup)) {
						doodadTypes.add(dt);
					}
				}

				const revert = doodadDescription.revert;
				if (revert !== undefined) {
					const revertDoodadDescription = Doodads[revert];
					if (revertDoodadDescription && doodadManager.isInGroup(revert, doodadTypeOrGroup)) {
						doodadTypes.add(dt);
					}
				}
			}

		} else {
			doodadTypes.add(doodadTypeOrGroup);
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

}

export const doodadUtilities = new DoodadUtilities();