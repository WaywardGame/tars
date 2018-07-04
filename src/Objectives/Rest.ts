import { ActionType, SentenceCaseStyle } from "Enums";
import { IObjective, ObjectiveStatus } from "../IObjective";
import Objective from "../Objective";
import ExecuteAction from "./ExecuteAction";
import Idle from "./Idle";
import { getNearbyCreature } from "../Utilities/Object";
import { getInventoryItemsWithUse } from "../Utilities/Item";

export default class Rest extends Objective {
	
	public getHashCode(): string {
		return "Rest";
	}
	
	public async onExecute(): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (localPlayer.swimming) {
			return ObjectiveStatus.Complete;
		}

		const nearbyCreature = getNearbyCreature(localPlayer);
		if (nearbyCreature !== undefined) {
			this.log.info(`Idling until the nearby ${game.getName(nearbyCreature, SentenceCaseStyle.None, false)} moves away.`);
			return new Idle(false);
		}

		const item = getInventoryItemsWithUse(ActionType.Rest)[0];
		if (item) {
			return new ExecuteAction(ActionType.Sleep, {
				item: item
			});
		}

		return new ExecuteAction(ActionType.Rest);
	}

}
