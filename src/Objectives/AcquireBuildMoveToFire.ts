import { IDoodad } from "doodad/IDoodad";
import { ItemType, ItemTypeGroup } from "Enums";
import Vector2 from "utilities/math/Vector2";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import AcquireItem from "./AcquireItem";
import BuildItem from "./BuildItem";
import StartFire from "./StartFire";
import AcquireItemByGroup from "./AcquireItemByGroup";

export default class AcquireBuildMoveToFire extends Objective {

	public getHashCode(): string {
		return "AcquireBuildMoveToFire";
	}
	
	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const doodads: IDoodad[] = ([base.campfire, base.kiln].filter(d => d !== undefined) as IDoodad[]).sort((a, b) => Vector2.squaredDistance(localPlayer, a) > Vector2.squaredDistance(localPlayer, b) ? 1 : -1);
		const doodad = doodads[0];

		if (calculateDifficulty) {
			const objectives: IObjective[] = [];

			if (!doodad) {
				objectives.push(new AcquireItem(ItemType.StoneCampfire));
				objectives.push(new BuildItem(undefined!));
			}

			if (!doodad || doodad.decay === undefined) {
				objectives.push(new StartFire(doodad));
			}

			const doodadDistance = doodad ? Math.round(Vector2.squaredDistance(localPlayer, doodad)) : 0;
			return doodadDistance + await this.calculateObjectiveDifficulties(base, inventory, ...objectives);
		}

		if (!doodad) {
			const inventoryItem = itemManager.getItemInInventoryByGroup(localPlayer, ItemTypeGroup.Campfire);
			if (inventoryItem !== undefined) {
				return new BuildItem(inventoryItem);
			}

			return new AcquireItemByGroup(ItemTypeGroup.Campfire);
		}

		const description = doodad.description();
		if (!description) {
			return ObjectiveStatus.Complete;
		}

		return new StartFire(doodad);
	}

}
