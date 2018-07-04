import Doodads from "doodad/Doodads";
import { DoodadType, DoodadTypeGroup } from "Enums";
import Enums from "utilities/enum/Enums";

let path: string;

export function getPath() {
	return path;
}

export function setPath(p: string) {
	path = p;
}

export function getDoodadTypes(doodadTypeOrGroup: DoodadType | DoodadTypeGroup): DoodadType[] {
	const doodadTypes: DoodadType[] = [];

	if (doodadManager.isDoodadTypeGroup(doodadTypeOrGroup)) {
		for (const dt of Enums.values(DoodadType)) {
			const doodadDescription = Doodads[dt];
			if (!doodadDescription) {
				continue;
			}

			if (doodadDescription.group === doodadTypeOrGroup) {
				doodadTypes.push(dt);
			}

			const lit = doodadDescription.lit;
			if (lit !== undefined) {
				const litDoodadDescription = Doodads[lit];
				if (litDoodadDescription && litDoodadDescription.group === doodadTypeOrGroup) {
					doodadTypes.push(dt);
				}
			}

			const revert = doodadDescription.revert;
			if (revert !== undefined) {
				const revertDoodadDescription = Doodads[revert];
				if (revertDoodadDescription && revertDoodadDescription.group === doodadTypeOrGroup) {
					doodadTypes.push(dt);
				}
			}
		}

	} else {
		doodadTypes.push(doodadTypeOrGroup);
	}

	return doodadTypes;
}
