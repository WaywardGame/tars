import { ActionType } from "action/IAction";
import { } from "Enums";
import { IObjective, ObjectiveStatus } from "../IObjective";
import Objective from "../Objective";
import { getInventoryItemsWithUse } from "../Utilities/Item";
import { getNearbyCreature } from "../Utilities/Object";
import ExecuteAction from "./ExecuteAction";
import Idle from "./Idle";

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
			this.log.info(`Idling until the nearby ${nearbyCreature.getName(false).getString()} moves away.`);
			return new Idle(false);
		}

		const item = getInventoryItemsWithUse(ActionType.Rest)[0];
		if (item) {
			return new ExecuteAction(ActionType.Sleep, action => action.execute(localPlayer, item));
		}

		return new ExecuteAction(ActionType.Rest, action => action.execute(localPlayer));
	}

}
