import { IStat, Stat } from "entity/IStats";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import Idle from "./Idle";
import Rest from "./Rest";

export default class RecoverStamina extends Objective {
	
	public getHashCode(): string {
		return "RecoverStamina";
	}
	
	public async onExecute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (localPlayer.status.Poisoned || localPlayer.status.Burned) {
			if (localPlayer.getStat<IStat>(Stat.Stamina).value <= 1) {
				// emergency. wait it out
				this.log.info("Emergency idling");
				return new Idle(false);
			}

			return ObjectiveStatus.Complete;
		}

		if (localPlayer.getStat<IStat>(Stat.Hunger).value <=0 || localPlayer.getStat<IStat>(Stat.Thirst).value <=0) {
			this.log.info("Can't rest now");
			return ObjectiveStatus.Complete;
		}
		
		return new Rest();
	}

}
